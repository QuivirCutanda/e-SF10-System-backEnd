const db = require('../../config/db');
const { logActivity } = require('../../utils/activityLog');

const createSubjectModel = async (subjectCode, subjectName, description, gradeLevelIds, isRequired, units, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO subjects (subject_code, subject_name, description)
       VALUES (?, ?, ?)`,
      [subjectCode, subjectName, description || null]
    );

    const subjectId = result.insertId;

    if (Array.isArray(gradeLevelIds) && gradeLevelIds.length > 0) {
      const gradeLevelValues = gradeLevelIds.map(gradeLevelId => [
        subjectId,
        parseInt(gradeLevelId),
        isRequired !== undefined ? isRequired : true,
        units !== undefined ? parseFloat(units) : null
      ]);
      
      await connection.query(
        `INSERT INTO subject_grade_levels (subject_id, grade_level_id, is_required, units)
         VALUES ?`,
        [gradeLevelValues]
      );
    }

    if (userId !== undefined && userId !== null) {
      await logActivity(
        userId, 
        `Created subject: ${subjectName} (${subjectCode}) for grade levels: ${gradeLevelIds ? gradeLevelIds.join(', ') : 'none'}`
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


const getAllSubjectsModel = async (limit, offset, gradeLevelId = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT 
        s.subject_id, 
        s.subject_code, 
        s.subject_name, 
        s.description, 
        s.created_at, 
        s.updated_at,
        GROUP_CONCAT(
          CONCAT(
            sgl.grade_level_id, '|', 
            sgl.is_required, '|', 
            IFNULL(sgl.units, ''), '|', 
            IFNULL(gl.grade_code, ''), '|', 
            IFNULL(gl.grade_name, '')
          ) SEPARATOR ';'
        ) as grade_levels_data
      FROM subjects s
      LEFT JOIN subject_grade_levels sgl ON s.subject_id = sgl.subject_id
      LEFT JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
    `;
    
    let countQuery = `
      SELECT COUNT(DISTINCT s.subject_id) as total 
      FROM subjects s
    `;
    
    let queryParams = [];
    let countParams = [];

    if (gradeLevelId) {
      query += ` WHERE sgl.grade_level_id = ?`;
      countQuery += ` 
        INNER JOIN subject_grade_levels sgl ON s.subject_id = sgl.subject_id 
        WHERE sgl.grade_level_id = ?
      `;
      queryParams.push(parseInt(gradeLevelId));
      countParams.push(parseInt(gradeLevelId));
    }

    query += ` GROUP BY s.subject_id, s.subject_code, s.subject_name, s.description, s.created_at, s.updated_at
               ORDER BY s.subject_name ASC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [rows] = await connection.execute(query, queryParams);
    const [totalRows] = await connection.execute(countQuery, countParams);
    
    const processedSubjects = rows.map(subject => {
      const gradeLevels = [];
      
      if (subject.grade_levels_data) {
        const gradeLevelsArray = subject.grade_levels_data.split(';');
        
        gradeLevelsArray.forEach(gradeLevel => {
          const [grade_level_id, is_required, units, grade_code, grade_name] = gradeLevel.split('|');
          
          if (grade_level_id) {
            gradeLevels.push({
              grade_level_id: parseInt(grade_level_id),
              is_required: is_required === '1',
              units: units ? parseFloat(units) : null,
              grade_code: grade_code || null,
              grade_name: grade_name || null
            });
          }
        });
      }
      
      return {
        ...subject,
        grade_levels: gradeLevels
      };
    });
    
    return { subjects: processedSubjects, total: totalRows[0].total };
  } catch (err) {
    console.error('Model Error:', err);
    throw new Error('Failed to retrieve subjects from database');
  } finally {
    if (connection) await connection.release();
  }
};

const getAllGradeLevelsModel = async (limit, offset) => {
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
      return { gradeLevels: [], total: 0, curriculum: null };
    }

    const { curriculum_id, curriculum_name, school_year_id } = activeCurr[0];

    const query = `
      SELECT 
        gl.grade_level_id,
        gl.grade_code,
        gl.grade_name,
        s.section_id,
        s.section_name,
        subj.subject_id,
        subj.subject_code,
        subj.subject_name
      FROM grade_levels gl
      LEFT JOIN sections s 
        ON gl.grade_level_id = s.grade_level_id 
       AND s.school_year_id = ?
      LEFT JOIN subject_grade_levels sgl
        ON gl.grade_level_id = sgl.grade_level_id
      LEFT JOIN subjects subj
        ON sgl.subject_id = subj.subject_id
      LEFT JOIN curriculum_subjects cs
        ON subj.subject_id = cs.subject_id
       AND cs.curriculum_id = ?
      ORDER BY gl.grade_order, s.section_name, subj.subject_name
      LIMIT ? OFFSET ?
    `;

    const [rows] = await connection.execute(query, [
      school_year_id,
      curriculum_id,
      parseInt(limit),
      parseInt(offset),
    ]);

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM grade_levels`
    );

    const gradeLevelsMap = {};

    rows.forEach((row) => {
      if (!gradeLevelsMap[row.grade_level_id]) {
        gradeLevelsMap[row.grade_level_id] = {
          grade_level_id: row.grade_level_id,
          grade_code: row.grade_code,
          grade_name: row.grade_name,
          sections: {},
          subjects: {},
        };
      }

      if (row.section_id) {
        gradeLevelsMap[row.grade_level_id].sections[row.section_id] = {
          section_id: row.section_id,
          section_name: row.section_name,
        };
      }

      if (row.subject_id) {
        gradeLevelsMap[row.grade_level_id].subjects[row.subject_id] = {
          subject_id: row.subject_id,
          subject_code: row.subject_code,
          subject_name: row.subject_name,
        };
      }
    });

    const gradeLevels = Object.values(gradeLevelsMap).map((gl) => ({
      ...gl,
      sections: Object.values(gl.sections),
      subjects: Object.values(gl.subjects),
    }));

    return {
      gradeLevels,
      total: countRows[0].total,
      curriculum: {
        curriculum_id,
        curriculum_name,
        school_year_id,
      },
    };
  } catch (err) {
    console.error("Model Error:", err);
    throw new Error("Failed to retrieve grade levels from database");
  } finally {
    if (connection) await connection.release();
  }
};



