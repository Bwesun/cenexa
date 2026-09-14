import importQuestionsFromCSV from "../services/questionImport.service.js";

export const uploadQuestions = async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded or invalid file format."
            });
        }

        const result =
            await importQuestionsFromCSV(

                req.file.path,

                req.params.examId,

                req.user

            );

        if (!result.success) {

            return res.status(400).json(result);

        }

        return res.json(result);

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};