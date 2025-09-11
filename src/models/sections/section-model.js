const db = require('../../config/db');

const fetchAllSections = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT s.section_id, s.section_name, s.grade_level_id, s.school_year_id, 
              g.grade_name, sy.start_year, sy.end_year
       FROM sections s
       JOIN grade_levels g ON s.grade_level_id = g.grade_level_id
       JOIN school_years sy ON s.school_year_id = sy.school_year_id
       ORDER BY g.grade_order, s.section_name`
    );

    return rows.map(row => ({
      section_id: row.section_id,
      section_name: row.section_name,
      grade_level_id: row.grade_level_id,
      grade_name: row.grade_name,
      school_year_id: row.school_year_id,
      school_year: `${row.start_year}-${row.end_year}`,
      created_at: row.created_at
    }));
  } catch (err) {
    console.error('Error in fetchAllSections:', err);
    throw new Error(`Error fetching sections: ${err.message}`);
  }
};

const fetchSectionById = async (sectionId) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.section_id, s.section_name, s.grade_level_id, s.school_year_id, 
              g.grade_name, sy.start_year, sy.end_year
       FROM sections s
       JOIN grade_levels g ON s.grade_level_id = g.grade_level_id
       JOIN school_years sy ON s.school_year_id = sy.school_year_id
       WHERE s.section_id = ?`,
      [sectionId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      section_id: row.section_id,
      section_name: row.section_name,
      grade_level_id: row.grade_level_id,
      grade_name: row.grade_name,
      school_year_id: row.school_year_id,
      school_year: `${row.start_year}-${row.end_year}`,
      created_at: row.created_at
    };
  } catch (err) {
    console.error('Error in fetchSectionById:', err);
    throw new Error(`Error fetching section by ID: ${err.message}`);
  }
};

const createNewSection = async (sectionData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { section_name, grade_level_id, school_year_id } = sectionData;

    const [gradeLevel] = await connection.execute(
      'SELECT grade_level_id, grade_name FROM grade_levels WHERE grade_level_id = ?',
      [grade_level_id]
    );
    if (gradeLevel.length === 0) {
      throw new Error('Grade level not found');
    }

    const [schoolYear] = await connection.execute(
      'SELECT school_year_id, start_year, end_year FROM school_years WHERE school_year_id = ?',
      [school_year_id]
    );
    if (schoolYear.length === 0) {
      throw new Error('School year not found');
    }

    const [existingSection] = await connection.execute(
      'SELECT section_id FROM sections WHERE section_name = ? AND grade_level_id = ? AND school_year_id = ?',
      [section_name, grade_level_id, school_year_id]
    );
    if (existingSection.length > 0) {
      throw new Error('Section already exists');
    }

    const [result] = await connection.execute(
      'INSERT INTO sections (section_name, grade_level_id, school_year_id) VALUES (?, ?, ?)',
      [section_name, grade_level_id, school_year_id]
    );

    const sectionId = result.insertId;
    console.log(`Section created: section_id=${sectionId}, section_name=${section_name}`);

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Created section: ${section_name} for grade ${gradeLevel[0].grade_name} in school year ${schoolYear[0].start_year}-${schoolYear[0].end_year}`]
    );

    await connection.commit();
    return await fetchSectionById(sectionId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in createNewSection:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const updateSectionById = async (sectionId, sectionData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { section_name, grade_level_id, school_year_id } = sectionData;

    const [existingSection] = await connection.execute(
      'SELECT section_id, section_name, grade_level_id, school_year_id FROM sections WHERE section_id = ?',
      [sectionId]
    );
    if (existingSection.length === 0) {
      throw new Error('Section not found');
    }

    const [gradeLevel] = await connection.execute(
      'SELECT grade_level_id, grade_name FROM grade_levels WHERE grade_level_id = ?',
      [grade_level_id]
    );
    if (gradeLevel.length === 0) {
      throw new Error('Grade level not found');
    }

    const [schoolYear] = await connection.execute(
      'SELECT school_year_id, start_year, end_year FROM school_years WHERE school_year_id = ?',
      [school_year_id]
    );
    if (schoolYear.length === 0) {
      throw new Error('School year not found');
    }

    const [duplicateSection] = await connection.execute(
      'SELECT section_id FROM sections WHERE section_name = ? AND grade_level_id = ? AND school_year_id = ? AND section_id != ?',
      [section_name, grade_level_id, school_year_id, sectionId]
    );
    if (duplicateSection.length > 0) {
      throw new Error('Section already exists');
    }

    const [result] = await connection.execute(
      'UPDATE sections SET section_name = ?, grade_level_id = ?, school_year_id = ? WHERE section_id = ?',
      [section_name, grade_level_id, school_year_id, sectionId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Section not found');
    }

    console.log(`Section updated: section_id=${sectionId}, section_name=${section_name}`);

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Updated section ID ${sectionId}: from "${existingSection[0].section_name}" to "${section_name}" for grade ${gradeLevel[0].grade_name} in school year ${schoolYear[0].start_year}-${schoolYear[0].end_year}`]
    );

    await connection.commit();
    return await fetchSectionById(sectionId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in updateSectionById:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

const deleteSectionById = async (sectionId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingSection] = await connection.execute(
      `SELECT s.section_id, s.section_name, s.grade_level_id, s.school_year_id, 
              g.grade_name, sy.start_year, sy.end_year
       FROM sections s
       JOIN grade_levels g ON s.grade_level_id = g.grade_level_id
       JOIN school_years sy ON s.school_year_id = sy.school_year_id
       WHERE s.section_id = ?`,
      [sectionId]
    );
    if (existingSection.length === 0) {
      throw new Error('Section not found');
    }

    const [enrollments] = await connection.execute(
      'SELECT COUNT(*) as count FROM enrollment WHERE section_id = ?',
      [sectionId]
    );
    if (enrollments[0].count > 0) {
      throw new Error('Cannot delete section as it is being used in enrollments');
    }

    const [assignments] = await connection.execute(
      'SELECT COUNT(*) as count FROM teacher_assignments WHERE section_id = ?',
      [sectionId]
    );
    if (assignments[0].count > 0) {
      throw new Error('Cannot delete section as it is being used in teacher assignments');
    }

    const [result] = await connection.execute(
      'DELETE FROM sections WHERE section_id = ?',
      [sectionId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Section not found');
    }

    console.log(`Section deleted: section_id=${sectionId}, section_name=${existingSection[0].section_name}`);

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Deleted section: ${existingSection[0].section_name} for grade ${existingSection[0].grade_name} in school year ${existingSection[0].start_year}-${existingSection[0].end_year}`]
    );

    await connection.commit();
    return true;
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in deleteSectionById:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = { 
  fetchAllSections, 
  fetchSectionById, 
  createNewSection, 
  updateSectionById, 
  deleteSectionById 
};