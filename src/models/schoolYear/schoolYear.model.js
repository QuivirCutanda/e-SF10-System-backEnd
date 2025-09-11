const db = require('../../config/db');

const createSchoolYearModel = async (schoolYearData) => {
  const { start_year, end_year } = schoolYearData;
  
  try {
    const [result] = await db.execute(
      `INSERT INTO school_years (start_year, end_year, is_active) 
       VALUES (?, ?, FALSE)`,
      [start_year, end_year]
    );

    const [schoolYear] = await db.execute(
      `SELECT school_year_id, start_year, end_year, is_active, created_at 
       FROM school_years 
       WHERE school_year_id = ?`,
      [result.insertId]
    );

    return schoolYear[0];
  } catch (err) {
    throw new Error(`Error creating school year: ${err.message}`);
  }
};

const getAllSchoolYearsModel = async (page, limit, search, active) => {
  const offset = (page - 1) * limit;
  
  try {
    let query = `
      SELECT school_year_id, start_year, end_year, is_active, created_at
      FROM school_years
      WHERE 1 = 1
    `;
    let countQuery = `SELECT COUNT(*) AS total FROM school_years WHERE 1 = 1`;
    let queryParams = [];
    let countParams = [];

    if (search && search.trim() !== '') {
      query += ` AND (CONCAT(start_year, '-', end_year) LIKE ? OR start_year LIKE ? OR end_year LIKE ?)`;
      countQuery += ` AND (CONCAT(start_year, '-', end_year) LIKE ? OR start_year LIKE ? OR end_year LIKE ?)`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }

    if (active !== undefined) {
      const isActive = active === 'true' || active === '1';
      query += ` AND is_active = ?`;
      countQuery += ` AND is_active = ?`;
      queryParams.push(isActive);
      countParams.push(isActive);
    }

    query += ` ORDER BY start_year DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [schoolYears] = await db.execute(query, queryParams);
    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].total;

    return {
      schoolYears,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (err) {
    throw new Error(`Error fetching school years: ${err.message}`);
  }
};

const getSchoolYearByIdModel = async (schoolYearId) => {
  try {
    const [schoolYear] = await db.execute(
      `SELECT school_year_id, start_year, end_year, is_active, created_at
       FROM school_years 
       WHERE school_year_id = ?`,
      [schoolYearId]
    );

    return schoolYear[0] || null;
  } catch (err) {
    throw new Error(`Error fetching school year: ${err.message}`);
  }
};

const updateSchoolYearModel = async (schoolYearId, updateData) => {
  const { start_year, end_year, is_active } = updateData;
  
  try {
    await db.execute(
      `UPDATE school_years 
       SET start_year = ?, end_year = ?, is_active = ?
       WHERE school_year_id = ?`,
      [start_year, end_year, is_active, schoolYearId]
    );

    const [schoolYear] = await db.execute(
      `SELECT school_year_id, start_year, end_year, is_active, created_at
       FROM school_years 
       WHERE school_year_id = ?`,
      [schoolYearId]
    );

    return schoolYear[0];
  } catch (err) {
    throw new Error(`Error updating school year: ${err.message}`);
  }
};

const setActiveSchoolYearModel = async (schoolYearId) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    await connection.execute(
      `UPDATE school_years SET is_active = FALSE`
    );

    await connection.execute(
      `UPDATE school_years SET is_active = TRUE WHERE school_year_id = ?`,
      [schoolYearId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw new Error(`Error setting active school year: ${err.message}`);
  } finally {
    connection.release();
  }
};

const deleteSchoolYearModel = async (schoolYearId) => {
  try {
    const [result] = await db.execute(
      `DELETE FROM school_years WHERE school_year_id = ?`,
      [schoolYearId]
    );

    if (result.affectedRows === 0) {
      throw new Error('School year not found');
    }

    return true;
  } catch (err) {
    throw new Error(`Error deleting school year: ${err.message}`);
  }
};

const checkSchoolYearExists = async (startYear, endYear) => {
  try {
    const [result] = await db.execute(
      `SELECT COUNT(*) AS count 
       FROM school_years 
       WHERE start_year = ? AND end_year = ?`,
      [startYear, endYear]
    );

    return result[0].count > 0;
  } catch (err) {
    throw new Error(`Error checking school year existence: ${err.message}`);
  }
};

const getActiveSchoolYearModel = async () => {
  try {
    const [schoolYear] = await db.execute(
      `SELECT school_year_id, start_year, end_year, is_active, created_at
       FROM school_years 
       WHERE is_active = TRUE
       LIMIT 1`
    );

    return schoolYear[0] || null;
  } catch (err) {
    throw new Error(`Error fetching active school year: ${err.message}`);
  }
};

module.exports = {
  createSchoolYearModel,
  getAllSchoolYearsModel,
  getSchoolYearByIdModel,
  updateSchoolYearModel,
  deleteSchoolYearModel,
  setActiveSchoolYearModel,
  checkSchoolYearExists,
  getActiveSchoolYearModel
};