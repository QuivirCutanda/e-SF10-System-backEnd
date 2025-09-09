const db = require('../../config/db');

const fetchAllTeacherAssignments = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          ta.assignment_id, 
          ta.teacher_id, 
          u.user_id,
          ta.subject_id, 
          ta.section_id, 
          ta.school_year_id,
          CONCAT(u.first_name, ' ', IFNULL(u.middle_name, ''), ' ', u.last_name) AS teacher_name,
          sub.subject_code, 
          sub.subject_name,
          sec.section_name,
          g.grade_name,
          sy.start_year, 
          sy.end_year
       FROM teacher_assignments ta
       JOIN teachers t ON ta.teacher_id = t.teacher_id
       JOIN users u ON t.user_id = u.user_id
       JOIN subjects sub ON ta.subject_id = sub.subject_id
       JOIN sections sec ON ta.section_id = sec.section_id
       JOIN grade_levels g ON sec.grade_level_id = g.grade_level_id
       JOIN school_years sy ON ta.school_year_id = sy.school_year_id
       ORDER BY sy.start_year DESC, g.grade_order, sec.section_name, sub.subject_name`
    );

    return rows.map(row => ({
      assignment_id: row.assignment_id,
      teacher_id: row.teacher_id,
      user_id: row.user_id,
      teacher_name: row.teacher_name.trim().replace(/\s+/g, ' '), 
      subject_id: row.subject_id,
      subject_code: row.subject_code,
      subject_name: row.subject_name,
      section_id: row.section_id,
      section_name: row.section_name,
      grade_name: row.grade_name,
      school_year_id: row.school_year_id,
      school_year: `${row.start_year}-${row.end_year}`
    }));
  } catch (err) {
    console.error("Error in fetchAllTeacherAssignments:", err);
    throw new Error(`Error fetching teacher assignments: ${err.message}`);
  }
};

const fetchTeacherAssignmentById = async (assignmentId) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          ta.assignment_id, 
          ta.teacher_id, 
          u.user_id,
          ta.subject_id, 
          ta.section_id, 
          ta.school_year_id,
          CONCAT(u.first_name, ' ', IFNULL(u.middle_name, ''), ' ', u.last_name) AS teacher_name,
          sub.subject_code, 
          sub.subject_name,
          sec.section_name,
          g.grade_name,
          sy.start_year, 
          sy.end_year
       FROM teacher_assignments ta
       JOIN teachers t ON ta.teacher_id = t.teacher_id
       JOIN users u ON t.user_id = u.user_id
       JOIN subjects sub ON ta.subject_id = sub.subject_id
       JOIN sections sec ON ta.section_id = sec.section_id
       JOIN grade_levels g ON sec.grade_level_id = g.grade_level_id
       JOIN school_years sy ON ta.school_year_id = sy.school_year_id
       WHERE ta.assignment_id = ?`,
      [assignmentId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      assignment_id: row.assignment_id,
      teacher_id: row.teacher_id,
      user_id: row.user_id,
      teacher_name: row.teacher_name.trim().replace(/\s+/g, ' '),
      subject_id: row.subject_id,
      subject_code: row.subject_code,
      subject_name: row.subject_name,
      section_id: row.section_id,
      section_name: row.section_name,
      grade_name: row.grade_name,
      school_year_id: row.school_year_id,
      school_year: `${row.start_year}-${row.end_year}`
    };
  } catch (err) {
    console.error("Error in fetchTeacherAssignmentById:", err);
    throw new Error(`Error fetching teacher assignment by ID: ${err.message}`);
  }
};


