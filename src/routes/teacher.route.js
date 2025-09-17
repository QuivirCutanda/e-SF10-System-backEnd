const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  getActiveTeachers,
  toggleTeacherStatus,
} = require("../controllers/teachers/Teachers.controller");

router.get(
  "/",
  authenticate,
  authorizePermission("view_teachers", "manage_teachers"),
  getAllTeachers
);

router.get(
  "/active",
  authenticate,
  authorizePermission("view_teachers", "manage_teachers"),
  getActiveTeachers
);

router.get(
  "/:id",
  authenticate,
  authorizePermission("view_teachers", "manage_teachers"),
  getTeacherById
);

router.post(
  "/create",
  authenticate,
  authorizePermission("manage_teachers"),
  createTeacher
);

router.put(
  "/update/:id",
  authenticate,
  authorizePermission("manage_teachers"),
  updateTeacher
);

router.patch(
  "/toggle-status/:id",
  authenticate,
  authorizePermission("manage_teachers"),
  toggleTeacherStatus
);

module.exports = router;
