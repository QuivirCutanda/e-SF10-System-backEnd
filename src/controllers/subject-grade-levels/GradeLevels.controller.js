const { 
  fetchAllSubjectGradeLevels, 
  fetchSubjectGradeLevelById,
  fetchSubjectGradeLevelsBySubject,
  fetchSubjectGradeLevelsByGradeLevel,
  createNewSubjectGradeLevel, 
  updateSubjectGradeLevelById, 
  deleteSubjectGradeLevelById,
  bulkCreateSubjectGradeLevels,
  bulkDeleteSubjectGradeLevels
} = require('../../models/subject-grade-levels/subjectGradeLevel-model');

exports.getAllSubjectGradeLevels = async (req, res) => {
  try {
    const subjectGradeLevels = await fetchAllSubjectGradeLevels();
    return res.status(200).json({
      success: true,
      data: subjectGradeLevels,
      count: subjectGradeLevels.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Subject Grade Levels Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching subject grade levels',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


exports.getSubjectGradeLevelsByGradeLevel = async (req, res) => {
  const { gradeLevelId } = req.params;

  const gradeLevelIdInt = parseInt(gradeLevelId);
  if (!gradeLevelIdInt || gradeLevelIdInt <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade level ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const subjects = await fetchSubjectGradeLevelsByGradeLevel(gradeLevelIdInt);
    return res.status(200).json({
      success: true,
      data: subjects,
      count: subjects.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Subject Grade Levels By Grade Level Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching subjects for grade level',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.createSubjectGradeLevel = async (req, res) => {
  const { subject_id, grade_level_id, is_required, units } = req.body;
  const userId = req.user?.user_id;

  if (!subject_id || !Number.isInteger(subject_id) || subject_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Subject ID is required and must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!grade_level_id || !Number.isInteger(grade_level_id) || grade_level_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade level ID is required and must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (typeof is_required !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'is_required must be a boolean value',
      timestamp: new Date().toISOString()
    });
  }

  if (units !== undefined && (typeof units !== 'number' || units < 0 || units > 99.9)) {
    return res.status(400).json({
      success: false,
      error: 'Units must be a number between 0 and 99.9',
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
    const subjectGradeLevel = await createNewSubjectGradeLevel({
      subject_id,
      grade_level_id,
      is_required,
      units
    }, userId);

    return res.status(201).json({
      success: true,
      message: 'Subject grade level assignment created successfully',
      data: subjectGradeLevel,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create Subject Grade Level Error:', error);
    if (error.message.includes('Subject grade level assignment already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Subject is already assigned to this grade level',
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
    if (error.message.includes('Grade level not found')) {
      return res.status(404).json({
        success: false,
        error: 'Grade level not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Invalid user ID')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID for logging',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while creating subject grade level assignment',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.deleteSubjectGradeLevel = async (req, res) => {
  const { subjectId, gradeLevelId } = req.params;
  const userId = req.user?.user_id;

  const subjectIdInt = parseInt(subjectId);
  const gradeLevelIdInt = parseInt(gradeLevelId);

  if (!subjectIdInt || subjectIdInt <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Subject ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!gradeLevelIdInt || gradeLevelIdInt <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade level ID must be a positive integer',
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
    const result = await deleteSubjectGradeLevelById(subjectIdInt, gradeLevelIdInt, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Subject grade level assignment not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subject grade level assignment deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete Subject Grade Level Error:', error);
    if (error.message.includes('Subject grade level assignment not found')) {
      return res.status(404).json({
        success: false,
        error: 'Subject grade level assignment not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Cannot delete subject grade level')) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete subject grade level assignment as it is being used in curriculum or enrollments',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Invalid user ID')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID for logging',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while deleting subject grade level assignment',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.bulkCreateSubjectGradeLevels = async (req, res) => {
  const { assignments } = req.body;
  const userId = req.user?.user_id;

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Assignments must be a non-empty array',
      timestamp: new Date().toISOString()
    });
  }

  for (let i = 0; i < assignments.length; i++) {
    const { subject_id, grade_level_id, is_required, units } = assignments[i];
    
    if (!subject_id || !Number.isInteger(subject_id) || subject_id <= 0) {
      return res.status(400).json({
        success: false,
        error: `Assignment ${i + 1}: Subject ID is required and must be a positive integer`,
        timestamp: new Date().toISOString()
      });
    }

    if (!grade_level_id || !Number.isInteger(grade_level_id) || grade_level_id <= 0) {
      return res.status(400).json({
        success: false,
        error: `Assignment ${i + 1}: Grade level ID is required and must be a positive integer`,
        timestamp: new Date().toISOString()
      });
    }

    if (typeof is_required !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: `Assignment ${i + 1}: is_required must be a boolean value`,
        timestamp: new Date().toISOString()
      });
    }

    if (units !== undefined && (typeof units !== 'number' || units < 0 || units > 99.9)) {
      return res.status(400).json({
        success: false,
        error: `Assignment ${i + 1}: Units must be a number between 0 and 99.9`,
        timestamp: new Date().toISOString()
      });
    }
  }

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const results = await bulkCreateSubjectGradeLevels(assignments, userId);

    return res.status(201).json({
      success: true,
      message: 'Subject grade level assignments created successfully',
      data: results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bulk Create Subject Grade Levels Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating subject grade level assignments',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