const getSubjectByIdModel = async (subjectId) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    const [subjectRows] = await connection.execute(
      `SELECT 
        s.subject_id, 
        s.subject_code, 
        s.subject_name, 
        s.description, 
        s.created_at, 
        s.updated_at
       FROM subjects s
       WHERE s.subject_id = ?`,
      [parseInt(subjectId)]
    );
    
    if (subjectRows.length === 0) {
      return null;
    }
    
    const subject = subjectRows[0];
    
    const [gradeLevelRows] = await connection.execute(
      `SELECT 
        sgl.grade_level_id,
        sgl.is_required,
        sgl.units,
        gl.grade_code,
        gl.grade_name
       FROM subject_grade_levels sgl
       LEFT JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
       WHERE sgl.subject_id = ?`,
      [parseInt(subjectId)]
    );
    
    subject.grade_levels = gradeLevelRows.map(row => ({
      grade_level_id: row.grade_level_id,
      is_required: Boolean(row.is_required),
      units: row.units,
      grade_code: row.grade_code,
      grade_name: row.grade_name
    }));
    
    return subject;
  } catch (err) {
    console.error('Model Error:', err);
    throw new Error('Failed to retrieve subject from database');
  } finally {
    if (connection) await connection.release();
  }
};

const updateSubjectModel = async (subjectId, updateData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      'SELECT subject_id, subject_name, subject_code FROM subjects WHERE subject_id = ?',
      [subjectId]
    );
    if (existing.length === 0) {
      throw new Error('Subject not found');
    }

    const subjectFields = [];
    const subjectValues = [];

    const { subject_code, subject_name, description, grade_levels } = updateData;

    if (subject_code !== undefined) {
      subjectFields.push('subject_code = ?');
      subjectValues.push(subject_code);
    }
    if (subject_name !== undefined) {
      subjectFields.push('subject_name = ?');
      subjectValues.push(subject_name);
    }
    if (description !== undefined) {
      subjectFields.push('description = ?');
      subjectValues.push(description);
    }

    if (subjectFields.length > 0) {
      subjectFields.push('updated_at = CURRENT_TIMESTAMP');
      subjectValues.push(subjectId);

      await connection.execute(
        `UPDATE subjects SET ${subjectFields.join(', ')} WHERE subject_id = ?`,
        subjectValues
      );
    }

    let gradeLevelChanges = { added: 0, removed: 0, updated: 0 };
    
    if (Array.isArray(grade_levels)) {
      const [currentGradeLevels] = await connection.execute(
        'SELECT grade_level_id, is_required, units FROM subject_grade_levels WHERE subject_id = ?',
        [subjectId]
      );

      const currentGradeLevelMap = new Map();
      currentGradeLevels.forEach(gl => {
        currentGradeLevelMap.set(gl.grade_level_id, {
          is_required: Boolean(gl.is_required),
          units: gl.units
        });
      });

      const newGradeLevelMap = new Map();
      grade_levels.forEach(gl => {
        if (gl.grade_level_id) {
          newGradeLevelMap.set(parseInt(gl.grade_level_id), {
            is_required: gl.is_required !== undefined ? Boolean(gl.is_required) : true,
            units: gl.units !== undefined ? parseFloat(gl.units) : null
          });
        }
      });

      const gradeLevelsToRemove = [];
      const gradeLevelsToAddOrUpdate = [];

      for (const [gradeLevelId, currentData] of currentGradeLevelMap.entries()) {
        if (!newGradeLevelMap.has(gradeLevelId)) {
          gradeLevelsToRemove.push(gradeLevelId);
          gradeLevelChanges.removed++;
        } else {
          const newData = newGradeLevelMap.get(gradeLevelId);
          if (currentData.is_required !== newData.is_required || currentData.units !== newData.units) {
            gradeLevelsToAddOrUpdate.push([
              subjectId,
              gradeLevelId,
              newData.is_required,
              newData.units
            ]);
            gradeLevelChanges.updated++;
          }
          newGradeLevelMap.delete(gradeLevelId); 
        }
      }

      for (const [gradeLevelId, newData] of newGradeLevelMap.entries()) {
        gradeLevelsToAddOrUpdate.push([
          subjectId,
          gradeLevelId,
          newData.is_required,
          newData.units
        ]);
        gradeLevelChanges.added++;
      }

      if (gradeLevelsToRemove.length > 0) {
        const placeholders = gradeLevelsToRemove.map(() => '?').join(', ');
        await connection.execute(
          `DELETE FROM subject_grade_levels WHERE subject_id = ? AND grade_level_id IN (${placeholders})`,
          [subjectId, ...gradeLevelsToRemove]
        );
      }

      if (gradeLevelsToAddOrUpdate.length > 0) {
        const valuesPlaceholders = gradeLevelsToAddOrUpdate.map(() => '(?, ?, ?, ?)').join(', ');
        const flatValues = gradeLevelsToAddOrUpdate.flat();
        
        await connection.execute(
          `INSERT INTO subject_grade_levels (subject_id, grade_level_id, is_required, units)
           VALUES ${valuesPlaceholders}
           ON DUPLICATE KEY UPDATE is_required = VALUES(is_required), units = VALUES(units)`,
          flatValues
        );
      }
    }

    const oldSubject = existing[0];
    await logActivity(userId, `Updated subject ID ${subjectId}: ${oldSubject.subject_name} (${oldSubject.subject_code})`);

    await connection.commit();
    
    return { 
      affectedRows: 1,
      changes: {
        subject: subjectFields.length > 0,
        gradeLevels: gradeLevelChanges
      }
    };
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Update Subject Model Error:', err);
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};


