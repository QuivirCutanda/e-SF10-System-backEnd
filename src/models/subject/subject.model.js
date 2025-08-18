const db = require('../../config/db');
const { logActivity } = require('../../utils/activityLog');

const createSubjectModel = async (subjectCode, subjectName, description, gradeLevel, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO subjects (subject_code, subject_name, description, grade_level)
       VALUES (?, ?, ?, ?)`,
      [subjectCode, subjectName, description || null, gradeLevel]
    );

    const subjectId = result.insertId;
    await logActivity(userId, `Created subject: ${subjectName} (${subjectCode}) for ${gradeLevel}`);

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getAllSubjectsModel = async (limit, offset, gradeLevel = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT subject_id, subject_code, subject_name, description, grade_level, 
             created_at, updated_at
      FROM subjects
    `;
    let countQuery = `SELECT COUNT(*) as total FROM subjects`;
    let queryParams = [];
    let countParams = [];

    if (gradeLevel) {
      query += ` WHERE grade_level = ?`;
      countQuery += ` WHERE grade_level = ?`;
      queryParams.push(gradeLevel);
      countParams.push(gradeLevel);
    }

    query += ` ORDER BY grade_level ASC, subject_name ASC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [rows] = await connection.execute(query, queryParams);
    const [totalRows] = await connection.execute(countQuery, countParams);
    
    return { subjects: rows, total: totalRows[0].total };
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getSubjectByIdModel = async (subjectId) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      `SELECT subject_id, subject_code, subject_name, description, grade_level, 
              created_at, updated_at
       FROM subjects
       WHERE subject_id = ?`,
      [parseInt(subjectId)]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const updateSubjectModel = async (subjectId, updateData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if subject exists
    const [existing] = await connection.execute(
      'SELECT subject_id, subject_name, subject_code FROM subjects WHERE subject_id = ?',
      [subjectId]
    );
    if (existing.length === 0) {
      throw new Error('Subject not found');
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(subjectId);

    const [result] = await connection.execute(
      `UPDATE subjects SET ${updateFields.join(', ')} WHERE subject_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to update subject');
    }

    const oldSubject = existing[0];
    await logActivity(userId, `Updated subject ID ${subjectId}: ${oldSubject.subject_name} (${oldSubject.subject_code})`);

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const deleteSubjectModel = async (subjectId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if subject exists
    const [existing] = await connection.execute(
      'SELECT subject_id, subject_name, subject_code FROM subjects WHERE subject_id = ?',
      [parseInt(subjectId)]
    );
    if (existing.length === 0) {
      throw new Error('Subject not found');
    }

    const [result] = await connection.execute(
      'DELETE FROM subjects WHERE subject_id = ?',
      [parseInt(subjectId)]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to delete subject');
    }

    const deletedSubject = existing[0];
    await logActivity(userId, `Deleted subject ID ${subjectId}: ${deletedSubject.subject_name} (${deletedSubject.subject_code})`);

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const searchSubjectsModel = async (searchQuery, gradeLevel = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT subject_id, subject_code, subject_name, description, grade_level, 
             created_at, updated_at
      FROM subjects
      WHERE (subject_name LIKE ? OR subject_code LIKE ? OR description LIKE ?)
    `;
    let queryParams = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];

    if (gradeLevel) {
      query += ` AND grade_level = ?`;
      queryParams.push(gradeLevel);
    }

    query += ` ORDER BY 
      CASE 
        WHEN subject_name LIKE ? THEN 1
        WHEN subject_code LIKE ? THEN 2
        WHEN description LIKE ? THEN 3
        ELSE 4
      END,
      grade_level ASC, subject_name ASC
      LIMIT 50`;
    
    queryParams.push(`${searchQuery}%`, `${searchQuery}%`, `%${searchQuery}%`);

    const [rows] = await connection.execute(query, queryParams);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getSubjectsByGradeLevelModel = async (gradeLevel, limit, offset) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const [rows] = await connection.execute(
      `SELECT subject_id, subject_code, subject_name, description, grade_level, 
              created_at, updated_at
       FROM subjects
       WHERE grade_level = ?
       ORDER BY subject_name ASC
       LIMIT ? OFFSET ?`,
      [gradeLevel, parseInt(limit), parseInt(offset)]
    );

    const [totalRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM subjects WHERE grade_level = ?`,
      [gradeLevel]
    );
    
    return { subjects: rows, total: totalRows[0].total };
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const checkSubjectCodeExistsModel = async (subjectCode, excludeId = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = 'SELECT subject_id FROM subjects WHERE subject_code = ?';
    let params = [subjectCode];
    
    if (excludeId) {
      query += ' AND subject_id != ?';
      params.push(excludeId);
    }

    const [rows] = await connection.execute(query, params);
    return rows.length > 0;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  createSubjectModel,
  getAllSubjectsModel,
  getSubjectByIdModel,
  updateSubjectModel,
  deleteSubjectModel,
  searchSubjectsModel,
  getSubjectsByGradeLevelModel,
  checkSubjectCodeExistsModel
};