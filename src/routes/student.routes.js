const express = require('express');
const router = express.Router();
const { addStudent } = require('../controllers/student/student.controller');
const { checkPermission } = require('../middleware/roleBaseAccessControl');
const authenticate = require('../middleware/authMiddleware');

router.post('/register', authenticate, checkPermission('admin'), addStudent);

module.exports = router;
