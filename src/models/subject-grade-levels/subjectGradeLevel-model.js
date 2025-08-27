const db = require('../../config/db');

const fetchAllSubjectGradeLevels = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT 
         sgl.subject_id,
         sgl.grade_level_id,
         sgl.is_required,
         sgl.units,
         s.subject_code,
         s.subject_name,
         gl.grade_code,
         gl.grade_name,
         gl.grade_order
       FROM subject_grade_levels sgl
       INNER JOIN subjects s ON sgl.subject_id = s.subject_id
       INNER JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
       ORDER BY gl.grade_order ASC, s.subject_code ASC`
    );

    return rows.map(row => ({
      subject_id: row.subject_id,
      grade_level_id: row.grade_level_id,
      is_required: Boolean(row.is_required),
      units: row.units,
      subject: {
        subject_code: row.subject_code,
        subject_name: row.subject_name
      },
      grade_level: {
        grade_code: row.grade_code,
        grade_name: row.grade_name,
        grade_order: row.grade_order
      }
    }));
  } catch (err) {
    console.error('Error in fetchAllSubjectGradeLevels:', err);
    throw new Error(`Error fetching subject grade levels: ${err.message}`);
  }
};

const fetchSubjectGradeLevelById = async (subjectId, gradeLevelId) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
         sgl.subject_id,
         sgl.grade_level_id,
         sgl.is_required,
         sgl.units,
         s.subject_code,
         s.subject_name,
         s.description as subject_description,
         gl.grade_code,
         gl.grade_name,
         gl.grade_order
       FROM subject_grade_levels sgl
       INNER JOIN subjects s ON sgl.subject_id = s.subject_id
       INNER JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
       WHERE sgl.subject_id = ? AND sgl.grade_level_id = ?`,
      [subjectId, gradeLevelId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      subject_id: row.subject_id,
      grade_level_id: row.grade_level_id,
      is_required: Boolean(row.is_required),
      units: row.units,
      subject: {
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        description: row.subject_description
      },
      grade_level: {
        grade_code: row.grade_code,
        grade_name: row.grade_name,
        grade_order: row.grade_order
      }
    };
  } catch (err) {
    console.error('Error in fetchSubjectGradeLevelById:', err);
    throw new Error(`Error fetching subject grade level by ID: ${err.message}`);
  }
};

const fetchSubjectGradeLevelsBySubject = async (subjectId) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
         sgl.subject_id,
         sgl.grade_level_id,
         sgl.is_required,
         sgl.units,
         gl.grade_code,
         gl.grade_name,
         gl.grade_order
       FROM subject_grade_levels sgl
       INNER JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
       WHERE sgl.subject_id = ?
       ORDER BY gl.grade_order ASC`,
      [subjectId]
    );

    return rows.map(row => ({
      grade_level_id: row.grade_level_id,
      is_required: Boolean(row.is_required),
      units: row.units,
      grade_level: {
        grade_code: row.grade_code,
        grade_name: row.grade_name,
        grade_order: row.grade_order
      }
    }));
  } catch (err) {
    console.error('Error in fetchSubjectGradeLevelsBySubject:', err);
    throw new Error(`Error fetching grade levels for subject: ${err.message}`);
  }
};

const fetchSubjectGradeLevelsByGradeLevel = async (gradeLevelId) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
         sgl.subject_id,
         sgl.grade_level_id,
         sgl.is_required,
         sgl.units,
         s.subject_code,
         s.subject_name,
         s.description
       FROM subject_grade_levels sgl
       INNER JOIN subjects s ON sgl.subject_id = s.subject_id
       WHERE sgl.grade_level_id = ?
       ORDER BY s.subject_code ASC`,
      [gradeLevelId]
    );

    return rows.map(row => ({
      subject_id: row.subject_id,
      is_required: Boolean(row.is_required),
      units: row.units,
      subject: {
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        description: row.description
      }
    }));
  } catch (err) {
    console.error('Error in fetchSubjectGradeLevelsByGradeLevel:', err);
    throw new Error(`Error fetching subjects for grade level: ${err.message}`);
  }
};

