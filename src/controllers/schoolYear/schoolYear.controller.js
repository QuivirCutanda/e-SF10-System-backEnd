const { 
  createSchoolYearModel,
  getAllSchoolYearsModel,
  getSchoolYearByIdModel,
  updateSchoolYearModel,
  deleteSchoolYearModel,
  setActiveSchoolYearModel,
  checkSchoolYearExists
} = require('../../models/schoolYear/schoolYear.model');

// Create a new school year
exports.createSchoolYear = async (req, res) => {
  const { start_year, end_year } = req.body;

  // Validation
  if (!start_year || !end_year) {
    return res.status(400).json({
      success: false,
      error: 'Start year and end year are required',
      timestamp: new Date().toISOString()
    });
  }

  // Validate year format and logic
  const startYearNum = parseInt(start_year);
  const endYearNum = parseInt(end_year);

  if (isNaN(startYearNum) || isNaN(endYearNum)) {
    return res.status(400).json({
      success: false,
      error: 'Start year and end year must be valid numbers',
      timestamp: new Date().toISOString()
    });
  }

  if (startYearNum >= endYearNum) {
    return res.status(400).json({
      success: false,
      error: 'Start year must be less than end year',
      timestamp: new Date().toISOString()
    });
  }

  if (endYearNum - startYearNum !== 1) {
    return res.status(400).json({
      success: false,
      error: 'School year must span exactly one academic year (e.g., 2023-2024)',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Check if school year already exists
    const exists = await checkSchoolYearExists(startYearNum, endYearNum);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: 'School year already exists',
        timestamp: new Date().toISOString()
      });
    }

    const newSchoolYear = await createSchoolYearModel({ start_year: startYearNum, end_year: endYearNum });
    
    return res.status(201).json({
      success: true,
      message: 'School year created successfully',
      schoolYear: newSchoolYear,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create School Year Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating school year',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

// Get all school years with pagination
exports.getAllSchoolYears = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const active = req.query.active; // Filter by active status

  try {
    const result = await getAllSchoolYearsModel(page, limit, search, active);
    
    return res.status(200).json({
      success: true,
      schoolYears: result.schoolYears,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All School Years Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching school years',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

// Get school year by ID
exports.getSchoolYearById = async (req, res) => {
  const schoolYearId = parseInt(req.params.id);

  if (isNaN(schoolYearId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid school year ID',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const schoolYear = await getSchoolYearByIdModel(schoolYearId);
    
    if (!schoolYear) {
      return res.status(404).json({
        success: false,
        error: 'School year not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      schoolYear: schoolYear,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get School Year By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching school year',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

// Update school year
exports.updateSchoolYear = async (req, res) => {
  const schoolYearId = parseInt(req.params.id);
  const { start_year, end_year, is_active } = req.body;

  if (isNaN(schoolYearId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid school year ID',
      timestamp: new Date().toISOString()
    });
  }

  // Validation
  if (!start_year || !end_year) {
    return res.status(400).json({
      success: false,
      error: 'Start year and end year are required',
      timestamp: new Date().toISOString()
    });
  }

  // Validate year format and logic
  const startYearNum = parseInt(start_year);
  const endYearNum = parseInt(end_year);

  if (isNaN(startYearNum) || isNaN(endYearNum)) {
    return res.status(400).json({
      success: false,
      error: 'Start year and end year must be valid numbers',
      timestamp: new Date().toISOString()
    });
  }

  if (startYearNum >= endYearNum) {
    return res.status(400).json({
      success: false,
      error: 'Start year must be less than end year',
      timestamp: new Date().toISOString()
    });
  }

  if (endYearNum - startYearNum !== 1) {
    return res.status(400).json({
      success: false,
      error: 'School year must span exactly one academic year (e.g., 2023-2024)',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Check if school year exists
    const existingSchoolYear = await getSchoolYearByIdModel(schoolYearId);
    if (!existingSchoolYear) {
      return res.status(404).json({
        success: false,
        error: 'School year not found',
        timestamp: new Date().toISOString()
      });
    }

    const updateData = {
      start_year: startYearNum,
      end_year: endYearNum,
      is_active: is_active !== undefined ? Boolean(is_active) : existingSchoolYear.is_active
    };

    const updatedSchoolYear = await updateSchoolYearModel(schoolYearId, updateData);
    
    return res.status(200).json({
      success: true,
      message: 'School year updated successfully',
      schoolYear: updatedSchoolYear,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update School Year Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while updating school year',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

// Set active school year (deactivates others)
exports.setActiveSchoolYear = async (req, res) => {
  const schoolYearId = parseInt(req.params.id);

  if (isNaN(schoolYearId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid school year ID',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Check if school year exists
    const existingSchoolYear = await getSchoolYearByIdModel(schoolYearId);
    if (!existingSchoolYear) {
      return res.status(404).json({
        success: false,
        error: 'School year not found',
        timestamp: new Date().toISOString()
      });
    }

    await setActiveSchoolYearModel(schoolYearId);
    
    return res.status(200).json({
      success: true,
      message: 'School year set as active successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Set Active School Year Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while setting active school year',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

// Delete school year
exports.deleteSchoolYear = async (req, res) => {
  const schoolYearId = parseInt(req.params.id);

  if (isNaN(schoolYearId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid school year ID',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Check if school year exists
    const existingSchoolYear = await getSchoolYearByIdModel(schoolYearId);
    if (!existingSchoolYear) {
      return res.status(404).json({
        success: false,
        error: 'School year not found',
        timestamp: new Date().toISOString()
      });
    }

    await deleteSchoolYearModel(schoolYearId);
    
    return res.status(200).json({
      success: true,
      message: 'School year deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete School Year Error:', error);
    
    // Handle foreign key constraint errors
    if (error.message.includes('foreign key constraint') || error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete school year as it is being used by other records',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server error while deleting school year',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};