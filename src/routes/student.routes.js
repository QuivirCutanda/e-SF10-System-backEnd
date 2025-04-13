const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/roleBaseAccessControl');
const authenticate = require('../middleware/authMiddleware');
const { addStudent } = require('../controllers/student/student.controller');
const { searchStudents } = require('../controllers/student/searchStudent.controller');
const { getStudentFullDetails } = require('../controllers/student/studentDetails.controller');

router.post('/register', authenticate, addStudent);
router.get('/search', authenticate, searchStudents);
router.get('/:lrn/details', authenticate, getStudentFullDetails);

module.exports = router;
