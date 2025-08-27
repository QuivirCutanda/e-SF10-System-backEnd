const db = require('../../config/db');
const { 
  createCurriculumModel, 
  getAllCurriculumsModel, 
  getCurriculumByIdModel, 
  updateCurriculumModel, 
  deleteCurriculumModel,
  searchCurriculumsModel,
  getCurriculumsBySchoolYearModel,
  addSubjectToCurriculumModel,
  removeSubjectFromCurriculumModel,
  getCurriculumSubjectsModel,
  getActiveCurriculumsModel,
  checkCurriculumNameExistsModel
} = require('../../models/curriculum/curriculum.model');
const { validationResult } = require('express-validator');

exports.createCurriculum = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { curriculum_name, school_year_id, is_active = true } = req.body;
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User ID not found in request',
    });
  }

  try {
    // Check if curriculum name already exists for the same school year
    const nameExists = await checkCurriculumNameExistsModel(curriculum_name, school_year_id);
    if (nameExists) {
      return res.status(409).json({
        success: false,
        error: 'Curriculum name already exists for this school year',
        details: `Curriculum name "${curriculum_name}" is already in use for the selected school year`,
      });
    }

    const result = await createCurriculumModel(curriculum_name, school_year_id, is_active, userId);

    return res.status(201).json({
      success: true,
      message: 'Curriculum created successfully',
      data: {
        curriculum_id: result.insertId,
        curriculum_name,
        school_year_id,
        is_active,
      },
    });
  } catch (error) {
    console.error('Create Curriculum Error:', error);

    if (error.message.includes('Invalid school year ID')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid school year ID',
        details: 'The specified school year does not exist',
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'Invalid school year ID',
        details: 'The specified school year does not exist',
      });
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Curriculum name already exists for this school year',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server error during curriculum creation',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.getAllCurriculums = async (req, res) => {
  let { page = 1, limit = 10, school_year_id, is_active } = req.query;
  page = Math.max(1, parseInt(page)) || 1;
  limit = Math.max(1, parseInt(limit)) || 10;
  const offset = (page - 1) * limit;

  try {
    const { curriculums, total } = await getAllCurriculumsModel(limit, offset, school_year_id, is_active);

    return res.status(200).json({
      success: true,
      data: curriculums,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        ...(school_year_id && { school_year_id }),
        ...(is_active !== undefined && { is_active })
      }
    });
  } catch (error) {
    console.error('Get All Curriculums Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving curriculums',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.getCurriculumById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const curriculumId = parseInt(id);

  try {
    const curriculum = await getCurriculumByIdModel(curriculumId);

    if (!curriculum) {
      return res.status(404).json({
        success: false,
        error: 'Curriculum not found',
        details: `No curriculum found with ID ${curriculumId}`
      });
    }

    return res.status(200).json({
      success: true,
      data: curriculum
    });
  } catch (error) {
    console.error('Get Curriculum By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving curriculum',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.updateCurriculum = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const curriculumId = parseInt(id, 10);
  const { curriculum_name, school_year_id, is_active } = req.body;
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User ID not found in request'
    });
  }

  try {
    // Check for name conflicts if updating name
    if (curriculum_name && school_year_id) {
      const nameExists = await checkCurriculumNameExistsModel(curriculum_name, school_year_id, curriculumId);
      if (nameExists) {
        return res.status(409).json({
          success: false,
          error: 'Curriculum name already exists for this school year',
          details: `Curriculum name "${curriculum_name}" is already in use for this school year`
        });
      }
    }

    const result = await updateCurriculumModel(curriculumId, { curriculum_name, school_year_id, is_active }, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Curriculum updated successfully',
      data: { curriculum_id: curriculumId }
    });
  } catch (error) {
    console.error('Update Curriculum Error:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'Invalid school year ID',
        details: 'The specified school year does not exist'
      });
    }

    const statusCode = error.message.includes('not found') ? 404 : 500;
    const errorMessage = error.message.includes('not found')
      ? 'Curriculum not found'
      : 'Server error updating curriculum';
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};


