const express = require("express");
const router = express.Router();
const authorizePermission = require("../middleware/authorizePermission");
const schoolDefaultController = require("../controllers/schoolDefaultController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  validateAddSchoolData,
  validateUpdateSchool,
} = require("../middleware/schoolValidation");
const upload = require("../middleware/multerConfig");

// Routes for school defaults
router.post(
  "/",
  authMiddleware,
  authorizePermission("manage_school_settings"),
  upload.single("school_logo"),
  validateAddSchoolData,
  schoolDefaultController.createSchoolDefault
);

router.put(
  "/:school_id",
  authMiddleware,
  authorizePermission("manage_school_settings"),
  upload.single("school_logo"),
  validateUpdateSchool,
  schoolDefaultController.updateSchoolDefault
);

router.get(
  "/:school_id",
  authMiddleware,
  schoolDefaultController.getSchoolDefault
);

module.exports = router;