const searchSubjectsModel = async (searchQuery, gradeLevelId = null) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    let query = `
      SELECT DISTINCT
        s.subject_id, 
        s.subject_code, 
        s.subject_name, 
        s.description, 
        s.created_at, 
        s.updated_at
      FROM subjects s
      LEFT JOIN subject_grade_levels sgl ON s.subject_id = sgl.subject_id
      WHERE (s.subject_name LIKE ? OR s.subject_code LIKE ? OR s.description LIKE ?)
    `;
    let queryParams = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];

    if (gradeLevelId) {
      query += ` AND sgl.grade_level_id = ?`;
      queryParams.push(parseInt(gradeLevelId));
    }

    query += `
      ORDER BY 
        CASE 
          WHEN s.subject_name LIKE ? THEN 1
          WHEN s.subject_code LIKE ? THEN 2
          WHEN s.description LIKE ? THEN 3
          ELSE 4
        END,
        s.subject_name ASC
      LIMIT 50`;
    
    queryParams.push(`${searchQuery}%`, `${searchQuery}%`, `%${searchQuery}%`);

    const [rows] = await connection.execute(query, queryParams);
    
    if (rows.length === 0) {
      return [];
    }

    const subjectIds = rows.map(subject => subject.subject_id);
    
    const placeholders = subjectIds.map(() => '?').join(', ');
    let gradeLevelsQuery = `
      SELECT 
        sgl.subject_id,
        sgl.grade_level_id,
        sgl.is_required,
        sgl.units,
        gl.grade_code,
        gl.grade_name
      FROM subject_grade_levels sgl
      LEFT JOIN grade_levels gl ON sgl.grade_level_id = gl.grade_level_id
      WHERE sgl.subject_id IN (${placeholders})
      ORDER BY sgl.subject_id, gl.grade_order
    `;
    
    const [gradeLevelsRows] = await connection.execute(gradeLevelsQuery, subjectIds);
    
    const gradeLevelsBySubject = {};
    gradeLevelsRows.forEach(row => {
      if (!gradeLevelsBySubject[row.subject_id]) {
        gradeLevelsBySubject[row.subject_id] = [];
      }
      
      gradeLevelsBySubject[row.subject_id].push({
        grade_level_id: row.grade_level_id,
        is_required: Boolean(row.is_required),
        units: row.units,
        grade_code: row.grade_code,
        grade_name: row.grade_name
      });
    });
    
    const processedSubjects = rows.map(subject => ({
      ...subject,
      grade_levels: gradeLevelsBySubject[subject.subject_id] || []
    }));
    
    return processedSubjects;
  } catch (err) {
    console.error('Search Subjects Model Error:', err);
    throw new Error('Failed to search subjects');
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
  searchSubjectsModel,
  checkSubjectCodeExistsModel,
  getAllGradeLevelsModel
};