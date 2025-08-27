const { 
  fetchAllGradeLevels, 
  createNewGradeLevel, 
  updateGradeLevelById, 
  deleteGradeLevelById,
  fetchGradeLevelById 
} = require('../../models/grade-levels/gradeLevel-model');

exports.getAllGradeLevels = async (req, res) => {
  try {
    const gradeLevels = await fetchAllGradeLevels();
    return res.status(200).json({
      success: true,
      data: gradeLevels,
      count: gradeLevels.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Grade Levels Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching grade levels',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getGradeLevelById = async (req, res) => {
  const { id } = req.params;

  const gradeLevelId = parseInt(id);
  if (!gradeLevelId || gradeLevelId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade level ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const gradeLevel = await fetchGradeLevelById(gradeLevelId);
    if (!gradeLevel) {
      return res.status(404).json({
        success: false,
        error: 'Grade level not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: gradeLevel,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Grade Level By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching grade level',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.createGradeLevel = async (req, res) => {
  const { grade_code, grade_name, grade_order } = req.body;
  const userId = req.user?.user_id; 

  if (!grade_code || typeof grade_code !== 'string' || grade_code.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade code is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!grade_name || typeof grade_name !== 'string' || grade_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade name is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!grade_order || !Number.isInteger(grade_order) || grade_order <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade order is required and must be a positive integer',
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
    const gradeLevel = await createNewGradeLevel({
      grade_code: grade_code.trim(),
      grade_name: grade_name.trim(),
      grade_order
    }, userId);

    return res.status(201).json({
      success: true,
      message: 'Grade level created successfully',
      data: gradeLevel,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create Grade Level Error:', error);
    if (error.message.includes('Grade code already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Grade code already exists',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Grade order already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Grade order already exists',
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
      error: 'Server error while creating grade level',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.updateGradeLevel = async (req, res) => {
  const { id } = req.params;
  const { grade_code, grade_name, grade_order } = req.body;
  const userId = req.user?.user_id; 

  const gradeLevelId = parseInt(id);
  if (!gradeLevelId || gradeLevelId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade level ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!grade_code || typeof grade_code !== 'string' || grade_code.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade code is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!grade_name || typeof grade_name !== 'string' || grade_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade name is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!grade_order || !Number.isInteger(grade_order) || grade_order <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Grade order is required and must be a positive integer',
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
    const updatedGradeLevel = await updateGradeLevelById(gradeLevelId, {
      grade_code: grade_code.trim(),
      grade_name: grade_name.trim(),
      grade_order
    }, userId);

    if (!updatedGradeLevel) {
      return res.status(404).json({
        success: false,
        error: 'Grade level not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Grade level updated successfully',
      data: updatedGradeLevel,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update Grade Level Error:', error);
    if (error.message.includes('Grade level not found')) {
      return res.status(404).json({
        success: false,
        error: 'Grade level not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Grade code already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Grade code already exists for another grade level',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Grade order already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Grade order already exists for another grade level',
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
      error: 'Server error while updating grade level',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.deleteGradeLevel = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id; 

  const gradeLevelId = parseInt(id);
  if (!gradeLevelId || gradeLevelId <= 0) {
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
    const result = await deleteGradeLevelById(gradeLevelId, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Grade level not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Grade level deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete Grade Level Error:', error);
    if (error.message.includes('Grade level not found')) {
      return res.status(404).json({
        success: false,
        error: 'Grade level not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Cannot delete grade level')) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete grade level as it is being used in sections or subject assignments',
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
      error: 'Server error while deleting grade level',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};