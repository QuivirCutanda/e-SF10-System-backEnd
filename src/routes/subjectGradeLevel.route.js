const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { 
  getAllSubjectGradeLevels, 
  getSubjectGradeLevelsByGradeLevel,
  createSubjectGradeLevel, 
  deleteSubjectGradeLevel,
  bulkCreateSubjectGradeLevels,
} = require('../controllers/subject-grade-levels/GradeLevels.controller');

router.get('/', authenticate, 
    authorizePermission('view_subjects', 'manage_subjects'), 
    getAllSubjectGradeLevels);

router.get('/by-grade-level/:gradeLevelId', authenticate, 
    authorizePermission('view_subjects', 'manage_subjects'), 
    getSubjectGradeLevelsByGradeLevel);

router.post('/create', authenticate, 
    authorizePermission('manage_subjects'), 
    createSubjectGradeLevel);

router.post('/bulk-create', authenticate, 
    authorizePermission('manage_subjects'), 
    bulkCreateSubjectGradeLevels);

router.delete('/delete/:subjectId/:gradeLevelId', authenticate, 
    authorizePermission('manage_subjects'), 
    deleteSubjectGradeLevel);
module.exports = router;