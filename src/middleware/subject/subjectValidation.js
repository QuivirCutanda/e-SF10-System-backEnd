const { check, param, validationResult } = require('express-validator');

// Validation for creating a new subject
const validateSubject = [
  check('subject_code')
    .notEmpty()
    .withMessage('Subject code is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Subject code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Subject code must contain only uppercase letters, numbers, underscores, or hyphens'),

  check('subject_name')
    .notEmpty()
    .withMessage('Subject name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Subject name must be between 2 and 255 characters')
    .matches(/^[a-zA-Z0-9\s\-&().,]+$/)
    .withMessage('Subject name contains invalid characters'),

  check('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Validation for updating a subject
const validateSubjectUpdate = [
  check('subject_code')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Subject code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Subject code must contain only uppercase letters, numbers, underscores, or hyphens'),

  check('subject_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Subject name must be between 2 and 255 characters')
    .matches(/^[a-zA-Z0-9\s\-&().,]+$/)
    .withMessage('Subject name contains invalid characters'),

  check('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  check('grade_level')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Grade level must be between 1 and 20 characters')
    .matches(/^(Kindergarten|Grade [1-9]|Grade 1[0-2]|K|[1-9]|1[0-2])$/i)
    .withMessage('Invalid grade level format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Check if at least one field is provided for update
    const { subject_code, subject_name, description, grade_level } = req.body;
    if (!subject_code && !subject_name && !description && !grade_level) {
      return res.status(400).json({
        success: false,
        error: 'At least one field must be provided for update'
      });
    }

    next();
  }
];

// Validation for subject ID parameter
const validateSubjectId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Subject ID must be a positive integer'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = {
  validateSubject,
  validateSubjectUpdate,
  validateSubjectId
};