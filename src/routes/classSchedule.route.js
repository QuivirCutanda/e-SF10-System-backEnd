const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { 
  getAllClassSchedules, 
  getClassScheduleById, 
  createClassSchedule, 
  updateClassSchedule
} = require('../controllers/classSchedules/ClassSchedules.controller');

router.get('/', authenticate, 
    // authorizePermission('view_class_schedules', 'manage_class_schedules'), 
    getAllClassSchedules);

router.get('/:id', authenticate, 
    // authorizePermission('view_class_schedules', 'manage_class_schedules'), 
    getClassScheduleById);

router.post('/create', authenticate, 
    // authorizePermission('manage_class_schedules'), 
    createClassSchedule);

router.put('/update/:id', authenticate, 
    // authorizePermission('manage_class_schedules'), 
    updateClassSchedule);


module.exports = router;