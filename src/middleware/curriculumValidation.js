const { check, param, body, validationResult } = require('express-validator');

// Validation for creating a new curriculum
const validateCurriculum = [
  check('curriculum_name')
    .notEmpty()
    .withMessage('Curriculum name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Curriculum name must be between 2 and 255 characters')
    .matches(/^[a-zA-Z0-9\s\-&().,]+$/)
    .withMessage('Curriculum name contains invalid characters'),

  check('school_year_id')
    .notEmpty()
    .withMessage('School year ID is required')
    .isInt({ min: 1 })
    .withMessage('School year ID must be a positive integer'),

  check('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),

  check('subject_ids')
    .optional()
    .isArray()
    .withMessage('Subject IDs must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        const allIntegers = value.every(id => Number.isInteger(id) && id > 0);
        if (!allIntegers) {
          throw new Error('All subject IDs must be positive integers');
        }
        // Check for duplicates
        const uniqueIds = [...new Set(value)];
        if (uniqueIds.length !== value.length) {
          throw new Error('Subject IDs must be unique');
        }
      }
      return true;
    }),

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

// Validation for updating a curriculum
const validateCurriculumUpdate = [
  check('curriculum_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Curriculum name must be between 2 and 255 characters')
    .matches(/^[a-zA-Z0-9\s\-&().,]+$/)
    .withMessage('Curriculum name contains invalid characters'),

  check('school_year_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('School year ID must be a positive integer'),

  check('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Check if at least one field is provided for update
    const { curriculum_name, school_year_id, is_active } = req.body;
    if (!curriculum_name && !school_year_id && is_active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'At least one field must be provided for update'
      });
    }

    next();
  }
];

// Validation for curriculum ID parameter
const validateCurriculumId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Curriculum ID must be a positive integer'),

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

// Validation for adding/removing subjects to/from curriculum
const validateCurriculumSubjects = [
  body('subject_ids')
    .notEmpty()
    .withMessage('Subject IDs are required')
    .isArray({ min: 1 })
    .withMessage('Subject IDs must be a non-empty array')
    .custom((value) => {
      const allIntegers = value.every(id => Number.isInteger(id) && id > 0);
      if (!allIntegers) {
        throw new Error('All subject IDs must be positive integers');
      }
      // Check for duplicates
      const uniqueIds = [...new Set(value)];
      if (uniqueIds.length !== value.length) {
        throw new Error('Subject IDs must be unique');
      }
      return true;
    }),

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

// Validation for school year existence
const validateSchoolYear = [
  check('school_year_id')
    .custom(async (value) => {
      // This would need to be implemented to check if school year exists
      // For now, we'll just validate the format
      if (!Number.isInteger(value) || value < 1) {
        throw new Error('Invalid school year ID');
      }
      return true;
    }),

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
  validateCurriculum,
  validateCurriculumUpdate,
  validateCurriculumId,
  validateCurriculumSubjects,
  validateSchoolYear
};