const createNewSubjectGradeLevel = async (subjectGradeLevelData, userId) => {
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    const { subject_id, grade_level_id, is_required, units } = subjectGradeLevelData;

    // Check if subject exists
    const [subjectExists] = await db.execute(
      'SELECT subject_id, subject_name, subject_code FROM subjects WHERE subject_id = ?',
      [subject_id]
    );
    if (subjectExists.length === 0) {
      throw new Error('Subject not found');
    }

    // Check if grade level exists
    const [gradeLevelExists] = await db.execute(
      'SELECT grade_level_id, grade_name, grade_code FROM grade_levels WHERE grade_level_id = ?',
      [grade_level_id]
    );
    if (gradeLevelExists.length === 0) {
      throw new Error('Grade level not found');
    }

    // Check if assignment already exists
    const [existingAssignment] = await db.execute(
      'SELECT subject_id, grade_level_id FROM subject_grade_levels WHERE subject_id = ? AND grade_level_id = ?',
      [subject_id, grade_level_id]
    );
    if (existingAssignment.length > 0) {
      throw new Error('Subject grade level assignment already exists');
    }

    const [result] = await db.execute(
      'INSERT INTO subject_grade_levels (subject_id, grade_level_id, is_required, units) VALUES (?, ?, ?, ?)',
      [subject_id, grade_level_id, is_required, units]
    );
    
    console.log(`Subject grade level assignment created: subject_id=${subject_id}, grade_level_id=${grade_level_id}`);

    const subject = subjectExists[0];
    const gradeLevel = gradeLevelExists[0];
    const requiredStatus = is_required ? 'Required' : 'Elective';
    const unitsText = units ? ` (${units} units)` : '';
    
    const [logResult] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Assigned subject "${subject.subject_name} (${subject.subject_code})" to grade level "${gradeLevel.grade_name} (${gradeLevel.grade_code})" as ${requiredStatus}${unitsText}`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, user_id=${userId}`);

    const createdSubjectGradeLevel = await fetchSubjectGradeLevelById(subject_id, grade_level_id);
    return createdSubjectGradeLevel;
  } catch (err) {
    console.error('Error in createNewSubjectGradeLevel:', err);
    throw new Error(err.message);
  }
};

const updateSubjectGradeLevelById = async (subjectId, gradeLevelId, subjectGradeLevelData, userId) => {
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    const { is_required, units } = subjectGradeLevelData;

    // Check if assignment exists and get current data
    const [existingAssignment] = await db.execute(
      `SELECT 
         sgl.subject_id, sgl.grade_level_id, sgl.is_required, sgl.units,
         s.subject_name, s.subject_code,
         gl.grade_name, gl.grade_code
       FROM subject_grade_levels sgl
       INNER JOIN subjects s ON sgl.subject_id = s.subject_id
       INNER JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
       WHERE sgl.subject_id = ? AND sgl.grade_level_id = ?`,
      [subjectId, gradeLevelId]
    );
    if (existingAssignment.length === 0) {
      throw new Error('Subject grade level assignment not found');
    }

    const [result] = await db.execute(
      'UPDATE subject_grade_levels SET is_required = ?, units = ? WHERE subject_id = ? AND grade_level_id = ?',
      [is_required, units, subjectId, gradeLevelId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Subject grade level assignment not found');
    }

    console.log(`Subject grade level assignment updated: subject_id=${subjectId}, grade_level_id=${gradeLevelId}`);

    const oldAssignment = existingAssignment[0];
    const oldRequiredStatus = oldAssignment.is_required ? 'Required' : 'Elective';
    const newRequiredStatus = is_required ? 'Required' : 'Elective';
    const oldUnitsText = oldAssignment.units ? ` (${oldAssignment.units} units)` : '';
    const newUnitsText = units ? ` (${units} units)` : '';
    
    const [logResult] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Updated subject-grade level assignment: "${oldAssignment.subject_name} (${oldAssignment.subject_code})" for "${oldAssignment.grade_name} (${oldAssignment.grade_code})" from ${oldRequiredStatus}${oldUnitsText} to ${newRequiredStatus}${newUnitsText}`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, user_id=${userId}`);

    const updatedSubjectGradeLevel = await fetchSubjectGradeLevelById(subjectId, gradeLevelId);
    return updatedSubjectGradeLevel;
  } catch (err) {
    console.error('Error in updateSubjectGradeLevelById:', err);
    throw new Error(err.message);
  }
};