const fetchTeacherAssignmentsByTeacher = async (teacherId) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          ta.assignment_id, 
          ta.teacher_id, 
          u.user_id,
          ta.subject_id, 
          ta.section_id, 
          ta.school_year_id,
          CONCAT(u.first_name, ' ', IFNULL(u.middle_name, ''), ' ', u.last_name) AS teacher_name,
          sub.subject_code, 
          sub.subject_name,
          sec.section_name,
          g.grade_name,
          sy.start_year, 
          sy.end_year
       FROM teacher_assignments ta
       JOIN teachers t ON ta.teacher_id = t.teacher_id
       JOIN users u ON t.user_id = u.user_id
       JOIN subjects sub ON ta.subject_id = sub.subject_id
       JOIN sections sec ON ta.section_id = sec.section_id
       JOIN grade_levels g ON sec.grade_level_id = g.grade_level_id
       JOIN school_years sy ON ta.school_year_id = sy.school_year_id
       WHERE ta.teacher_id = ?
       ORDER BY sy.start_year DESC, g.grade_order, sec.section_name, sub.subject_name`,
      [teacherId]
    );

    return rows.map(row => ({
      assignment_id: row.assignment_id,
      teacher_id: row.teacher_id,
      user_id: row.user_id,
      teacher_name: row.teacher_name.trim().replace(/\s+/g, " "),
      subject_id: row.subject_id,
      subject_code: row.subject_code,
      subject_name: row.subject_name,
      section_id: row.section_id,
      section_name: row.section_name,
      grade_name: row.grade_name,
      school_year_id: row.school_year_id,
      school_year: `${row.start_year}-${row.end_year}`
    }));
  } catch (err) {
    console.error('Error in fetchTeacherAssignmentsByTeacher:', err);
    throw new Error(`Error fetching teacher assignments by teacher: ${err.message}`);
  }
};


const fetchTeacherAssignmentsBySection = async (sectionId) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          ta.assignment_id, 
          ta.teacher_id, 
          u.user_id,
          ta.subject_id, 
          ta.section_id, 
          ta.school_year_id,
          CONCAT(u.first_name, ' ', IFNULL(u.middle_name, ''), ' ', u.last_name) AS teacher_name,
          sub.subject_code, 
          sub.subject_name,
          sec.section_name,
          g.grade_name,
          sy.start_year, 
          sy.end_year
       FROM teacher_assignments ta
       JOIN teachers t ON ta.teacher_id = t.teacher_id
       JOIN users u ON t.user_id = u.user_id
       JOIN subjects sub ON ta.subject_id = sub.subject_id
       JOIN sections sec ON ta.section_id = sec.section_id
       JOIN grade_levels g ON sec.grade_level_id = g.grade_level_id
       JOIN school_years sy ON ta.school_year_id = sy.school_year_id
       WHERE ta.section_id = ?
       ORDER BY sub.subject_name`,
      [sectionId]
    );

    return rows.map(row => ({
      assignment_id: row.assignment_id,
      teacher_id: row.teacher_id,
      user_id: row.user_id,
      teacher_name: row.teacher_name.trim().replace(/\s+/g, " "),
      subject_id: row.subject_id,
      subject_code: row.subject_code,
      subject_name: row.subject_name,
      section_id: row.section_id,
      section_name: row.section_name,
      grade_name: row.grade_name,
      school_year_id: row.school_year_id,
      school_year: `${row.start_year}-${row.end_year}`
    }));
  } catch (err) {
    console.error('Error in fetchTeacherAssignmentsBySection:', err);
    throw new Error(`Error fetching teacher assignments by section: ${err.message}`);
  }
};


const createNewTeacherAssignment = async (assignmentData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { teacher_id, subject_id, section_id, school_year_id } = assignmentData;

    const [teacher] = await connection.execute(
      `SELECT t.teacher_id, t.is_active, u.first_name, u.middle_name, u.last_name
       FROM teachers t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.teacher_id = ?`,
      [teacher_id]
    );
    if (teacher.length === 0) {
      throw new Error('Teacher not found');
    }
    if (!teacher[0].is_active) {
      throw new Error('Teacher is not active');
    }

    const [subject] = await connection.execute(
      'SELECT subject_id, subject_name FROM subjects WHERE subject_id = ?',
      [subject_id]
    );
    if (subject.length === 0) {
      throw new Error('Subject not found');
    }

    const [section] = await connection.execute(
      'SELECT section_id, section_name FROM sections WHERE section_id = ?',
      [section_id]
    );
    if (section.length === 0) {
      throw new Error('Section not found');
    }

    const [schoolYear] = await connection.execute(
      'SELECT school_year_id, start_year, end_year FROM school_years WHERE school_year_id = ?',
      [school_year_id]
    );
    if (schoolYear.length === 0) {
      throw new Error('School year not found');
    }

    const [existingAssignment] = await connection.execute(
      'SELECT assignment_id FROM teacher_assignments WHERE teacher_id = ? AND subject_id = ? AND section_id = ? AND school_year_id = ?',
      [teacher_id, subject_id, section_id, school_year_id]
    );
    if (existingAssignment.length > 0) {
      throw new Error('Assignment already exists');
    }

    const [result] = await connection.execute(
      'INSERT INTO teacher_assignments (teacher_id, subject_id, section_id, school_year_id) VALUES (?, ?, ?, ?)',
      [teacher_id, subject_id, section_id, school_year_id]
    );

    const assignmentId = result.insertId;
    console.log(`Teacher assignment created: assignment_id=${assignmentId}`);

    const fullName = `${teacher[0].first_name}${teacher[0].middle_name ? ' ' + teacher[0].middle_name : ''} ${teacher[0].last_name}`;
    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [
        userId,
        `Created teacher assignment: ${fullName} assigned to teach ${subject[0].subject_name} in section ${section[0].section_name} for school year ${schoolYear[0].start_year}-${schoolYear[0].end_year}`
      ]
    );

    await connection.commit();
    return await fetchTeacherAssignmentById(assignmentId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in createNewTeacherAssignment:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};


