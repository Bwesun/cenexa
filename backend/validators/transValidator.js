import { ExpressValidator } from "express-validator";
import { body, query, param } from "express-validator";

// validate get transactions query parameters
export const getTransactionsValidator = [
    query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
    query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100"),
    query("type")
    .optional()
    .isIn(["credit", "debit"])
    .withMessage("Type must be either 'credit' or 'debit'")
]

// validate transaction ID parameter for routes that require transaction ID as a parameter
export const transactionIdValidator = [
    param("transactionId")
    .notEmpty()
    .withMessage("Transaction ID is required")
    .isMongoId()
    .withMessage("Invalid Transaction ID format")
]