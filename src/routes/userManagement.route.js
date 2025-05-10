const express = require("express");
const router = express.Router();
const {checkPermission} = require('../middleware/roleBaseAccessControl');
const authenticate = require('../middleware/authMiddleware');
const {getAllUsers, getUserById} = require("../controllers/userManagementController");

router.get("/", authenticate, checkPermission('manage_users'), getAllUsers);
router.get("/:userId", authenticate, checkPermission('manage_user'), getUserById);


module.exports = router;