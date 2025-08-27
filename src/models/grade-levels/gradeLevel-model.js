const db = require('../../config/db');

const fetchAllGradeLevels = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT grade_level_id, grade_code, grade_name, grade_order, created_at
       FROM grade_levels
       ORDER BY grade_order ASC`
    );

    return rows.map(row => ({
      grade_level_id: row.grade_level_id,
      grade_code: row.grade_code,
      grade_name: row.grade_name,
      grade_order: row.grade_order,
      created_at: row.created_at
    }));
  } catch (err) {
    console.error('Error in fetchAllGradeLevels:', err);
    throw new Error(`Error fetching grade levels: ${err.message}`);
  }
};

const fetchGradeLevelById = async (gradeLevelId) => {
  try {
    const [rows] = await db.execute(
      `SELECT grade_level_id, grade_code, grade_name, grade_order, created_at
       FROM grade_levels
       WHERE grade_level_id = ?`,
      [gradeLevelId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      grade_level_id: row.grade_level_id,
      grade_code: row.grade_code,
      grade_name: row.grade_name,
      grade_order: row.grade_order,
      created_at: row.created_at
    };
  } catch (err) {
    console.error('Error in fetchGradeLevelById:', err);
    throw new Error(`Error fetching grade level by ID: ${err.message}`);
  }
};

const createNewGradeLevel = async (gradeLevelData, userId) => {
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    const { grade_code, grade_name, grade_order } = gradeLevelData;

    const [existingCode] = await db.execute(
      'SELECT grade_level_id FROM grade_levels WHERE grade_code = ?',
      [grade_code]
    );
    if (existingCode.length > 0) {
      throw new Error('Grade code already exists');
    }

    const [existingOrder] = await db.execute(
      'SELECT grade_level_id FROM grade_levels WHERE grade_order = ?',
      [grade_order]
    );
    if (existingOrder.length > 0) {
      throw new Error('Grade order already exists');
    }

    const [result] = await db.execute(
      'INSERT INTO grade_levels (grade_code, grade_name, grade_order, created_at) VALUES (?, ?, ?, NOW())',
      [grade_code, grade_name, grade_order]
    );
    
    const gradeLevelId = result.insertId;
    console.log(`Grade level created: grade_level_id=${gradeLevelId}, grade_code=${grade_code}`);

    const [logResult] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Created grade level: ${grade_name} (${grade_code}) with ID ${gradeLevelId}`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, user_id=${userId}`);

    const createdGradeLevel = await fetchGradeLevelById(gradeLevelId);
    return createdGradeLevel;
  } catch (err) {
    console.error('Error in createNewGradeLevel:', err);
    throw new Error(err.message);
  }
};

const updateGradeLevelById = async (gradeLevelId, gradeLevelData, userId) => {
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    const { grade_code, grade_name, grade_order } = gradeLevelData;

    const [existingGradeLevel] = await db.execute(
      'SELECT grade_level_id, grade_code, grade_name FROM grade_levels WHERE grade_level_id = ?',
      [gradeLevelId]
    );
    if (existingGradeLevel.length === 0) {
      throw new Error('Grade level not found');
    }

    const [existingCode] = await db.execute(
      'SELECT grade_level_id FROM grade_levels WHERE grade_code = ? AND grade_level_id != ?',
      [grade_code, gradeLevelId]
    );
    if (existingCode.length > 0) {
      throw new Error('Grade code already exists');
    }

    const [existingOrder] = await db.execute(
      'SELECT grade_level_id FROM grade_levels WHERE grade_order = ? AND grade_level_id != ?',
      [grade_order, gradeLevelId]
    );
    if (existingOrder.length > 0) {
      throw new Error('Grade order already exists');
    }

    const [result] = await db.execute(
      'UPDATE grade_levels SET grade_code = ?, grade_name = ?, grade_order = ? WHERE grade_level_id = ?',
      [grade_code, grade_name, grade_order, gradeLevelId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Grade level not found');
    }

    console.log(`Grade level updated: grade_level_id=${gradeLevelId}, grade_code=${grade_code}`);

    const oldGradeLevel = existingGradeLevel[0];
    const [logResult] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Updated grade level ID ${gradeLevelId}: from "${oldGradeLevel.grade_name} (${oldGradeLevel.grade_code})" to "${grade_name} (${grade_code})"`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, user_id=${userId}`);

    const updatedGradeLevel = await fetchGradeLevelById(gradeLevelId);
    return updatedGradeLevel;
  } catch (err) {
    console.error('Error in updateGradeLevelById:', err);
    throw new Error(err.message);
  }
};

const deleteGradeLevelById = async (gradeLevelId, userId) => {
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    const [existingGradeLevel] = await db.execute(
      'SELECT grade_level_id, grade_code, grade_name FROM grade_levels WHERE grade_level_id = ?',
      [gradeLevelId]
    );
    if (existingGradeLevel.length === 0) {
      throw new Error('Grade level not found');
    }

    const [sectionsUsingGrade] = await db.execute(
      'SELECT COUNT(*) as count FROM sections WHERE grade_level_id = ?',
      [gradeLevelId]
    );
    if (sectionsUsingGrade[0].count > 0) {
      throw new Error('Cannot delete grade level as it is being used in sections');
    }

    const [subjectsUsingGrade] = await db.execute(
      'SELECT COUNT(*) as count FROM subject_grade_levels WHERE grade_level_id = ?',
      [gradeLevelId]
    );
    if (subjectsUsingGrade[0].count > 0) {
      throw new Error('Cannot delete grade level as it is being used in subject assignments');
    }

    const [result] = await db.execute(
      'DELETE FROM grade_levels WHERE grade_level_id = ?',
      [gradeLevelId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Grade level not found');
    }

    const deletedGradeLevel = existingGradeLevel[0];
    console.log(`Grade level deleted: grade_level_id=${gradeLevelId}, grade_code=${deletedGradeLevel.grade_code}`);

    const [logResult] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Deleted grade level: ${deletedGradeLevel.grade_name} (${deletedGradeLevel.grade_code}) with ID ${gradeLevelId}`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, user_id=${userId}`);

    return true;
  } catch (err) {
    console.error('Error in deleteGradeLevelById:', err);
    throw new Error(err.message);
  }
};

module.exports = { 
  fetchAllGradeLevels, 
  createNewGradeLevel, 
  updateGradeLevelById, 
  deleteGradeLevelById,
  fetchGradeLevelById 
};