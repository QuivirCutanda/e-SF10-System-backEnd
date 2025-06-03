const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/roleBaseAccessControl');
const authenticate = require('../middleware/authMiddleware');
const uploadSF10 = require('../middleware/uploadSF10.middleware');
const { addStudent } = require('../controllers/student/student.controller');
const { searchStudents } = require('../controllers/student/searchStudent.controller');
const { viewStudentECards} = require('../controllers/student/eCard.controller');
const { viewAllStudents } = require('../controllers/student/viewAllStudents.controller');
const { validatePagination } = require('../middleware/paginationValidation');
const { getStudentFullDetails } = require('../controllers/student/studentDetails.controller');
const { updateStudent } = require('../controllers/student/updateStudent.controller');
const { validateStudentRegistration, validateStudentSearch, validateLRN, validateStudentId,validateStudentUpdate } = require('../middleware/studentValidation');

const { uploadSF10: uploadSF10Handler } = require('../controllers/student/uploadSF10.controller');

router.post('/register', authenticate, checkPermission('register_student'), validateStudentRegistration, addStudent);
router.get('/search', authenticate, checkPermission('search_student'), validateStudentSearch, searchStudents);
router.get('/all', authenticate, checkPermission('view_student_info'), validatePagination, viewAllStudents)
router.get('/:lrn/details', authenticate, checkPermission('view_student_info'), validateLRN, getStudentFullDetails);
router.get('/:studentId/ecards', authenticate, checkPermission('view_ecards'), validateStudentId, viewStudentECards);
router.post('/upload-sf10/:studentId',authenticate, uploadSF10, uploadSF10Handler);
router.put('/:lrn/update', authenticate, checkPermission('update_student_info'), validateLRN, validateStudentUpdate, updateStudent);

module.exports = router;