const deleteSubjectGradeLevelById = async (subjectId, gradeLevelId, userId) => {
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    // Check if assignment exists and get data for logging
    const [existingAssignment] = await db.execute(
      `SELECT 
         sgl.subject_id, sgl.grade_level_id, sgl.is_required, sgl.units,
         s.subject_name, s.subject_code,
         gl.grade_name, gl.grade_code
       FROM subject_grade_levels sgl
       INNER JOIN subjects s ON sgl.subject_id = s.subject_id
       INNER JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
       WHERE sgl.subject_id = ? AND sgl.grade_level_id = ?`,
      [subjectId, gradeLevelId]
    );
    if (existingAssignment.length === 0) {
      throw new Error('Subject grade level assignment not found');
    }

    // Check if assignment is being used in curriculum_subjects
    const [curriculumUsage] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM curriculum_subjects cs
       INNER JOIN subjects s ON cs.subject_id = s.subject_id
       WHERE cs.subject_id = ? AND EXISTS (
         SELECT 1 FROM subject_grade_levels sgl 
         WHERE sgl.subject_id = cs.subject_id AND sgl.grade_level_id = ?
       )`,
      [subjectId, gradeLevelId]
    );
    if (curriculumUsage[0].count > 0) {
      throw new Error('Cannot delete subject grade level assignment as it is being used in curriculum');
    }

    // Check if assignment is being used in student_grades through enrollment
    const [gradesUsage] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM student_grades sg
       INNER JOIN enrollment e ON sg.enrollment_id = e.enrollment_id
       INNER JOIN sections sec ON e.section_id = sec.section_id
       WHERE sg.subject_id = ? AND sec.grade_level_id = ?`,
      [subjectId, gradeLevelId]
    );
    if (gradesUsage[0].count > 0) {
      throw new Error('Cannot delete subject grade level assignment as it is being used in student grades');
    }

    const [result] = await db.execute(
      'DELETE FROM subject_grade_levels WHERE subject_id = ? AND grade_level_id = ?',
      [subjectId, gradeLevelId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Subject grade level assignment not found');
    }

    const deletedAssignment = existingAssignment[0];
    const requiredStatus = deletedAssignment.is_required ? 'Required' : 'Elective';
    const unitsText = deletedAssignment.units ? ` (${deletedAssignment.units} units)` : '';
    
    console.log(`Subject grade level assignment deleted: subject_id=${subjectId}, grade_level_id=${gradeLevelId}`);

    const [logResult] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Removed subject "${deletedAssignment.subject_name} (${deletedAssignment.subject_code})" from grade level "${deletedAssignment.grade_name} (${deletedAssignment.grade_code})" (was ${requiredStatus}${unitsText})`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, user_id=${userId}`);

    return true;
  } catch (err) {
    console.error('Error in deleteSubjectGradeLevelById:', err);
    throw new Error(err.message);
  }
};

