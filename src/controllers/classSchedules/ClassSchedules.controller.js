const { 
  fetchAllClassSchedules, 
  fetchClassScheduleById, 
  createNewClassSchedule, 
  updateClassScheduleById, 
  deleteClassScheduleById 
} = require('../../models/classSchedules/classSchedule-model');

exports.getAllClassSchedules = async (req, res) => {
  try {
    const schedules = await fetchAllClassSchedules();
    return res.status(200).json({
      success: true,
      data: schedules,
      count: schedules.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Class Schedules Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching class schedules',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getClassScheduleById = async (req, res) => {
  const { id } = req.params;
  const scheduleId = parseInt(id);

  if (!scheduleId || scheduleId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Schedule ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const schedule = await fetchClassScheduleById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Class schedule not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: schedule,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Class Schedule By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching class schedule',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.createClassSchedule = async (req, res) => {
  const { subject_id, teacher_id, section_id, school_year_id, day_of_week, start_time, end_time } = req.body;
  const userId = req.user?.user_id;

  if (!subject_id || !Number.isInteger(subject_id) || subject_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Subject ID is required and must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!teacher_id || !Number.isInteger(teacher_id) || teacher_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher ID is required and must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!section_id || !Number.isInteger(section_id) || section_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Section ID is required and must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!school_year_id || !Number.isInteger(school_year_id) || school_year_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'School year ID is required and must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!day_of_week || !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day_of_week)) {
    return res.status(400).json({
      success: false,
      error: 'Day of week is required and must be one of: Monday, Tuesday, Wednesday, Thursday, Friday',
      timestamp: new Date().toISOString()
    });
  }

  if (!start_time || !/^\d{2}:\d{2}:\d{2}$/.test(start_time)) {
    return res.status(400).json({
      success: false,
      error: 'Start time is required and must be in HH:MM:SS format',
      timestamp: new Date().toISOString()
    });
  }

  if (!end_time || !/^\d{2}:\d{2}:\d{2}$/.test(end_time)) {
    return res.status(400).json({
      success: false,
      error: 'End time is required and must be in HH:MM:SS format',
      timestamp: new Date().toISOString()
    });
  }

  if (start_time >= end_time) {
    return res.status(400).json({
      success: false,
      error: 'Start time must be before end time',
      timestamp: new Date().toISOString()
    });
  }


  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const schedule = await createNewClassSchedule({
      subject_id,
      teacher_id,
      section_id,
      school_year_id,
      day_of_week,
      start_time,
      end_time
    }, userId);

    return res.status(201).json({
      success: true,
      message: 'Class schedule created successfully',
      data: schedule,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create Class Schedule Error:', error);
    if (error.message.includes('Teacher not assigned')) {
      return res.status(409).json({
        success: false,
        error: 'Teacher is not assigned to this subject in this section for this school year',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Schedule conflict for teacher')) {
      return res.status(409).json({
        success: false,
        error: 'Schedule conflict for the teacher on this day and time',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Schedule conflict for section')) {
      return res.status(409).json({
        success: false,
        error: 'Schedule conflict for the section on this day and time',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Subject not found')) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Teacher not found')) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Section not found')) {
      return res.status(404).json({
        success: false,
        error: 'Section not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('School year not found')) {
      return res.status(404).json({
        success: false,
        error: 'School year not found',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while creating class schedule',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.updateClassSchedule = async (req, res) => {
  const { id } = req.params;
  const { teacher_id, subject_id, section_id, school_year_id, day_of_week, start_time, end_time } = req.body;
  const userId = req.user?.user_id;
  const scheduleId = parseInt(id, 10);

  if (!scheduleId || scheduleId <= 0) {
    return res.status(400).json({ success: false, error: 'Schedule ID must be a positive integer' });
  }
  if (!teacher_id || !Number.isInteger(teacher_id) || teacher_id <= 0) {
    return res.status(400).json({ success: false, error: 'Teacher ID must be a positive integer' });
  }
  if (!subject_id || !Number.isInteger(subject_id) || subject_id <= 0) {
    return res.status(400).json({ success: false, error: 'Subject ID must be a positive integer' });
  }
  if (!section_id || !Number.isInteger(section_id) || section_id <= 0) {
    return res.status(400).json({ success: false, error: 'Section ID must be a positive integer' });
  }
  if (!school_year_id || !Number.isInteger(school_year_id) || school_year_id <= 0) {
    return res.status(400).json({ success: false, error: 'School Year ID must be a positive integer' });
  }
  if (!day_of_week) {
    return res.status(400).json({ success: false, error: 'Day of week is required' });
  }
  if (!start_time || !end_time) {
    return res.status(400).json({ success: false, error: 'Start and end time are required' });
  }
  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({ success: false, error: 'Invalid user ID from authentication token' });
  }

  try {
    const updatedSchedule = await updateClassScheduleById(
      scheduleId,
      { teacher_id, subject_id, section_id, school_year_id, day_of_week, start_time, end_time },
      userId
    );

    return res.status(200).json({
      success: true,
      message: 'Class schedule updated successfully',
      data: updatedSchedule
    });

  } catch (error) {
    console.error('Update Class Schedule Error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(409).json({ success: false, error: error.message });
    }
    if (error.message.includes('not active')) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: 'Server error', details: error.message });
  }
};



exports.deleteClassSchedule = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id;
  const scheduleId = parseInt(id);

  if (!scheduleId || scheduleId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Schedule ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const result = await deleteClassScheduleById(scheduleId, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Class schedule not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Class schedule deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete Class Schedule Error:', error);
    if (error.message.includes('Class schedule not found')) {
      return res.status(404).json({
        success: false,
        error: 'Class schedule not found',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while deleting class schedule',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};