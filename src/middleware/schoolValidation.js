const { body, validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateAddSchoolData = [
  body('school_id')
    .notEmpty()
    .withMessage('School ID is required')
    .isInt({ min: 1 })
    .withMessage('School ID must be a positive integer'),
  body('school_name')
    .notEmpty()
    .withMessage('School Name is required')
    .isString()
    .withMessage('School Name must be a string')
    .trim()
    .isLength({ max: 255 })
    .withMessage('School Name cannot exceed 255 characters'),
  body('school_address')
    .notEmpty()
    .withMessage('School Address is required')
    .isString()
    .withMessage('School Address must be a string')
    .trim()
    .notEmpty()
    .withMessage('School Address cannot be empty after trimming'),
  body('region')
    .notEmpty()
    .withMessage('Region is required')
    .isString()
    .withMessage('Region must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Region cannot exceed 100 characters'),
  body('division')
    .notEmpty()
    .withMessage('Division is required')
    .isString()
    .withMessage('Division must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Division cannot exceed 100 characters'),
  body('district')
    .notEmpty()
    .withMessage('District is required')
    .isString()
    .withMessage('District must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('District cannot exceed 100 characters'),
  body('school_head')
    .notEmpty()
    .withMessage('School Head is required')
    .isString()
    .withMessage('School Head must be a string')
    .trim()
    .isLength({ max: 255 })
    .withMessage('School Head cannot exceed 255 characters'),
  body('contact_number')
    .optional()
    .isString()
    .withMessage('Contact Number must be a string')
    .matches(/^[0-9\s-]{6,20}$/)
    .withMessage('Contact Number must be 6-20 characters with digits and hyphens (e.g., 123-456-7890)'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL')
    .isLength({ max: 255 })
    .withMessage('Website cannot exceed 255 characters'),
  validateResults
];

const validateUpdateSchool = [
  body('school_name')
    .notEmpty()
    .withMessage('School Name is required')
    .isString()
    .withMessage('School Name must be a string')
    .trim()
    .isLength({ max: 255 })
    .withMessage('School Name cannot exceed 255 characters'),
  body('school_address')
    .notEmpty()
    .withMessage('School Address is required')
    .isString()
    .withMessage('School Address must be a string')
    .trim()
    .notEmpty()
    .withMessage('School Address cannot be empty after trimming'),
  body('region')
    .notEmpty()
    .withMessage('Region is required')
    .isString()
    .withMessage('Region must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Region cannot exceed 100 characters'),
  body('division')
    .notEmpty()
    .withMessage('Division is required')
    .isString()
    .withMessage('Division must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Division cannot exceed 100 characters'),
  body('district')
    .notEmpty()
    .withMessage('District is required')
    .isString()
    .withMessage('District must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('District cannot exceed 100 characters'),
  body('school_head')
    .notEmpty()
    .withMessage('School Head is required')
    .isString()
    .withMessage('School Head must be a string')
    .trim()
    .isLength({ max: 255 })
    .withMessage('School Head cannot exceed 255 characters'),
  body('contact_number')
    .optional()
    .isString()
    .withMessage('Contact Number must be a string')
    .matches(/^[0-9\s-]{6,20}$/)
    .withMessage('Contact Number must be 6-20 characters with digits and hyphens (e.g., 123-456-7890)'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL')
    .isLength({ max: 255 })
    .withMessage('Website cannot exceed 255 characters'),
  validateResults
];
module.exports = { validateAddSchoolData, validateUpdateSchool };
