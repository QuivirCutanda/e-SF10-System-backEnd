const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { validateSubject, validateSubjectId, validateSubjectUpdate } = require('../middleware/subject/subjectValidation');
const { validatePagination } = require('../middleware/paginationValidation');
const { check, validationResult } = require('express-validator');
const { 
  createSubject, 
  getAllSubjects, 
  getSubjectById, 
  updateSubject, 
  searchSubjects,
} = require('../controllers/subject/subject.controller');

// Validation middleware for search query
const validateSubjectSearch = [
  check('query')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search query must be a string between 1 and 255 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

// Validation for grade level
const validateGradeLevel = [
  check('grade_level')
    .notEmpty()
    .withMessage('Grade level is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Grade level must be between 1 and 20 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

router.post(
  '/create-subject',
  authenticate,
  authorizePermission('manage_subjects'),
  validateSubject,
  createSubject
);

router.get(
  '/view-all-subjects',
  authenticate,
  authorizePermission('view_subjects', 'manage_subjects'),
  validatePagination,
  getAllSubjects
);

router.get(
  '/view-subject/:id',
  authenticate,
  authorizePermission('view_subjects', 'manage_subjects'),
  validateSubjectId,
  getSubjectById
);

router.put(
  '/update-subject/:id',
  authenticate,
  authorizePermission('manage_subjects'),
  validateSubjectId,
  validateSubjectUpdate,
  updateSubject
);


router.get(
  '/search-subjects',
  authenticate,
  authorizePermission('view_subjects', 'manage_subjects'),
  validateSubjectSearch,
  searchSubjects
);


module.exports = router;