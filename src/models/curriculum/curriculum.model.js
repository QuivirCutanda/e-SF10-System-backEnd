const db = require('../../config/db');
const { logActivity } = require('../../utils/activityLog');

const checkSchoolYearExists = async (schoolYearId) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      'SELECT school_year_id FROM school_years WHERE school_year_id = ?',
      [schoolYearId]
    );
    return rows.length > 0;
  } finally {
    if (connection) await connection.release();
  }
};

const createCurriculumModel = async (curriculumName, schoolYearId, isActive, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const schoolYearExists = await checkSchoolYearExists(schoolYearId);
    if (!schoolYearExists) {
      throw new Error('Invalid school year ID: The specified school year does not exist');
    }

    const [result] = await connection.execute(
      `INSERT INTO curriculum (curriculum_name, school_year_id, is_active)
       VALUES (?, ?, ?)`,
      [curriculumName, schoolYearId, isActive]
    );

    const curriculumId = result.insertId;
    await logActivity(userId, `Created curriculum: ${curriculumName} for school year ID ${schoolYearId}`);

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};


const getAllCurriculumsModel = async (limit, offset, schoolYearId = null, isActive = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT c.curriculum_id, c.curriculum_name, c.school_year_id, c.is_active,
             c.created_at, c.updated_at,
             CONCAT(sy.start_year, '-', sy.end_year) as school_year_period
      FROM curriculum c
      LEFT JOIN school_years sy ON c.school_year_id = sy.school_year_id
    `;
    let countQuery = `SELECT COUNT(*) as total FROM curriculum c`;
    let queryParams = [];
    let countParams = [];
    let whereConditions = [];

    if (schoolYearId) {
      whereConditions.push('c.school_year_id = ?');
      queryParams.push(schoolYearId);
      countParams.push(schoolYearId);
    }

    if (isActive !== null) {
      whereConditions.push('c.is_active = ?');
      queryParams.push(isActive === 'true' || isActive === true);
      countParams.push(isActive === 'true' || isActive === true);
    }

    if (whereConditions.length > 0) {
      const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [rows] = await connection.execute(query, queryParams);
    const [totalRows] = await connection.execute(countQuery, countParams);
    
    return { curriculums: rows, total: totalRows[0].total };
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getCurriculumByIdModel = async (curriculumId) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      `SELECT c.curriculum_id, c.curriculum_name, c.school_year_id, c.is_active,
              c.created_at, c.updated_at,
              CONCAT(sy.start_year, '-', sy.end_year) as school_year_period,
              (SELECT COUNT(*) FROM curriculum_subjects cs WHERE cs.curriculum_id = c.curriculum_id) as subject_count
       FROM curriculum c
       LEFT JOIN school_years sy ON c.school_year_id = sy.school_year_id
       WHERE c.curriculum_id = ?`,
      [parseInt(curriculumId)]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const updateCurriculumModel = async (curriculumId, updateData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      'SELECT curriculum_id, curriculum_name FROM curriculum WHERE curriculum_id = ?',
      [curriculumId]
    );
    if (existing.length === 0) {
      throw new Error('Curriculum not found');
    }

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
    updateValues.push(curriculumId);

    const [result] = await connection.execute(
      `UPDATE curriculum SET ${updateFields.join(', ')} WHERE curriculum_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to update curriculum');
    }

    const oldCurriculum = existing[0];
    await logActivity(userId, `Updated curriculum ID ${curriculumId}: ${oldCurriculum.curriculum_name}`);

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const deleteCurriculumModel = async (curriculumId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      'SELECT curriculum_id, curriculum_name FROM curriculum WHERE curriculum_id = ?',
      [parseInt(curriculumId)]
    );
    if (existing.length === 0) {
      throw new Error('Curriculum not found');
    }

    await connection.execute(
      'DELETE FROM curriculum_subjects WHERE curriculum_id = ?',
      [parseInt(curriculumId)]
    );

    const [result] = await connection.execute(
      'DELETE FROM curriculum WHERE curriculum_id = ?',
      [parseInt(curriculumId)]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to delete curriculum');
    }

    const deletedCurriculum = existing[0];
    await logActivity(userId, `Deleted curriculum ID ${curriculumId}: ${deletedCurriculum.curriculum_name}`);

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const searchCurriculumsModel = async (searchQuery, schoolYearId = null, isActive = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT c.curriculum_id, c.curriculum_name, c.school_year_id, c.is_active,
             c.created_at, c.updated_at,
             CONCAT(sy.start_year, '-', sy.end_year) as school_year_period
      FROM curriculum c
      LEFT JOIN school_years sy ON c.school_year_id = sy.school_year_id
      WHERE c.curriculum_name LIKE ?
    `;
    let queryParams = [`%${searchQuery}%`];

    if (schoolYearId) {
      query += ` AND c.school_year_id = ?`;
      queryParams.push(schoolYearId);
    }

    if (isActive !== null) {
      query += ` AND c.is_active = ?`;
      queryParams.push(isActive === 'true' || isActive === true);
    }

    query += ` ORDER BY 
      CASE WHEN c.curriculum_name LIKE ? THEN 1 ELSE 2 END,
      c.created_at DESC
      LIMIT 50`;
    
    queryParams.push(`${searchQuery}%`);

    const [rows] = await connection.execute(query, queryParams);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getCurriculumsBySchoolYearModel = async (schoolYearId, limit, offset, isActive = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT c.curriculum_id, c.curriculum_name, c.school_year_id, c.is_active,
             c.created_at, c.updated_at,
             CONCAT(sy.start_year, '-', sy.end_year) as school_year_period
      FROM curriculum c
      LEFT JOIN school_years sy ON c.school_year_id = sy.school_year_id
      WHERE c.school_year_id = ?
    `;
    let countQuery = `SELECT COUNT(*) as total FROM curriculum WHERE school_year_id = ?`;
    let queryParams = [schoolYearId];
    let countParams = [schoolYearId];

    if (isActive !== null) {
      query += ` AND c.is_active = ?`;
      countQuery += ` AND is_active = ?`;
      queryParams.push(isActive === 'true' || isActive === true);
      countParams.push(isActive === 'true' || isActive === true);
    }

    query += ` ORDER BY c.curriculum_name ASC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [rows] = await connection.execute(query, queryParams);
    const [totalRows] = await connection.execute(countQuery, countParams);
    
    return { curriculums: rows, total: totalRows[0].total };
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getActiveCurriculumsModel = async (limit, offset, schoolYearId = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT c.curriculum_id, c.curriculum_name, c.school_year_id, c.is_active,
             c.created_at, c.updated_at,
             CONCAT(sy.start_year, '-', sy.end_year) as school_year_period
      FROM curriculum c
      LEFT JOIN school_years sy ON c.school_year_id = sy.school_year_id
      WHERE c.is_active = TRUE
    `;
    let countQuery = `SELECT COUNT(*) as total FROM curriculum WHERE is_active = TRUE`;
    let queryParams = [];
    let countParams = [];

    if (schoolYearId) {
      query += ` AND c.school_year_id = ?`;
      countQuery += ` AND school_year_id = ?`;
      queryParams.push(schoolYearId);
      countParams.push(schoolYearId);
    }

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [rows] = await connection.execute(query, queryParams);
    const [totalRows] = await connection.execute(countQuery, countParams);
    
    return { curriculums: rows, total: totalRows[0].total };
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const addSubjectToCurriculumModel = async (curriculumId, subjectId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [curriculumExists] = await connection.execute(
      'SELECT curriculum_name FROM curriculum WHERE curriculum_id = ?',
      [curriculumId]
    );
    
    const [subjectExists] = await connection.execute(
      'SELECT subject_name, subject_code FROM subjects WHERE subject_id = ?',
      [subjectId]
    );

    if (curriculumExists.length === 0) {
      throw new Error('Curriculum not found');
    }

    if (subjectExists.length === 0) {
      throw new Error('Subject not found');
    }

    const [result] = await connection.execute(
      `INSERT INTO curriculum_subjects (curriculum_id, subject_id)
       VALUES (?, ?)`,
      [curriculumId, subjectId]
    );

    const curriculumName = curriculumExists[0].curriculum_name;
    const subjectInfo = subjectExists[0];
    await logActivity(
      userId, 
      `Added subject ${subjectInfo.subject_name} (${subjectInfo.subject_code}) to curriculum: ${curriculumName}`
    );

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const removeSubjectFromCurriculumModel = async (curriculumId, subjectId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [curriculumInfo] = await connection.execute(
      'SELECT curriculum_name FROM curriculum WHERE curriculum_id = ?',
      [curriculumId]
    );

    const [subjectInfo] = await connection.execute(
      'SELECT subject_name, subject_code FROM subjects WHERE subject_id = ?',
      [subjectId]
    );

    const [existing] = await connection.execute(
      'SELECT * FROM curriculum_subjects WHERE curriculum_id = ? AND subject_id = ?',
      [curriculumId, subjectId]
    );

    if (existing.length === 0) {
      throw new Error('Subject not found in this curriculum');
    }

    const [result] = await connection.execute(
      'DELETE FROM curriculum_subjects WHERE curriculum_id = ? AND subject_id = ?',
      [curriculumId, subjectId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to remove subject from curriculum');
    }

    if (curriculumInfo.length > 0 && subjectInfo.length > 0) {
      const curriculumName = curriculumInfo[0].curriculum_name;
      const subject = subjectInfo[0];
      await logActivity(
        userId, 
        `Removed subject ${subject.subject_name} (${subject.subject_code}) from curriculum: ${curriculumName}`
      );
    }

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getCurriculumSubjectsModel = async (curriculumId, limit, offset, gradeLevel = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT s.subject_id, s.subject_code, s.subject_name, s.description, s.grade_level,
             s.created_at, s.updated_at
      FROM curriculum_subjects cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE cs.curriculum_id = ?
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM curriculum_subjects cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE cs.curriculum_id = ?
    `;
    let queryParams = [curriculumId];
    let countParams = [curriculumId];

    if (gradeLevel) {
      query += ` AND s.grade_level = ?`;
      countQuery += ` AND s.grade_level = ?`;
      queryParams.push(gradeLevel);
      countParams.push(gradeLevel);
    }

    query += ` ORDER BY s.grade_level ASC, s.subject_name ASC LIMIT ? OFFSET ?`;
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

const checkCurriculumNameExistsModel = async (curriculumName, schoolYearId, excludeId = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = 'SELECT curriculum_id FROM curriculum WHERE curriculum_name = ? AND school_year_id = ?';
    let params = [curriculumName, schoolYearId];
    
    if (excludeId) {
      query += ' AND curriculum_id != ?';
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

const toggleCurriculumStatusModel = async (curriculumId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [curriculum] = await connection.execute(
      'SELECT curriculum_id, curriculum_name, is_active FROM curriculum WHERE curriculum_id = ?',
      [curriculumId]
    );

    if (curriculum.length === 0) {
      throw new Error('Curriculum not found');
    }

    const currentStatus = curriculum[0].is_active;
    const newStatus = !currentStatus;

    const [result] = await connection.execute(
      'UPDATE curriculum SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE curriculum_id = ?',
      [newStatus, curriculumId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to update curriculum status');
    }

    const curriculumName = curriculum[0].curriculum_name;
    await logActivity(
      userId, 
      `Toggled curriculum status: ${curriculumName} from ${currentStatus ? 'active' : 'inactive'} to ${newStatus ? 'active' : 'inactive'}`
    );

    await connection.commit();

    return {
      curriculum_id: curriculumId,
      curriculum_name: curriculumName,
      previous_status: currentStatus,
      new_status: newStatus
    };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  createCurriculumModel,
  getAllCurriculumsModel,
  getCurriculumByIdModel,
  updateCurriculumModel,
  deleteCurriculumModel,
  searchCurriculumsModel,
  getCurriculumsBySchoolYearModel,
  getActiveCurriculumsModel,
  addSubjectToCurriculumModel,
  removeSubjectFromCurriculumModel,
  getCurriculumSubjectsModel,
  checkCurriculumNameExistsModel,
  checkSchoolYearExists,
  toggleCurriculumStatusModel
};