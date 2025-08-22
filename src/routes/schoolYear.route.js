const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { validatePagination } = require('../middleware/paginationValidation');
const { 
  createSchoolYear,
  getAllSchoolYears,
  getSchoolYearById,
  updateSchoolYear,
  deleteSchoolYear,
  setActiveSchoolYear
} = require('../controllers/schoolYear/schoolYear.controller');

// Create a new school year
router.post('/', authenticate,
    //  authorizePermission('manage_school_years'), 
     createSchoolYear);

// Get all school years with pagination
router.get('/', authenticate, 
    // authorizePermission('view_school_years'), 
    validatePagination, 
    getAllSchoolYears);

// Get school year by ID
router.get('/:id', authenticate, 
    // authorizePermission('view_school_years'), 
    getSchoolYearById);

// Update school year
router.put('/:id', authenticate, 
    // authorizePermission('manage_school_years'),
    updateSchoolYear);

// Set active school year
router.patch('/:id/set-active', authenticate, 
    // authorizePermission('manage_school_years'), 
    setActiveSchoolYear);

// Delete school year (soft delete)
router.delete('/:id', authenticate, 
    // authorizePermission('manage_school_years'), 
    deleteSchoolYear);

module.exports = router;