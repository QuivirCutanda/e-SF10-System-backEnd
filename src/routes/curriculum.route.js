const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");
const {
  validateCurriculum,
  validateCurriculumId,
  validateCurriculumUpdate,
  validateCurriculumSubjects,
} = require("../middleware/curriculumValidation");
const { validatePagination } = require("../middleware/paginationValidation");
const { check, validationResult } = require("express-validator");
const {
  createCurriculum,
  getAllCurriculums,
  getCurriculumById,
  updateCurriculum,
  searchCurriculums,
  getCurriculumsBySchoolYear,
  addSubjectToCurriculum,
  removeSubjectFromCurriculum,
  getCurriculumSubjects,
  getActiveCurriculums,
  toggleCurriculumStatus,
  getActiveCurriculumSubjects
} = require("../controllers/curriculum/curriculum.controller");

// Validation middleware
const validateCurriculumSearch = [
  check("query")
    .optional()
    .isString() 
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Search query must be a string between 1 and 255 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const validateSchoolYearParam = [
  check("school_year_id")
    .isInt({ min: 1 })
    .withMessage("School year ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const validateSubjectRemoval = [
  check("curriculum_id")
    .isInt({ min: 1 })
    .withMessage("Curriculum ID must be a positive integer"),
  check("subject_id")
    .isInt({ min: 1 })
    .withMessage("Subject ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// Routes
router.post(
  "/create-curriculum",
  authenticate,
  authorizePermission("manage_curriculum"),
  validateCurriculum,
  createCurriculum
);

router.get(
  "/view-all-curriculums",
  authenticate,
  authorizePermission("view_curriculum", "manage_curriculum"),
  validatePagination,
  getAllCurriculums
);

router.get(
  "/view-curriculum/:id",
  authenticate,
  authorizePermission("view_curriculum", "manage_curriculum"),
  validateCurriculumId,
  getCurriculumById
);

router.put(
  "/update-curriculum/:id",
  authenticate,
  authorizePermission("manage_curriculum"),
  validateCurriculumId,
  validateCurriculumUpdate,
  updateCurriculum
);

router.get(
  "/search-curriculums",
  authenticate,
  authorizePermission("view_curriculum", "manage_curriculum"),
  validateCurriculumSearch,
  searchCurriculums
);

router.get(
  "/by-school-year/:school_year_id",
  authenticate,
  authorizePermission("view_curriculum", "manage_curriculum"),
  validateSchoolYearParam,
  validatePagination,
  getCurriculumsBySchoolYear
);

router.get(
  "/active-curriculums",
  authenticate,
  authorizePermission("view_curriculum", "manage_curriculum"),
  validatePagination,
  getActiveCurriculums
);

router.patch(
  "/toggle-status/:id",
  authenticate,
  authorizePermission("manage_curriculum"),
  validateCurriculumId,
  toggleCurriculumStatus
);

router.get(
  "/curriculum-subjects/:id",
  authenticate,
  authorizePermission("view_curriculum", "manage_curriculum"),
  validateCurriculumId,
  getCurriculumSubjects
);

router.get(
  "/curriculum-subjects/active",
  authenticate,
  authorizePermission("view_curriculum", "manage_curriculum"),
  getActiveCurriculumSubjects
);

router.post(
  "/add-subjects/:id",
  authenticate,
  authorizePermission("manage_curriculum"),
  validateCurriculumId,
  validateCurriculumSubjects,
  addSubjectToCurriculum
);

router.delete(
  "/remove-subject/:curriculum_id/:subject_id",
  authenticate,
  authorizePermission("manage_curriculum"),
  validateSubjectRemoval,
  removeSubjectFromCurriculum
);

module.exports = router;
