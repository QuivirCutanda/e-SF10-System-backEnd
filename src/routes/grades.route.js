const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { 
  getAllGrades,
  getGradesByStudent,
  getGradesBySection,
  getGradesByTeacher,
  createOrUpdateGrade,
  deleteGrade,
  toggleGradeInput,
  getGradeInputStatus
} = require('../controllers/grades/grades.controller');

router.get('/', authenticate, 
    authorizePermission('view_grades', 'manage_grades'), 
    getAllGrades);

router.get('/student/:studentId', authenticate, 
    authorizePermission('view_grades', 'manage_grades'), 
    getGradesByStudent);

router.get('/section/:sectionId', authenticate, 
    authorizePermission('view_grades', 'manage_grades'), 
    getGradesBySection);

router.get('/teacher/:teacherId', authenticate, 
    authorizePermission('view_grades', 'manage_grades'), 
    getGradesByTeacher);

router.post('/create-or-update', authenticate, 
    authorizePermission('manage_grades'), 
    createOrUpdateGrade);

router.delete('/:gradeId', authenticate, 
    authorizePermission('manage_grades'), 
    deleteGrade);

router.post('/toggle-input/:teacherId', authenticate, 
    authorizePermission('manage_grade_input'), 
    toggleGradeInput);


router.get('/input-status/:teacherId',
  authenticate,
  authorizePermission('view_grades', 'manage_grades'),
  getGradeInputStatus
);

module.exports = router;