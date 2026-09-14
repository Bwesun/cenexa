import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import Question from "../models/Questions.js";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => rows.push(row))
            .on("end", () => resolve(rows))
            .on("error", reject);
    });
};

const importQuestionsFromCSV = async (
    filePath,
    examId,
    user
) => {
    let session;

    try {
        const rows = await parseCSV(filePath);

        //----------------------------------------------------
        // Maximum row validation
        //----------------------------------------------------

        if (rows.length > 300) {
            throw new Error("Maximum upload limit is 300 questions.");
        }

        //----------------------------------------------------
        // Empty file validation
        //----------------------------------------------------

        if (rows.length === 0) {
            throw new Error("The uploaded CSV contains no questions.");
        }

        //----------------------------------------------------
        // Fetch existing questions once
        //----------------------------------------------------

        const existingQuestions = await Question.find(
            { exam: examId },
            { text: 1 }
        ).lean();

        const existingQuestionSet = new Set(
            existingQuestions
                .filter(q => q.text)
                .map(q => q.text.trim().toLowerCase())
        );

        const csvQuestions = new Set();
        const questions = [];
        const errors = [];

        //----------------------------------------------------
        // Validate CSV rows
        //----------------------------------------------------

        for (let i = 0; i < rows.length; i++) {

            const row = rows[i];
            const rowNumber = i + 2;

            //------------------------------------
            // Question
            //------------------------------------

            const questionText = row.Question?.trim();

            if (!questionText) {
                errors.push({
                    row: rowNumber,
                    error: "Question cannot be empty."
                });
                continue;
            }

            const normalizedQuestion =
                questionText.toLowerCase();

            //------------------------------------
            // Duplicate in Database
            //------------------------------------

            if (existingQuestionSet.has(normalizedQuestion)) {
                errors.push({
                    row: rowNumber,
                    error: "Question already exists for this exam."
                });
                continue;
            }

            //------------------------------------
            // Duplicate inside CSV
            //------------------------------------

            if (csvQuestions.has(normalizedQuestion)) {
                errors.push({
                    row: rowNumber,
                    error: "Duplicate question found in CSV."
                });
                continue;
            }

            //------------------------------------
            // Correct Answer
            //------------------------------------

            const correctAnswer =
                row["Correct Answer"]
                    ?.trim()
                    .toUpperCase();

            if (
                !correctAnswer ||
                !OPTION_LETTERS.includes(correctAnswer)
            ) {
                errors.push({
                    row: rowNumber,
                    error: "Invalid Correct Answer."
                });
                continue;
            }

            //------------------------------------
            // Build Options
            //------------------------------------

            const options = [];
            const optionSet = new Set();

            for (const letter of OPTION_LETTERS) {

                const value = row[`Option ${letter}`]?.trim();

                if (!value) continue;

                const normalizedOption =
                    value.toLowerCase();

                if (optionSet.has(normalizedOption)) {
                    errors.push({
                        row: rowNumber,
                        error: "Duplicate option detected."
                    });

                    options.length = 0;
                    break;
                }

                optionSet.add(normalizedOption);

                options.push({
                    text: value,
                    isCorrect: correctAnswer === letter
                });
            }

            if (options.length === 0) {
                continue;
            }

            //------------------------------------
            // Minimum options
            //------------------------------------

            if (options.length < 2) {
                errors.push({
                    row: rowNumber,
                    error: "A question must contain at least 2 options."
                });
                continue;
            }

            //------------------------------------
            // Exactly one correct answer
            //------------------------------------

            const correctCount =
                options.filter(x => x.isCorrect).length;

            if (correctCount !== 1) {
                errors.push({
                    row: rowNumber,
                    error: "Exactly one correct answer is required."
                });
                continue;
            }

            //------------------------------------
            // Passed validation
            //------------------------------------

            csvQuestions.add(normalizedQuestion);

            questions.push({
                text: questionText,
                options,
                exam: examId,
                createdBy: user.userId,
                organizationId: user.organizationId
            });
        }

        //----------------------------------------------------
        // Stop if validation errors exist
        //----------------------------------------------------

        if (errors.length > 0) {
            return {
                success: false,
                imported: 0,
                failed: errors.length,
                errors
            };
        }

        //----------------------------------------------------
        // Insert Questions
        //----------------------------------------------------

        session = await mongoose.startSession();

        session.startTransaction();

        await Question.insertMany(
            questions,
            { session }
        );

        await session.commitTransaction();

        return {
            success: true,
            imported: questions.length,
            failed: 0,
            errors: []
        };

    } catch (err) {

        if (session) {
            await session.abortTransaction();
        }

        throw err;

    } finally {

        if (session) {
            await session.endSession();
        }

        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (e) {
            console.error("Failed to delete uploaded CSV:", e.message);
        }
    }
};

export default importQuestionsFromCSV;