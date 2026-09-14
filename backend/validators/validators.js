import {body, param, query} from "express-validator";

// string validator/ name validator
export const stringValidator = (fieldName) => [
    body(fieldName)
      .trim()
      .notEmpty()
      .withMessage(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`)
];

export const assoConfValidator = (fieldName) => [
    body(fieldName)
      .trim()
      .optional({ checkFalsy: true })
      
];

// RAN Number validator
export const ranNoValidator = [
    body("ranNo")
    .trim()
    .notEmpty()
    .withMessage("RAN number is required")
    .isNumeric()
    .withMessage("RAN number must be numeric (e.g 0845, 1189)")
]

// password validator
export const passwordValidator = [
    body("password")
  .isStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  .withMessage(
    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one symbol"
  )
] 

// email validator
export const emailValidator = [
    body("email")
    .trim()
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email required")
]

// phone number validator
export const phoneNumberValidator = [
    body("phone")
    .trim()
    // can be optional but if provided must be a valid phone number
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage("Valid phone number is required")
]

// user ID validator for routes that require user ID as a parameter
export const userIdValidator = [
  param("user.userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID format")
];

// NIN Validator
export const ninValidator = [
    body("nin_number")
      .trim()
      .notEmpty()
      .withMessage("NIN number is required")
      .isNumeric()
      .withMessage("NIN number must contain only digits")
      .isLength({ min: 11, max: 11 })
      .withMessage("NIN number must be 11 digits")
      
]

// Reference validator for searching transactions by reference to look like "nin1779031914847"
export const referenceValidator = [
    query("reference")
    .trim()
    .notEmpty()
    .withMessage("Reference is required")
]

// verification token validator for routes that require verification token as a query parameter
export const verificationTokenValidator = [
    query("token")
    .trim()
    .notEmpty()
    .withMessage("Verification token is required")
]

// verify account number 
export const accountNumberValidator = [
    body("account_no")
    .trim()
    .notEmpty()
    .withMessage("Account number is required")
    .isNumeric()
    .withMessage("Account number must contain only digits")
    .isLength({ min: 10, max: 10 })
    .withMessage("Account number must be 10 digits"),

    body("bank_code")
    .trim()
    .notEmpty()
    .withMessage("Bank code is required")
    .isNumeric()
    .withMessage("Bank code must contain only digits"),

    ...stringValidator("bank_name")
]
