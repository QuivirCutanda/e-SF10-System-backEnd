const db = require("../../config/db");
const { logActivity } = require("../../utils/activityLog");

const createCurriculumModel = async (curriculumName, schoolYearId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [schoolYear] = await connection.execute(
      "SELECT school_year_id FROM school_years WHERE school_year_id = ?",
      [schoolYearId]
    );

    if (schoolYear.length === 0) {
      throw new Error(
        "Invalid school year ID: The specified school year does not exist"
      );
    }

    const [result] = await connection.execute(
      "INSERT INTO curriculum (curriculum_name, school_year_id, is_active) VALUES (?, ?, ?)",
      [curriculumName, schoolYearId, 0]
    );

    await logActivity(
      userId,
      `Created curriculum: ${curriculumName} for school year ID ${schoolYearId}`
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

const getAllCurriculumsModel = async (
  limit,
  offset,
  schoolYearId = null,
  isActive = null
) => {
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
    let countQuery = "SELECT COUNT(*) as total FROM curriculum c";
    let queryParams = [];
    let countParams = [];
    let whereConditions = [];

    if (schoolYearId) {
      whereConditions.push("c.school_year_id = ?");
      queryParams.push(schoolYearId);
      countParams.push(schoolYearId);
    }

    if (isActive !== null) {
      const activeValue = isActive === "true" || isActive === true;
      whereConditions.push("c.is_active = ?");
      queryParams.push(activeValue);
      countParams.push(activeValue);
    }

    if (whereConditions.length > 0) {
      const whereClause = ` WHERE ${whereConditions.join(" AND ")}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += " ORDER BY c.created_at DESC LIMIT ? OFFSET ?";
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
      [curriculumId]
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
      "SELECT curriculum_id, curriculum_name FROM curriculum WHERE curriculum_id = ?",
      [curriculumId]
    );

    if (existing.length === 0) {
      throw new Error("Curriculum not found");
    }

    const updateFields = [];
    const updateValues = [];

    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== "is_active" && value !== undefined && value !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(curriculumId);

    const [result] = await connection.execute(
      `UPDATE curriculum SET ${updateFields.join(
        ", "
      )} WHERE curriculum_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update curriculum");
    }

    await logActivity(
      userId,
      `Updated curriculum ID ${curriculumId}: ${existing[0].curriculum_name}`
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

const searchCurriculumsModel = async (
  searchQuery,
  schoolYearId = null,
  isActive = null
) => {
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
      query += " AND c.school_year_id = ?";
      queryParams.push(schoolYearId);
    }

    if (isActive !== null) {
      const activeValue = isActive === "true" || isActive === true;
      query += " AND c.is_active = ?";
      queryParams.push(activeValue);
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

const getCurriculumsBySchoolYearModel = async (
  schoolYearId,
  limit,
  offset,
  isActive = null
) => {
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
    let countQuery =
      "SELECT COUNT(*) as total FROM curriculum WHERE school_year_id = ?";
    let queryParams = [schoolYearId];
    let countParams = [schoolYearId];

    if (isActive !== null) {
      const activeValue = isActive === "true" || isActive === true;
      query += " AND c.is_active = ?";
      countQuery += " AND is_active = ?";
      queryParams.push(activeValue);
      countParams.push(activeValue);
    }

    query += " ORDER BY c.curriculum_name ASC LIMIT ? OFFSET ?";
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

const getActiveCurriculumsModel = async () => {
  let connection;
  try {
    connection = await db.getConnection();

    const [curriculumRows] = await connection.execute(
      `
      SELECT c.curriculum_id, c.curriculum_name, c.school_year_id, c.is_active,
             c.created_at, c.updated_at,
             CONCAT(sy.start_year, '-', sy.end_year) as school_year_period
      FROM curriculum c
      LEFT JOIN school_years sy ON c.school_year_id = sy.school_year_id
      WHERE c.is_active = TRUE
      LIMIT 1
      `
    );

    if (curriculumRows.length === 0) return null;

    const curriculum = curriculumRows[0];

    const [subjects] = await connection.execute(
      `
      SELECT s.subject_id, s.subject_code, s.subject_name, s.description,
             s.created_at, s.updated_at
      FROM curriculum_subjects cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE cs.curriculum_id = ?
      ORDER BY s.subject_name ASC
      `,
      [curriculum.curriculum_id]
    );

    curriculum.subjects = subjects;
    return curriculum;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const addSubjectToCurriculumModel = async (
  curriculumId,
  subjectId,
  userId,
  gradeLevelIds = []
) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [[curriculum]] = await connection.execute(
      "SELECT curriculum_name FROM curriculum WHERE curriculum_id = ?",
      [curriculumId]
    );
    if (!curriculum) throw new Error("Curriculum not found");

    const [[subject]] = await connection.execute(
      "SELECT subject_name, subject_code FROM subjects WHERE subject_id = ?",
      [subjectId]
    );
    if (!subject) throw new Error("Subject not found");

    await connection.execute(
      "INSERT IGNORE INTO curriculum_subjects (curriculum_id, subject_id) VALUES (?, ?)",
      [curriculumId, subjectId]
    );

    if (gradeLevelIds.length > 0) {
      const values = gradeLevelIds.map((gid) => [
        curriculumId,
        subjectId,
        gid,
        true,
        null,
      ]);
      await connection.query(
        `INSERT IGNORE INTO curriculum_subject_grade_levels 
          (curriculum_id, subject_id, grade_level_id, is_required, units) 
         VALUES ?`,
        [values]
      );
    }

    await logActivity(
      userId,
      `Added subject ${subject.subject_name} (${subject.subject_code}) 
       to curriculum: ${curriculum.curriculum_name} 
       with grade levels: ${gradeLevelIds.join(", ") || "none"}`
    );

    await connection.commit();

    return {
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      grade_levels: gradeLevelIds,
    };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

const removeSubjectFromCurriculumModel = async (
  curriculumId,
  subjectId,
  userId
) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      `SELECT cs.curriculum_id, cs.subject_id, c.curriculum_name, s.subject_name, s.subject_code
       FROM curriculum_subjects cs
       JOIN curriculum c ON cs.curriculum_id = c.curriculum_id
       JOIN subjects s ON cs.subject_id = s.subject_id
       WHERE cs.curriculum_id = ? AND cs.subject_id = ?`,
      [curriculumId, subjectId]
    );

    if (existing.length === 0) {
      throw new Error("Subject not found in this curriculum");
    }

    const [result] = await connection.execute(
      "DELETE FROM curriculum_subjects WHERE curriculum_id = ? AND subject_id = ?",
      [curriculumId, subjectId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to remove subject from curriculum");
    }

    const record = existing[0];
    await logActivity(
      userId,
      `Removed subject ${record.subject_name} (${record.subject_code}) from curriculum: ${record.curriculum_name}`
    );

    await connection.commit();
    return {
      curriculum_name: record.curriculum_name,
      subject_name: record.subject_name,
      subject_code: record.subject_code,
    };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getCurriculumSubjectsModel = async (
  curriculumId,
  limit,
  offset,
  gradeLevel = null
) => {
  let connection;
  try {
    connection = await db.getConnection();

    let query = `
      SELECT s.subject_id, s.subject_code, s.subject_name, s.description,
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

    query += " ORDER BY s.subject_name ASC LIMIT ? OFFSET ?";
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

const checkCurriculumNameExistsModel = async (
  curriculumName,
  schoolYearId,
  excludeId = null
) => {
  let connection;
  try {
    connection = await db.getConnection();

    let query =
      "SELECT curriculum_id FROM curriculum WHERE curriculum_name = ? AND school_year_id = ?";
    let params = [curriculumName, schoolYearId];

    if (excludeId) {
      query += " AND curriculum_id != ?";
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
      "SELECT curriculum_id, curriculum_name, is_active FROM curriculum WHERE curriculum_id = ?",
      [curriculumId]
    );

    if (curriculum.length === 0) {
      throw new Error("Curriculum not found");
    }

    const targetCurriculum = curriculum[0];

    if (targetCurriculum.is_active === 1) {
      throw new Error(
        "Cannot deactivate the only active curriculum. One curriculum must always remain active."
      );
    }

    await connection.execute(
      "UPDATE curriculum SET is_active = 0, updated_at = CURRENT_TIMESTAMP"
    );

    await connection.execute(
      "UPDATE curriculum SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE curriculum_id = ?",
      [curriculumId]
    );

    await logActivity(
      userId,
      `Activated curriculum: ${targetCurriculum.curriculum_name}. All others automatically deactivated.`
    );

    await connection.commit();

    return {
      curriculum_id: curriculumId,
      curriculum_name: targetCurriculum.curriculum_name,
      new_status: true,
      message:
        "Curriculum activated successfully. All others were deactivated.",
    };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getActiveCurriculumSubjectsModel = async (
  limit,
  offset,
  gradeLevel = null
) => {
  let connection;
  try {
    connection = await db.getConnection();

    const [activeCurr] = await connection.execute(
      `SELECT c.curriculum_id, c.curriculum_name, c.school_year_id
       FROM curriculum c
       WHERE c.is_active = 1
       LIMIT 1`
    );

    if (activeCurr.length === 0) {
      return { subjects: [], total: 0, curriculum: null };
    }

    const { curriculum_id, curriculum_name, school_year_id } = activeCurr[0];

    let query = `
      SELECT s.subject_id, s.subject_code, s.subject_name, s.description,
             s.created_at, s.updated_at
      FROM curriculum_subjects cs
      JOIN subjects s ON cs.subject_id = s.subject_id
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM curriculum_subjects cs
      JOIN subjects s ON cs.subject_id = s.subject_id
    `;
    let queryParams = [];
    let countParams = [];

    query += ` WHERE cs.curriculum_id = ?`;
    countQuery += ` WHERE cs.curriculum_id = ?`;
    queryParams.push(curriculum_id);
    countParams.push(curriculum_id);

    if (gradeLevel) {
      query += ` AND EXISTS (
        SELECT 1 FROM subject_grade_levels sgl
        WHERE sgl.subject_id = s.subject_id
          AND sgl.grade_level_id = ?
      )`;
      countQuery += ` AND EXISTS (
        SELECT 1 FROM subject_grade_levels sgl
        WHERE sgl.subject_id = s.subject_id
          AND sgl.grade_level_id = ?
      )`;
      queryParams.push(gradeLevel);
      countParams.push(gradeLevel);
    }

    query += ` ORDER BY s.subject_name ASC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [rows] = await connection.execute(query, queryParams);
    const [totalRows] = await connection.execute(countQuery, countParams);

    return {
      subjects: rows,
      total: totalRows[0].total,
      curriculum: { curriculum_id, curriculum_name, school_year_id },
    };
  } catch (err) {
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
  searchCurriculumsModel,
  getCurriculumsBySchoolYearModel,
  getActiveCurriculumsModel,
  addSubjectToCurriculumModel,
  removeSubjectFromCurriculumModel,
  getCurriculumSubjectsModel,
  checkCurriculumNameExistsModel,
  toggleCurriculumStatusModel,
  getActiveCurriculumSubjectsModel,
};