const updateTeacherAssignmentById = async (assignmentId, assignmentData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { teacher_id, subject_id, section_id, school_year_id } = assignmentData;

    const [existingAssignment] = await connection.execute(
      'SELECT assignment_id FROM teacher_assignments WHERE assignment_id = ?',
      [assignmentId]
    );
    if (existingAssignment.length === 0) {
      throw new Error('Assignment not found');
    }

    const [teacher] = await connection.execute(
      'SELECT teacher_id, first_name, last_name, is_active FROM teachers WHERE teacher_id = ?',
      [teacher_id]
    );
    if (teacher.length === 0) throw new Error('Teacher not found');
    if (!teacher[0].is_active) throw new Error('Teacher is not active');

    const [subject] = await connection.execute(
      'SELECT subject_id, subject_name FROM subjects WHERE subject_id = ?',
      [subject_id]
    );
    if (subject.length === 0) throw new Error('Subject not found');

    const [section] = await connection.execute(
      'SELECT section_id, section_name FROM sections WHERE section_id = ?',
      [section_id]
    );
    if (section.length === 0) throw new Error('Section not found');

    const [schoolYear] = await connection.execute(
      'SELECT school_year_id, start_year, end_year FROM school_years WHERE school_year_id = ?',
      [school_year_id]
    );
    if (schoolYear.length === 0) throw new Error('School year not found');

    const [duplicateAssignment] = await connection.execute(
      `SELECT assignment_id 
       FROM teacher_assignments 
       WHERE teacher_id = ? AND subject_id = ? AND section_id = ? AND school_year_id = ? 
       AND assignment_id != ?`,
      [teacher_id, subject_id, section_id, school_year_id, assignmentId]
    );
    if (duplicateAssignment.length > 0) {
      throw new Error('Assignment already exists');
    }

    const [result] = await connection.execute(
      `UPDATE teacher_assignments 
       SET teacher_id = ?, subject_id = ?, section_id = ?, school_year_id = ? 
       WHERE assignment_id = ?`,
      [teacher_id, subject_id, section_id, school_year_id, assignmentId]
    );
    if (result.affectedRows === 0) throw new Error('Assignment not found');

    await connection.execute(
      `INSERT INTO activity_logs (user_id, action, log_timestamp) 
       VALUES (?, ?, NOW())`,
      [
        userId,
        `Updated teacher assignment ID ${assignmentId}: ${teacher[0].first_name} ${teacher[0].last_name} assigned to ${subject[0].subject_name} in ${section[0].section_name} for ${schoolYear[0].start_year}-${schoolYear[0].end_year}`
      ]
    );

    await connection.commit();

    return await fetchTeacherAssignmentById(assignmentId);

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in updateTeacherAssignmentById:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};


const deleteTeacherAssignmentById = async (assignmentId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingAssignment] = await connection.execute(
      `SELECT ta.assignment_id, ta.teacher_id, ta.subject_id, ta.section_id, ta.school_year_id,
              CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
              sub.subject_name,
              sec.section_name,
              sy.start_year, sy.end_year
       FROM teacher_assignments ta
       JOIN teachers t ON ta.teacher_id = t.teacher_id
       JOIN subjects sub ON ta.subject_id = sub.subject_id
       JOIN sections sec ON ta.section_id = sec.section_id
       JOIN school_years sy ON ta.school_year_id = sy.school_year_id
       WHERE ta.assignment_id = ?`,
      [assignmentId]
    );
    if (existingAssignment.length === 0) {
      throw new Error('Assignment not found');
    }

    const [schedules] = await connection.execute(
      'SELECT COUNT(*) as count FROM class_schedule WHERE teacher_id = ? AND subject_id = ? AND section_id = ? AND school_year_id = ?',
      [existingAssignment[0].teacher_id, existingAssignment[0].subject_id, existingAssignment[0].section_id, existingAssignment[0].school_year_id]
    );
    if (schedules[0].count > 0) {
      throw new Error('Cannot delete assignment as it is being used in class schedules');
    }

    const [grades] = await connection.execute(
      `SELECT COUNT(*) as count FROM student_grades sg
       JOIN enrollment e ON sg.enrollment_id = e.enrollment_id
       WHERE sg.subject_id = ? AND e.section_id = ? AND e.school_year_id = ?`,
      [existingAssignment[0].subject_id, existingAssignment[0].section_id, existingAssignment[0].school_year_id]
    );
    if (grades[0].count > 0) {
      throw new Error('Cannot delete assignment as it is being used in student grades');
    }

    const [result] = await connection.execute(
      'DELETE FROM teacher_assignments WHERE assignment_id = ?',
      [assignmentId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Assignment not found');
    }

    console.log(`Teacher assignment deleted: assignment_id=${assignmentId}`);

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Deleted teacher assignment: ${existingAssignment[0].teacher_name} teaching ${existingAssignment[0].subject_name} in section ${existingAssignment[0].section_name} for school year ${existingAssignment[0].start_year}-${existingAssignment[0].end_year}`]
    );

    await connection.commit();
    return true;
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in deleteTeacherAssignmentById:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = { 
  fetchAllTeacherAssignments, 
  fetchTeacherAssignmentById, 
  createNewTeacherAssignment, 
  updateTeacherAssignmentById, 
  deleteTeacherAssignmentById,
  fetchTeacherAssignmentsByTeacher,
  fetchTeacherAssignmentsBySection
};