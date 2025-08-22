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

router.post('/create-school-year', authenticate,
    //  authorizePermission('manage_school_years'), 
     createSchoolYear);

router.get('/all-school-years', authenticate, 
    // authorizePermission('view_school_years'), 
    validatePagination, 
    getAllSchoolYears);

router.get('/school-year/:id', authenticate, 
    // authorizePermission('view_school_years'), 
    getSchoolYearById);

router.put('/update-school-year/:id', authenticate, 
    // authorizePermission('manage_school_years'),
    updateSchoolYear);

router.patch('/school-year/:id/set-active', authenticate, 
    // authorizePermission('manage_school_years'), 
    setActiveSchoolYear);

router.delete('/delete-school-year/:id', authenticate, 
    // authorizePermission('manage_school_years'), 
    deleteSchoolYear);

module.exports = router;