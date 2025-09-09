const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { 
  getAllSections, 
  getSectionById, 
  createSection, 
  updateSection, 
  deleteSection 
} = require('../controllers/sections/Sections.controller');

router.get('/', authenticate, 
    authorizePermission('view_sections', 'manage_sections'), 
    getAllSections);

router.get('/:id', authenticate, 
    authorizePermission('view_sections', 'manage_sections'), 
    getSectionById);

router.post('/create', authenticate, 
    authorizePermission('manage_sections'), 
    createSection);

router.put('/update/:id', authenticate, 
    authorizePermission('manage_sections'), 
    updateSection);


module.exports = router;