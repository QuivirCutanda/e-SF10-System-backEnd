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
    const { logActivity } = require('../../utils/activityLog');

exports.createCurriculum = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { curriculum_name, school_year_id, is_active = true } = req.body;
  const userId = req.user?.user_id;
  let connection;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User ID not found in request',
    });
  }

  try {
    connection = await db.getConnection();

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
      curriculumId: result.insertId,
      data: {
        curriculum_id: result.insertId,
        curriculum_name,
        school_year_id,
        is_active,
      },
    });
  } catch (error) {
    console.error('Create Curriculum Error:', error);

    // Handle invalid school year ID error from model
    if (error.message.includes('Invalid school year ID')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid school year ID',
        details: 'The specified school year does not exist',
      });
    }

    // Handle foreign key constraint error (fallback, in case check fails)
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'Invalid school year ID',
        details: 'The specified school year does not exist',
      });
    }

    // Handle duplicate entry error
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
      timestamp: new Date().toISOString(),
    });
  } finally {
    if (connection) await connection.release();
  }
};

    exports.getAllCurriculums = async (req, res) => {
    let { page = 1, limit = 10, school_year_id, is_active } = req.query;
    page = parseInt(page) > 0 ? parseInt(page) : 1;
    limit = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const offset = (page - 1) * limit;
    let connection;

    try {
        connection = await db.getConnection();
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
        timestamp: new Date().toISOString()
        });
    } finally {
        if (connection) await connection.release();
    }
    };

    exports.getCurriculumById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const curriculumId = parseInt(id);
    let connection;

    try {
        connection = await db.getConnection();
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
        timestamp: new Date().toISOString()
        });
    } finally {
        if (connection) await connection.release();
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

    if (isNaN(curriculumId)) {
        return res.status(400).json({
        success: false,
        error: 'Invalid curriculum ID',
        curriculumId
        });
    }

    if (!userId) {
        return res.status(401).json({
        success: false,
        error: 'Unauthorized: User ID not found in request'
        });
    }

    try {
        // Check if curriculum name is being changed and already exists
        if (curriculum_name && school_year_id) {
        const connection = await db.getConnection();
        try {
            const [existing] = await connection.execute(
            'SELECT curriculum_id FROM curriculum WHERE curriculum_name = ? AND school_year_id = ? AND curriculum_id != ?',
            [curriculum_name, school_year_id, curriculumId]
            );
            if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Curriculum name already exists for this school year',
                details: `Curriculum name "${curriculum_name}" is already in use for this school year`
            });
            }
        } finally {
            await connection.release();
        }
        }

        const result = await updateCurriculumModel(curriculumId, { curriculum_name, school_year_id, is_active }, userId);
        
        return res.status(200).json({
        success: true,
        message: 'Curriculum updated successfully',
        curriculumId
        });
    } catch (error) {
        console.error('Update Curriculum Error:', error);
        
        // Handle foreign key constraint error
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            error: 'Invalid school year ID',
            details: 'The specified school year does not exist'
        });
        }

        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            error: 'Curriculum name already exists for this school year'
        });
        }

        const statusCode = error.message.includes('not found') ? 404 : 500;
        const errorMessage = error.message.includes('not found')
        ? 'Curriculum not found'
        : 'Server error updating curriculum';
        
        return res.status(statusCode).json({
        success: false,
        error: errorMessage,
        curriculumId,
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        timestamp: new Date().toISOString()
        });
    }
    };

    exports.deleteCurriculum = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const curriculumId = parseInt(id);
    const userId = req.user?.user_id;
    let connection;

    if (!userId) {
        return res.status(401).json({
        success: false,
        error: 'Unauthorized: User ID not found in request'
        });
    }

    try {
        connection = await db.getConnection();
        
        // Check if curriculum is referenced in other tables
        const [references] = await connection.execute(`
        SELECT 
            (SELECT COUNT(*) FROM enrollment WHERE curriculum_id = ?) as enrollment_count
        `, [curriculumId]);

        const { enrollment_count } = references[0];
        
        if (enrollment_count > 0) {
        return res.status(400).json({
            success: false,
            error: 'Cannot delete curriculum',
            details: 'Curriculum is currently being used in student enrollments',
            references: {
            enrollments: enrollment_count
            }
        });
        }

        const result = await deleteCurriculumModel(curriculumId, userId);
        
        return res.status(200).json({
        success: true,
        message: 'Curriculum deleted successfully',
        curriculumId
        });
    } catch (error) {
        console.error('Delete Curriculum Error:', error);
        return res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message.includes('not found') ? 'Curriculum not found' : 'Server error deleting curriculum',
        curriculumId,
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        timestamp: new Date().toISOString()
        });
    } finally {
        if (connection) await connection.release();
    }
    };

    exports.searchCurriculums = async (req, res) => {
    const { query = '', school_year_id, is_active } = req.query;
    let connection;

    try {
        connection = await db.getConnection();
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
        timestamp: new Date().toISOString()
        });
    } finally {
        if (connection) await connection.release();
    }
    };

    exports.getCurriculumsBySchoolYear = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { school_year_id } = req.params;
    let { page = 1, limit = 10, is_active } = req.query;
    page = parseInt(page) > 0 ? parseInt(page) : 1;
    limit = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const offset = (page - 1) * limit;
    let connection;

    try {
        connection = await db.getConnection();
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
        timestamp: new Date().toISOString()
        });
    } finally {
        if (connection) await connection.release();
    }
    };

    exports.getActiveCurriculums = async (req, res) => {
    let { page = 1, limit = 10, school_year_id } = req.query;
    page = parseInt(page) > 0 ? parseInt(page) : 1;
    limit = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const offset = (page - 1) * limit;
    let connection;

    try {
        connection = await db.getConnection();
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
        timestamp: new Date().toISOString()
        });
    } finally {
        if (connection) await connection.release();
    }
    };

