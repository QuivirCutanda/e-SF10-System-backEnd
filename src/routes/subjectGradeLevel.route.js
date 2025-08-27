const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { 
  getAllSubjectGradeLevels, 
  getSubjectGradeLevelById,
  getSubjectGradeLevelsBySubject,
  getSubjectGradeLevelsByGradeLevel,
  createSubjectGradeLevel, 
  updateSubjectGradeLevel, 
  deleteSubjectGradeLevel,
  bulkCreateSubjectGradeLevels,
  bulkDeleteSubjectGradeLevels
} = require('../controllers/subject-grade-levels/GradeLevels.controller');

// Get all subject grade level assignments
router.get('/', authenticate, 
    // authorizePermission('view_subjects', 'manage_subjects'), 
    getAllSubjectGradeLevels);

// Get subject grade level assignment by subject_id and grade_level_id
router.get('/:subjectId/:gradeLevelId', authenticate, 
    // authorizePermission('view_subjects', 'manage_subjects'), 
    getSubjectGradeLevelById);

// Get all grade levels assigned to a specific subject
router.get('/by-subject/:subjectId', authenticate, 
    // authorizePermission('view_subjects', 'manage_subjects'), 
    getSubjectGradeLevelsBySubject);

// Get all subjects assigned to a specific grade level
router.get('/by-grade-level/:gradeLevelId', authenticate, 
    // authorizePermission('view_subjects', 'manage_subjects'), 
    getSubjectGradeLevelsByGradeLevel);

// Create new subject grade level assignment
router.post('/create', authenticate, 
    // authorizePermission('manage_subjects'), 
    createSubjectGradeLevel);

// Bulk create multiple subject grade level assignments
router.post('/bulk-create', authenticate, 
    // authorizePermission('manage_subjects'), 
    bulkCreateSubjectGradeLevels);

// Update subject grade level assignment
router.put('/update/:subjectId/:gradeLevelId', authenticate, 
    // authorizePermission('manage_subjects'), 
    updateSubjectGradeLevel);

// Delete subject grade level assignment
router.delete('/delete/:subjectId/:gradeLevelId', authenticate, 
    // authorizePermission('manage_subjects'), 
    deleteSubjectGradeLevel);

// Bulk delete multiple subject grade level assignments
router.delete('/bulk-delete', authenticate, 
    // authorizePermission('manage_subjects'), 
    bulkDeleteSubjectGradeLevels);

module.exports = router;