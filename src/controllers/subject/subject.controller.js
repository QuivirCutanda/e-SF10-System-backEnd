const db = require('../../config/db');
const { 
  createSubjectModel, 
  getAllSubjectsModel, 
  getSubjectByIdModel, 
  updateSubjectModel, 
  deleteSubjectModel,
  searchSubjectsModel,
  getSubjectsByGradeLevelModel,
  checkSubjectCodeExistsModel 
} = require('../../models/subject/subject.model');
const { validationResult } = require('express-validator');
const { logActivity } = require('../../utils/activityLog');

exports.createSubject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { subject_code, subject_name, description, grade_level, is_required, units } = req.body;
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

    const codeExists = await checkSubjectCodeExistsModel(subject_code);
    if (codeExists) {
      return res.status(409).json({
        success: false,
        error: 'Subject code already exists',
        details: `Subject code ${subject_code} is already in use`
      });
    }

    const result = await createSubjectModel(
      subject_code, 
      subject_name, 
      description, 
      grade_level, 
      is_required, 
      units, 
      userId
    );

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subjectId: result.insertId,
      data: {
        subject_id: result.insertId,
        subject_code,
        subject_name,
        description: description || null,
        grade_level
      }
    });
  } catch (error) {
    console.error('Create Subject Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Subject code already exists',
        details: `Subject code ${subject_code} is already in use`
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server error during subject creation',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  } finally {
    if (connection) await connection.release();
  }
};

exports.getAllSubjects = async (req, res) => {
  let { page = 1, limit = 10, grade_level_id } = req.query;
  page = parseInt(page) > 0 ? parseInt(page) : 1;
  limit = parseInt(limit) > 0 ? parseInt(limit) : 10;
  const offset = (page - 1) * limit;
  let connection;

  try {
    connection = await db.getConnection();
    const { subjects, total } = await getAllSubjectsModel(limit, offset, grade_level_id);

    return res.status(200).json({
      success: true,
      data: subjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
    });
  } catch (error) {
    console.error('Get All Subjects Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving subjects',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  } finally {
    if (connection) await connection.release();
  }
};

exports.getSubjectById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const subjectId = parseInt(id);
  let connection;

  try {
    connection = await db.getConnection();
    const subject = await getSubjectByIdModel(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found',
        details: `No subject found with ID ${subjectId}`
      });
    }

    return res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Get Subject By ID Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving subject',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  } finally {
    if (connection) await connection.release();
  }
};

exports.updateSubject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const subjectId = parseInt(id, 10);
  const { subject_code, subject_name, description, grade_level } = req.body;
  const userId = req.user?.user_id;

  if (isNaN(subjectId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subject ID',
      subjectId
    });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User ID not found in request'
    });
  }

  try {
    if (subject_code) {
      const connection = await db.getConnection();
      try {
        const [existing] = await connection.execute(
          'SELECT subject_id FROM subjects WHERE subject_code = ? AND subject_id != ?',
          [subject_code, subjectId]
        );
        if (existing.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'Subject code already exists',
            details: `Subject code ${subject_code} is already in use by another subject`
          });
        }
      } finally {
        await connection.release();
      }
    }

    const result = await updateSubjectModel(subjectId, { subject_code, subject_name, description, grade_level }, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      subjectId
    });
  } catch (error) {
    console.error('Update Subject Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Subject code already exists',
        details: `Subject code ${subject_code} is already in use`
      });
    }

    const statusCode = error.message.includes('not found') ? 404 : 500;
    const errorMessage = error.message.includes('not found')
      ? 'Subject not found'
      : 'Server error updating subject';
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      subjectId,
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};

exports.searchSubjects = async (req, res) => {
  const { query = '', grade_level } = req.query;
  let connection;

  try {
    connection = await db.getConnection();
    const subjects = await searchSubjectsModel(query, grade_level);

    return res.status(200).json({
      success: true,
      data: subjects,
      query,
      filters: grade_level ? { grade_level } : {}
    });
  } catch (error) {
    console.error('Search Subjects Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error searching subjects',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  } finally {
    if (connection) await connection.release();
  }
};
