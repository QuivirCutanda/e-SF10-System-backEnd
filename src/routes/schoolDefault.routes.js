const express = require('express');
const router = express.Router();
const schoolDefaultController = require('../controllers/schoolDefaultController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateAddSchoolData,validateUpdateSchool } = require('../middleware/schoolValidation');
const upload = require('../middleware/multerConfig');

// Routes for school defaults
router.post(
  '/',
  authMiddleware,
  upload.single('school_logo'),
  validateAddSchoolData,
  schoolDefaultController.createSchoolDefault
);

router.put(
  '/:school_id',
  authMiddleware,
  upload.single('school_logo'),
  validateUpdateSchool,
  schoolDefaultController.updateSchoolDefault
);

router.get(
  '/:school_id',
  authMiddleware,
  schoolDefaultController.getSchoolDefault
);

module.exports = router;
