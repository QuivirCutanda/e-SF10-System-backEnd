const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");
const {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getActiveEnrollments,
} = require("../controllers/enrollments/Enrollments.controller");

router.get(
  "/",
  authenticate,
  authorizePermission("view_enrollments", "manage_enrollments"),
  getAllEnrollments
);

router.get(
  "/active-enrollments",
  authenticate,
  authorizePermission("view_enrollments", "manage_enrollments"),
  getActiveEnrollments
);

router.get(
  "/:id",
  authenticate,
  authorizePermission("view_enrollments", "manage_enrollments"),
  getEnrollmentById
);

router.post(
  "/create",
  authenticate,
  authorizePermission("manage_enrollments"),
  createEnrollment
);

router.put(
  "/update/:id",
  authenticate,
  authorizePermission("manage_enrollments"),
  updateEnrollment
);

router.delete(
  "/delete/:id",
  authenticate,
  authorizePermission("manage_enrollments"),
  deleteEnrollment
);

module.exports = router;