const bulkCreateSubjectGradeLevels = async (assignments, userId) => {
  const connection = await db.getConnection();
  
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    await connection.beginTransaction();

    const results = [];
    const logActions = [];

    for (const assignment of assignments) {
      const { subject_id, grade_level_id, is_required, units } = assignment;

      // Check if subject exists
      const [subjectExists] = await connection.execute(
        'SELECT subject_id, subject_name, subject_code FROM subjects WHERE subject_id = ?',
        [subject_id]
      );
      if (subjectExists.length === 0) {
        throw new Error(`Subject with ID ${subject_id} not found`);
      }

      // Check if grade level exists
      const [gradeLevelExists] = await connection.execute(
        'SELECT grade_level_id, grade_name, grade_code FROM grade_levels WHERE grade_level_id = ?',
        [grade_level_id]
      );
      if (gradeLevelExists.length === 0) {
        throw new Error(`Grade level with ID ${grade_level_id} not found`);
      }

      // Check if assignment already exists
      const [existingAssignment] = await connection.execute(
        'SELECT subject_id, grade_level_id FROM subject_grade_levels WHERE subject_id = ? AND grade_level_id = ?',
        [subject_id, grade_level_id]
      );
      if (existingAssignment.length > 0) {
        console.log(`Assignment already exists: subject_id=${subject_id}, grade_level_id=${grade_level_id}, skipping...`);
        continue;
      }

      // Insert the assignment
      await connection.execute(
        'INSERT INTO subject_grade_levels (subject_id, grade_level_id, is_required, units) VALUES (?, ?, ?, ?)',
        [subject_id, grade_level_id, is_required, units]
      );

      const subject = subjectExists[0];
      const gradeLevel = gradeLevelExists[0];
      const requiredStatus = is_required ? 'Required' : 'Elective';
      const unitsText = units ? ` (${units} units)` : '';

      results.push({
        subject_id,
        grade_level_id,
        is_required,
        units,
        subject: {
          subject_code: subject.subject_code,
          subject_name: subject.subject_name
        },
        grade_level: {
          grade_code: gradeLevel.grade_code,
          grade_name: gradeLevel.grade_name
        }
      });

      logActions.push(`Assigned subject "${subject.subject_name} (${subject.subject_code})" to grade level "${gradeLevel.grade_name} (${gradeLevel.grade_code})" as ${requiredStatus}${unitsText}`);
    }

    // Create activity log entries
    if (logActions.length > 0) {
      const logAction = `Bulk created ${logActions.length} subject-grade level assignments: ${logActions.join('; ')}`;
      await connection.execute(
        'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
        [userId, logAction]
      );
    }

    await connection.commit();
    console.log(`Bulk created ${results.length} subject grade level assignments`);

    return results;
  } catch (err) {
    await connection.rollback();
    console.error('Error in bulkCreateSubjectGradeLevels:', err);
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

const bulkDeleteSubjectGradeLevels = async (assignments, userId) => {
  const connection = await db.getConnection();
  
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    await connection.beginTransaction();

    let deletedCount = 0;
    const logActions = [];

    for (const assignment of assignments) {
      const { subject_id, grade_level_id } = assignment;

      // Check if assignment exists and get data for logging
      const [existingAssignment] = await connection.execute(
        `SELECT 
           sgl.subject_id, sgl.grade_level_id, sgl.is_required, sgl.units,
           s.subject_name, s.subject_code,
           gl.grade_name, gl.grade_code
         FROM subject_grade_levels sgl
         INNER JOIN subjects s ON sgl.subject_id = s.subject_id
         INNER JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
         WHERE sgl.subject_id = ? AND sgl.grade_level_id = ?`,
        [subject_id, grade_level_id]
      );
      if (existingAssignment.length === 0) {
        console.log(`Assignment not found: subject_id=${subject_id}, grade_level_id=${grade_level_id}, skipping...`);
        continue;
      }

      // Check for dependencies (basic check - can be extended)
      const [curriculumUsage] = await connection.execute(
        `SELECT COUNT(*) as count 
         FROM curriculum_subjects cs
         WHERE cs.subject_id = ?`,
        [subject_id]
      );
      
      const [gradesUsage] = await connection.execute(
        `SELECT COUNT(*) as count 
         FROM student_grades sg
         INNER JOIN enrollment e ON sg.enrollment_id = e.enrollment_id
         INNER JOIN sections sec ON e.section_id = sec.section_id
         WHERE sg.subject_id = ? AND sec.grade_level_id = ?`,
        [subject_id, grade_level_id]
      );

      if (curriculumUsage[0].count > 0 || gradesUsage[0].count > 0) {
        console.log(`Assignment has dependencies: subject_id=${subject_id}, grade_level_id=${grade_level_id}, skipping...`);
        continue;
      }

      // Delete the assignment
      const [result] = await connection.execute(
        'DELETE FROM subject_grade_levels WHERE subject_id = ? AND grade_level_id = ?',
        [subject_id, grade_level_id]
      );

      if (result.affectedRows > 0) {
        deletedCount++;
        const deletedAssignment = existingAssignment[0];
        const requiredStatus = deletedAssignment.is_required ? 'Required' : 'Elective';
        const unitsText = deletedAssignment.units ? ` (${deletedAssignment.units} units)` : '';
        
        logActions.push(`Removed subject "${deletedAssignment.subject_name} (${deletedAssignment.subject_code})" from grade level "${deletedAssignment.grade_name} (${deletedAssignment.grade_code})" (was ${requiredStatus}${unitsText})`);
      }
    }

    // Create activity log entry
    if (logActions.length > 0) {
      const logAction = `Bulk deleted ${deletedCount} subject-grade level assignments: ${logActions.join('; ')}`;
      await connection.execute(
        'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
        [userId, logAction]
      );
    }

    await connection.commit();
    console.log(`Bulk deleted ${deletedCount} subject grade level assignments`);

    return { deletedCount };
  } catch (err) {
    await connection.rollback();
    console.error('Error in bulkDeleteSubjectGradeLevels:', err);
    throw new Error(err.message);
  } finally {
    connection.release();
  }
};

module.exports = { 
  fetchAllSubjectGradeLevels, 
  fetchSubjectGradeLevelById,
  fetchSubjectGradeLevelsBySubject,
  fetchSubjectGradeLevelsByGradeLevel,
  createNewSubjectGradeLevel, 
  updateSubjectGradeLevelById, 
  deleteSubjectGradeLevelById,
  bulkCreateSubjectGradeLevels,
  bulkDeleteSubjectGradeLevels
};