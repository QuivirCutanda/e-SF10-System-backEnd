const express = require("express");
const router = express.Router();
const {checkPermission} = require('../middleware/roleBaseAccessControl');
const authenticate = require('../middleware/authMiddleware');
const {getAllUsers, getUserById, updateUser} = require("../controllers/userManagementController");

router.get("/", authenticate, checkPermission('manage_users'), getAllUsers);
router.get("/:userId", authenticate, checkPermission('manage_users'), getUserById);
router.put("/:userId", authenticate, checkPermission('manage_users'), updateUser);

module.exports = router;