exports.addSubjectToCurriculum = async (req, res) => {
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
    const results = [];
    for (const subject_id of subject_ids) {
      try {
        await addSubjectToCurriculumModel(curriculumId, subject_id, userId);
        results.push({ curriculum_id: curriculumId, subject_id });
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          results.push({ curriculum_id: curriculumId, subject_id, error: 'Subject already exists in this curriculum' });
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          results.push({ curriculum_id: curriculumId, subject_id, error: 'Invalid subject ID' });
        } else {
          throw error; 
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Subjects processed for curriculum',
      data: results
    });
  } catch (error) {
    console.error('Add Subjects to Curriculum Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error adding subjects to curriculum',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

    exports.removeSubjectFromCurriculum = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id, subject_id } = req.params;
    const curriculumId = parseInt(id);
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
            subject_id: subjectId
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
        timestamp: new Date().toISOString()
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
    page = parseInt(page) > 0 ? parseInt(page) : 1;
    limit = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const offset = (page - 1) * limit;
    const curriculumId = parseInt(id);
    let connection;

    try {
        connection = await db.getConnection();
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
        timestamp: new Date().toISOString()
        });
    } finally {
        if (connection) await connection.release();
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
    let connection;

    if (!userId) {
        return res.status(401).json({
        success: false,
        error: 'Unauthorized: User ID not found in request'
        });
    }

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Get current curriculum status
        const [curriculum] = await connection.execute(
        'SELECT curriculum_id, curriculum_name, is_active FROM curriculum WHERE curriculum_id = ?',
        [curriculumId]
        );

        if (curriculum.length === 0) {
        await connection.rollback();
        return res.status(404).json({
            success: false,
            error: 'Curriculum not found',
            details: `No curriculum found with ID ${curriculumId}`
        });
        }

        const currentStatus = curriculum[0].is_active;
        const newStatus = !currentStatus;

        // Update curriculum status
        const [result] = await connection.execute(
        'UPDATE curriculum SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE curriculum_id = ?',
        [newStatus, curriculumId]
        );

        if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(500).json({
            success: false,
            error: 'Failed to update curriculum status'
        });
        }

        // Log the activity
        const curriculumName = curriculum[0].curriculum_name;
        await logActivity(
        userId, 
        `Toggled curriculum status: ${curriculumName} from ${currentStatus ? 'active' : 'inactive'} to ${newStatus ? 'active' : 'inactive'}`
        );

        await connection.commit();

        return res.status(200).json({
        success: true,
        message: `Curriculum status updated successfully`,
        data: {
            curriculum_id: curriculumId,
            curriculum_name: curriculumName,
            previous_status: currentStatus,
            new_status: newStatus
        }
        });
    } catch (error) {
        console.error('Toggle Curriculum Status Error:', error);
        if (connection) await connection.rollback();
        
        return res.status(500).json({
        success: false,
        error: 'Server error toggling curriculum status',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        timestamp: new Date().toISOString()
        });
    } finally {
        if (connection) await connection.release();
    }
    };