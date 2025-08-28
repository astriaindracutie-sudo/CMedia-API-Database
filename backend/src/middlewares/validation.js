import { body, validationResult } from "express-validator";

// Middleware for handling validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

// Validation rules for creating a customer
const createCustomerValidationRules = () => {
  return [
    body("fullName")
      .trim()
      .notEmpty().withMessage("Full name is required")
      .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters long"),
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Must be a valid email address"),
    body("password")
      .trim()
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ];
};

// Validation rules for customer login
const loginValidationRules = () => {
  return [
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Must be a valid email address"),
    body("password")
      .trim()
      .notEmpty().withMessage("Password is required"),
  ];
};

export {
  validate,
  createCustomerValidationRules,
  loginValidationRules,
};