exports.searchCurriculums = async (req, res) => {
  const { query = '', school_year_id, is_active } = req.query;

  try {
    const curriculums = await searchCurriculumsModel(query, school_year_id, is_active);

    return res.status(200).json({
      success: true,
      data: curriculums,
      query,
      filters: {
        ...(school_year_id && { school_year_id }),
        ...(is_active !== undefined && { is_active })
      }
    });
  } catch (error) {
    console.error('Search Curriculums Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error searching curriculums',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.getCurriculumsBySchoolYear = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { school_year_id } = req.params;
  let { page = 1, limit = 10, is_active } = req.query;
  page = Math.max(1, parseInt(page)) || 1;
  limit = Math.max(1, parseInt(limit)) || 10;
  const offset = (page - 1) * limit;

  try {
    const { curriculums, total } = await getCurriculumsBySchoolYearModel(school_year_id, limit, offset, is_active);

    return res.status(200).json({
      success: true,
      data: curriculums,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      school_year_id,
      filters: is_active !== undefined ? { is_active } : {}
    });
  } catch (error) {
    console.error('Get Curriculums By School Year Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving curriculums by school year',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.getActiveCurriculums = async (req, res) => {
  let { page = 1, limit = 10, school_year_id } = req.query;
  page = Math.max(1, parseInt(page)) || 1;
  limit = Math.max(1, parseInt(limit)) || 10;
  const offset = (page - 1) * limit;

  try {
    const { curriculums, total } = await getActiveCurriculumsModel(limit, offset, school_year_id);

    return res.status(200).json({
      success: true,
      data: curriculums,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: school_year_id ? { school_year_id } : {}
    });
  } catch (error) {
    console.error('Get Active Curriculums Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving active curriculums',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.addSubjectToCurriculum = async (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const { subject_ids } = req.body;
  const curriculumId = parseInt(id);
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User ID not found in request'
    });
  }

  if (!Array.isArray(subject_ids) || subject_ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'subject_ids must be a non-empty array'
    });
  }

  try {
    // Fetch curriculum name first
    const [curriculum] = await db.execute(
      'SELECT curriculum_name FROM curriculum WHERE curriculum_id = ?',
      [curriculumId]
    );

    if (curriculum.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Curriculum not found'
      });
    }

    const curriculumName = curriculum[0].curriculum_name;

    const results = await Promise.allSettled(
      subject_ids.map(subject_id => addSubjectToCurriculumModel(curriculumId, subject_id, userId))
    );

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      const subject_id = subject_ids[index];
      if (result.status === 'fulfilled') {
        const { subject_code, subject_name } = result.value;
        successful.push({
          curriculum_id: curriculumId,
          curriculum_name: curriculumName,
          subject_id,
          subject_code,
          subject_name
        });
      } else {
        const error = result.reason;
        let errorMessage;
        if (error.code === 'ER_DUP_ENTRY') {
          errorMessage = 'Subject already exists in this curriculum';
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          errorMessage = 'Invalid subject ID';
        } else {
          errorMessage = error.message;
        }
        failed.push({
          curriculum_id: curriculumId,
          curriculum_name: curriculumName,
          subject_id,
          error: errorMessage
        });
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Subjects processed for curriculum',
      data: {
        successful,
        failed,
        summary: {
          total: subject_ids.length,
          successful: successful.length,
          failed: failed.length
        }
      }
    });
  } catch (error) {
    console.error('Add Subjects to Curriculum Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error adding subjects to curriculum',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.removeSubjectFromCurriculum = async (req, res) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { curriculum_id, subject_id } = req.params;
  const curriculumId = parseInt(curriculum_id);
  const subjectId = parseInt(subject_id);
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User ID not found in request'
    });
  }

  try {
    const result = await removeSubjectFromCurriculumModel(curriculumId, subjectId, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Subject removed from curriculum successfully',
      data: {
        curriculum_id: curriculumId,
        curriculum_name: result.curriculum_name,
        subject_id: subjectId,
        subject_name: result.subject_name,
        subject_code: result.subject_code
      }
    });
  } catch (error) {
    console.error('Remove Subject from Curriculum Error:', error);
    
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message.includes('not found') 
        ? 'Subject not found in this curriculum' 
        : 'Server error removing subject from curriculum',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.getCurriculumSubjects = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  let { page = 1, limit = 10, grade_level } = req.query;
  page = Math.max(1, parseInt(page)) || 1;
  limit = Math.max(1, parseInt(limit)) || 10;
  const offset = (page - 1) * limit;
  const curriculumId = parseInt(id);

  try {
    const { subjects, total } = await getCurriculumSubjectsModel(curriculumId, limit, offset, grade_level);

    return res.status(200).json({
      success: true,
      data: subjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      curriculum_id: curriculumId,
      filters: grade_level ? { grade_level } : {}
    });
  } catch (error) {
    console.error('Get Curriculum Subjects Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving curriculum subjects',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};

exports.toggleCurriculumStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const curriculumId = parseInt(id);
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User ID not found in request'
    });
  }

  try {
    const result = await toggleCurriculumStatusModel(curriculumId, userId);

    return res.status(200).json({
      success: true,
      message: 'Curriculum status updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Toggle Curriculum Status Error:', error);
    
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message.includes('not found') ? 'Curriculum not found' : 'Server error toggling curriculum status',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
    });
  }
};