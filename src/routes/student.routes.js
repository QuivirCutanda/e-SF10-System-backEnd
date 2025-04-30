const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/roleBaseAccessControl');
const authenticate = require('../middleware/authMiddleware');
const { addStudent } = require('../controllers/student/student.controller');
const { searchStudents } = require('../controllers/student/searchStudent.controller');
const { viewStudentECards} = require('../controllers/student/eCard.controller');
const { getStudentFullDetails } = require('../controllers/student/studentDetails.controller');
const { validateStudentRegistration, validateStudentSearch, validateLRN, validateStudentId } = require('../middleware/studentValidation');

router.post('/register', authenticate, checkPermission('register_student'), validateStudentRegistration, addStudent);
router.get('/search', authenticate, checkPermission('search_student'), validateStudentSearch, searchStudents);
router.get('/:lrn/details', authenticate, checkPermission('view_student_info'), validateLRN, getStudentFullDetails);
router.get('/:studentId/ecards', authenticate, checkPermission('view_ecards'), validateStudentId, viewStudentECards);

module.exports = router;
