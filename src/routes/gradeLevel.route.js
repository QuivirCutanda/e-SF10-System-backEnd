const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { 
  getAllGradeLevels, 
  createGradeLevel, 
  updateGradeLevel, 
  deleteGradeLevel,
  getGradeLevelById 
} = require('../controllers/grade-levels/GradeLevels.controller');

router.get('/', authenticate, 
    authorizePermission('view_grade_levels', 'manage_grade_levels'), 
    getAllGradeLevels);

router.get('/:id', authenticate, 
    authorizePermission('view_grade_levels', 'manage_grade_levels'), 
    getGradeLevelById);

router.post('/create', authenticate, 
    authorizePermission('manage_grade_levels'), 
    createGradeLevel);

router.put('/update/:id', authenticate, 
    authorizePermission('manage_grade_levels'), 
    updateGradeLevel);

// Delete grade level
router.delete('/delete/:id', authenticate, 
    authorizePermission('manage_grade_levels'), 
    deleteGradeLevel);

module.exports = router;