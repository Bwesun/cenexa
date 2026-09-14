import { body, param, query } from "express-validator";
import { emailValidator, phoneNumberValidator, passwordValidator, stringValidator, ranNoValidator, assoConfValidator } from "./validators.js";

// registration validator
export const registerValidator = [
    ...stringValidator("name"),
    ...emailValidator,
    ...phoneNumberValidator,
    ...passwordValidator,
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["candidate", "admin", "examiner"])
      .withMessage("Invalid role specified"),
    ...ranNoValidator,
    ...assoConfValidator("association"),
    ...assoConfValidator("conference"),
];

// login validator
export const loginValidator = [
  ...ranNoValidator,
  ...passwordValidator,
];

// token validator for protected routes
export const tokenValidator = [
  query("token")
    .notEmpty()
    .withMessage("Token is required")
];

// password reset validator
export const passwordResetValidator = [
    body("newPassword")
  .isStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  .withMessage(
    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one symbol"
  ),
  query("token")
    .notEmpty()
    .withMessage("Password reset token is required")
]