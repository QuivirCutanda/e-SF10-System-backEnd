const { 
  fetchAllTeacherAssignments, 
  fetchTeacherAssignmentById, 
  createNewTeacherAssignment, 
  updateTeacherAssignmentById, 
  deleteTeacherAssignmentById,
  fetchTeacherAssignmentsByTeacher,
  fetchTeacherAssignmentsBySection,
  fetchAllTeachersByActiveYear,
} = require('../../models/teacherAssignments/teacherAssignments-model');

exports.getAllTeacherAssignments = async (req, res) => {
  try {
    const assignments = await fetchAllTeacherAssignments();
    return res.status(200).json({
      success: true,
      data: assignments,
      count: assignments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Teacher Assignments Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching teacher assignments',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.getAllTeachersByActiveYear = async (req, res) => {
  try {
    const teachers = await fetchAllTeachersByActiveYear();
    return res.status(200).json({
      success: true,
      data: teachers,
      count: teachers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Teachers Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching teachers',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.getTeacherAssignmentById = async (req, res) => {
  const { id } = req.params;
  const assignmentId = parseInt(id);

  if (!assignmentId || assignmentId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Assignment ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const assignment = await fetchTeacherAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Teacher assignment not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Teacher Assignment By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching teacher assignment',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getTeacherAssignmentsByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const teacherIdInt = parseInt(teacherId);

  if (!teacherIdInt || teacherIdInt <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const assignments = await fetchTeacherAssignmentsByTeacher(teacherIdInt);
    return res.status(200).json({
      success: true,
      data: assignments,
      count: assignments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Teacher Assignments By Teacher Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching teacher assignments',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getTeacherAssignmentsBySection = async (req, res) => {
  const { sectionId } = req.params;
  const sectionIdInt = parseInt(sectionId);

  if (!sectionIdInt || sectionIdInt <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Section ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const assignments = await fetchTeacherAssignmentsBySection(sectionIdInt);
    return res.status(200).json({
      success: true,
      data: assignments,
      count: assignments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Teacher Assignments By Section Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching teacher assignments',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.createTeacherAssignment = async (req, res) => {
  const { teacher_id, subject_id, section_id, school_year_id } = req.body;
  const userId = req.user?.user_id;

  if (!teacher_id || !Number.isInteger(teacher_id) || teacher_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Teacher ID is required and must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!subject_id || !Number.isInteger(subject_id) || subject_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Subject ID is required and must be a positive integer',
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

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const assignment = await createNewTeacherAssignment({
      teacher_id,
      subject_id,
      section_id,
      school_year_id
    }, userId);

    return res.status(201).json({
      success: true,
      message: 'Teacher assignment created successfully',
      data: assignment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create Teacher Assignment Error:', error);
    if (error.message.includes('Teacher not found')) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found',
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
    if (error.message.includes('Assignment already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Teacher assignment already exists for this combination',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Teacher is not active')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign inactive teacher',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while creating teacher assignment',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.updateTeacherAssignment = async (req, res) => {
  const { id } = req.params;
  const { teacher_id, subject_id, section_id, school_year_id } = req.body;
  const userId = req.user?.user_id;
  const assignmentId = parseInt(id, 10);

  if (!assignmentId || assignmentId <= 0) {
    return res.status(400).json({ success: false, error: "Assignment ID must be a positive integer" });
  }
  if (!teacher_id || !Number.isInteger(teacher_id) || teacher_id <= 0) {
    return res.status(400).json({ success: false, error: "Teacher ID must be a positive integer" });
  }
  if (!subject_id || !Number.isInteger(subject_id) || subject_id <= 0) {
    return res.status(400).json({ success: false, error: "Subject ID must be a positive integer" });
  }
  if (!section_id || !Number.isInteger(section_id) || section_id <= 0) {
    return res.status(400).json({ success: false, error: "Section ID must be a positive integer" });
  }
  if (!school_year_id || !Number.isInteger(school_year_id) || school_year_id <= 0) {
    return res.status(400).json({ success: false, error: "School Year ID must be a positive integer" });
  }
  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({ success: false, error: "Invalid user ID from authentication token" });
  }

  try {
    const updatedAssignment = await updateTeacherAssignmentById(
      assignmentId,
      { teacher_id, subject_id, section_id, school_year_id },
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Teacher assignment updated successfully",
      data: updatedAssignment,
    });
  } catch (error) {
    console.error("Update Teacher Assignment Error:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error.message.includes("already exists")) {
      return res.status(409).json({ success: false, error: error.message });
    }
    if (error.message.includes("not active")) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: "Server error", details: error.message });
  }
};


exports.deleteTeacherAssignment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id;
  const assignmentId = parseInt(id);

  if (!assignmentId || assignmentId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Assignment ID must be a positive integer',
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
    const result = await deleteTeacherAssignmentById(assignmentId, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Teacher assignment not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Teacher assignment deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete Teacher Assignment Error:', error);
    if (error.message.includes('Assignment not found')) {
      return res.status(404).json({
        success: false,
        error: 'Teacher assignment not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Cannot delete assignment')) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete teacher assignment as it is being used in class schedules or student grades',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while deleting teacher assignment',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};