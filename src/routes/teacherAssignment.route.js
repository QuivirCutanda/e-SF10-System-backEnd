const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");
const {
  getAllTeacherAssignments,
  getTeacherAssignmentById,
  createTeacherAssignment,
  updateTeacherAssignment,
  getTeacherAssignmentsByTeacher,
  getTeacherAssignmentsBySection,
  getAllTeachersByActiveYear,
  getTeacherAssignmentsByTeacherActiveYear,
  getAllTeachersAssignmentsActiveYear
} = require("../controllers/teacherAssignments/teacherAssignments.controller");

router.get(
  "/",
  authenticate,
  authorizePermission("view_teacher_assignments", "manage_teacher_assignments"),
  getAllTeacherAssignments
);

router.get(
  "/all/assignments/active-year",
  authenticate,
  authorizePermission("view_teacher_assignments", "manage_teacher_assignments"),
  getAllTeachersAssignmentsActiveYear
);


router.get(
  "/active-school-year",
  authenticate,
  authorizePermission("view_teachers", "manage_teachers"),
  getAllTeachersByActiveYear
);

router.get(
  "/:id",
  authenticate,
  authorizePermission("view_teacher_assignments", "manage_teacher_assignments"),
  getTeacherAssignmentById
);

router.get(
  "/teacher/:teacherId",
  authenticate,
  authorizePermission("view_teacher_assignments", "manage_teacher_assignments"),
  getTeacherAssignmentsByTeacher
);

router.get(
  "/teacher/:teacherId/active-year",
  authenticate,
  authorizePermission("view_teacher_assignments", "manage_teacher_assignments"),
  getTeacherAssignmentsByTeacherActiveYear
);

router.get(
  "/section/:sectionId",
  authenticate,
  authorizePermission("view_teacher_assignments", "manage_teacher_assignments"),
  getTeacherAssignmentsBySection
);

router.post(
  "/create",
  authenticate,
  authorizePermission("manage_teacher_assignments"),
  createTeacherAssignment
);

router.put(
  "/update/:id",
  authenticate,
  authorizePermission("manage_teacher_assignments"),
  updateTeacherAssignment
);

module.exports = router;
