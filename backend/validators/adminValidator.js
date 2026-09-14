import { body, param, query } from "express-validator";
import { stringValidator } from "./validators.js";

// ============ USER MANAGEMENT VALIDATORS ============

// Get all users validator
export const getAllUsersValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100"),
    query("role")
        .optional()
        .isIn(["admin", "individual", "business"])
        .withMessage("Role must be 'admin', 'individual', or 'business'"),
    query("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be 'active' or 'inactive'"),
];

// User ID parameter validator
export const userIdParamValidator = [
    param("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isMongoId()
        .withMessage("Invalid User ID format"),
];

// Update user role validator
export const updateUserRoleValidator = [
    ...userIdParamValidator,
    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "individual", "business"])
        .withMessage("Role must be 'admin', 'individual', or 'business'"),
];

// Update user status validator
export const updateUserStatusValidator = [
    ...userIdParamValidator,
    body("isActive")
        .notEmpty()
        .withMessage("Status is required")
        .isBoolean()
        .withMessage("Status must be a boolean"),
];

// Update user profile validator
export const updateUserProfileValidator = [
    ...userIdParamValidator,
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty"),
    body("phone")
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage("Valid phone number required"),
    body("address")
        .optional()
        .trim(),
    body("avatar")
        .optional()
        .trim()
        .isURL()
        .withMessage("Avatar must be a valid URL"),
];

// ============ TRANSACTION MANAGEMENT VALIDATORS ============

// Get all transactions validator
export const getTransactionsAdminValidator = [
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
        .withMessage("Type must be 'credit' or 'debit'"),
    query("status")
        .optional()
        .isIn(["pending", "completed", "failed"])
        .withMessage("Status must be 'pending', 'completed', or 'failed'"),
    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid ISO date"),
    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid ISO date"),
];

// Transaction ID parameter validator
export const transactionIdParamValidator = [
    param("transactionId")
        .notEmpty()
        .withMessage("Transaction ID is required")
        .isMongoId()
        .withMessage("Invalid Transaction ID format"),
];

// Update transaction status validator
export const updateTransactionStatusValidator = [
    ...transactionIdParamValidator,
    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["pending", "completed", "failed"])
        .withMessage("Status must be 'pending', 'completed', or 'failed'"),
];

// ============ WALLET MANAGEMENT VALIDATORS ============

// Get all wallets validator
export const getAllWalletsValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100"),
    query("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be 'active' or 'inactive'"),
];

// Update wallet balance validator
export const updateWalletBalanceValidator = [
    ...userIdParamValidator,
    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ min: 0 })
        .withMessage("Amount must be a positive number"),
    body("operation")
        .notEmpty()
        .withMessage("Operation is required")
        .isIn(["set", "add", "subtract"])
        .withMessage("Operation must be 'set', 'add', or 'subtract'"),
];

// ============ VERIFICATION MANAGEMENT VALIDATORS ============

// Approve/Reject NIN verification validator
export const ninVerificationValidator = [
    ...userIdParamValidator,
    body("verified")
        .notEmpty()
        .withMessage("Verified status is required")
        .isBoolean()
        .withMessage("Verified must be a boolean"),
    body("remarks")
        .optional()
        .trim(),
];

// Approve/Reject CAC verification validator
export const cacVerificationValidator = [
    ...userIdParamValidator,
    body("verified")
        .notEmpty()
        .withMessage("Verified status is required")
        .isBoolean()
        .withMessage("Verified must be a boolean"),
    body("remarks")
        .optional()
        .trim(),
];

// Approve/Reject account verification validator
export const accountVerificationValidator = [
    ...userIdParamValidator,
    body("verified")
        .notEmpty()
        .withMessage("Verified status is required")
        .isBoolean()
        .withMessage("Verified must be a boolean"),
    body("remarks")
        .optional()
        .trim(),
];

// ============ SYSTEM MANAGEMENT VALIDATORS ============

// Get report validator
export const getReportValidator = [
    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid ISO date"),
    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid ISO date"),
];
