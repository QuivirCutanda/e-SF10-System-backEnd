const { 
  fetchAllSections, 
  fetchSectionById, 
  createNewSection, 
  updateSectionById, 
  deleteSectionById 
} = require('../../models/sections/section-model');

exports.getAllSections = async (req, res) => {
  try {
    const sections = await fetchAllSections();
    return res.status(200).json({
      success: true,
      data: sections,
      count: sections.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get All Sections Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching sections',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getSectionById = async (req, res) => {
  const { id } = req.params;
  const sectionId = parseInt(id);

  if (!sectionId || sectionId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Section ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const section = await fetchSectionById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: section,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get Section By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching section',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.createSection = async (req, res) => {
  const { section_name, grade_level_id, school_year_id } = req.body;
  const userId = req.user?.user_id;

  if (!section_name || typeof section_name !== 'string' || section_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Section name is required and must be a non-empty string',
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
    const section = await createNewSection({
      section_name: section_name.trim(),
      grade_level_id,
      school_year_id
    }, userId);

    return res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create Section Error:', error);
    if (error.message.includes('Section already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Section name already exists for this grade level and school year',
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
    if (error.message.includes('School year not found')) {
      return res.status(404).json({
        success: false,
        error: 'School year not found',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while creating section',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.updateSection = async (req, res) => {
  const { id } = req.params;
  const { section_name, grade_level_id, school_year_id } = req.body;
  const userId = req.user?.user_id;
  const sectionId = parseInt(id);

  if (!sectionId || sectionId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Section ID must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!section_name || typeof section_name !== 'string' || section_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Section name is required and must be a non-empty string',
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
    const updatedSection = await updateSectionById(sectionId, {
      section_name: section_name.trim(),
      grade_level_id,
      school_year_id
    }, userId);

    if (!updatedSection) {
      return res.status(404).json({
        success: false,
        error: 'Section not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: updatedSection,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update Section Error:', error);
    if (error.message.includes('Section not found')) {
      return res.status(404).json({
        success: false,
        error: 'Section not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Section already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Section name already exists for this grade level and school year',
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
    if (error.message.includes('School year not found')) {
      return res.status(404).json({
        success: false,
        error: 'School year not found',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while updating section',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.deleteSection = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id;
  const sectionId = parseInt(id);

  if (!sectionId || sectionId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Section ID must be a positive integer',
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
    const result = await deleteSectionById(sectionId, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Section not found',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete Section Error:', error);
    if (error.message.includes('Section not found')) {
      return res.status(404).json({
        success: false,
        error: 'Section not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Cannot delete section')) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete section as it is being used in enrollments or assignments',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while deleting section',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};