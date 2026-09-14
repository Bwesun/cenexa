import { body, query } from "express-validator";

export const fundInitializationValidator = [
    body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a valid number")
    // amount must be greater than 500
    .custom((value) => value > 500)
    .withMessage("Amount must be greater than 500"),

    body("description")
    .trim()
    .optional()
]

export const fundVerifyValidator = [
    query("reference")
    .trim()
    .notEmpty()
    .withMessage("Reference is required")
]