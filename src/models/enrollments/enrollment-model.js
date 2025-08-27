const db = require('../../config/db');

const fetchAllEnrollments = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT e.enrollment_id, e.student_id, e.school_year_id, e.section_id, e.curriculum_id,
              e.enrollment_date, e.status,
              CONCAT(s.first_name, ' ', s.last_name) AS student_name,
              sec.section_name,
              CONCAT(sy.start_year, '-', sy.end_year) AS school_year,
              c.curriculum_name
       FROM enrollment e
       JOIN students s ON e.student_id = s.student_id
       JOIN sections sec ON e.section_id = sec.section_id
       JOIN school_years sy ON e.school_year_id = sy.school_year_id
       LEFT JOIN curriculum c ON e.curriculum_id = c.curriculum_id
       ORDER BY sy.start_year DESC, sec.section_name, s.last_name`
    );

    return rows.map(row => ({
      enrollment_id: row.enrollment_id,
      student_id: row.student_id,
      student_name: row.student_name,
      school_year_id: row.school_year_id,
      school_year: row.school_year,
      section_id: row.section_id,
      section_name: row.section_name,
      curriculum_id: row.curriculum_id,
      curriculum_name: row.curriculum_name,
      enrollment_date: row.enrollment_date,
      status: row.status
    }));
  } catch (err) {
    console.error('Error in fetchAllEnrollments:', err);
    throw new Error(`Error fetching enrollments: ${err.message}`);
  }
};

const fetchEnrollmentById = async (enrollmentId) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.enrollment_id, e.student_id, e.school_year_id, e.section_id, e.curriculum_id,
              e.enrollment_date, e.status,
              CONCAT(s.first_name, ' ', s.last_name) AS student_name,
              sec.section_name,
              CONCAT(sy.start_year, '-', sy.end_year) AS school_year,
              c.curriculum_name
       FROM enrollment e
       JOIN students s ON e.student_id = s.student_id
       JOIN sections sec ON e.section_id = sec.section_id
       JOIN school_years sy ON e.school_year_id = sy.school_year_id
       LEFT JOIN curriculum c ON e.curriculum_id = c.curriculum_id
       WHERE e.enrollment_id = ?`,
      [enrollmentId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      enrollment_id: row.enrollment_id,
      student_id: row.student_id,
      student_name: row.student_name,
      school_year_id: row.school_year_id,
      school_year: row.school_year,
      section_id: row.section_id,
      section_name: row.section_name,
      curriculum_id: row.curriculum_id,
      curriculum_name: row.curriculum_name,
      enrollment_date: row.enrollment_date,
      status: row.status
    };
  } catch (err) {
    console.error('Error in fetchEnrollmentById:', err);
    throw new Error(`Error fetching enrollment by ID: ${err.message}`);
  }
};

const createNewEnrollment = async (enrollmentData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { student_id, school_year_id, grade_level_id, section_id, curriculum_id, enrollment_date, status } = enrollmentData;

    const [student] = await connection.execute(
      "SELECT student_id, CONCAT(first_name, ' ', last_name) AS student_name FROM students WHERE student_id = ?",
      [student_id]
    );
    if (student.length === 0) throw new Error("Student not found");

    const [schoolYear] = await connection.execute(
      "SELECT school_year_id, start_year, end_year FROM school_years WHERE school_year_id = ?",
      [school_year_id]
    );
    if (schoolYear.length === 0) throw new Error("School year not found");

    const [gradeLevel] = await connection.execute(
      "SELECT grade_level_id, grade_name FROM grade_levels WHERE grade_level_id = ?",
      [grade_level_id]
    );
    if (gradeLevel.length === 0) throw new Error("Grade level not found");

    const [section] = await connection.execute(
      "SELECT section_id, section_name, grade_level_id FROM sections WHERE section_id = ?",
      [section_id]
    );
    if (section.length === 0) throw new Error("Section not found");

    if (section[0].grade_level_id !== grade_level_id) {
      throw new Error("Section does not belong to this grade level");
    }

    if (curriculum_id) {
      const [curriculum] = await connection.execute(
        "SELECT curriculum_id, curriculum_name FROM curriculum WHERE curriculum_id = ?",
        [curriculum_id]
      );
      if (curriculum.length === 0) throw new Error("Curriculum not found");
    }

    const [existingEnrollment] = await connection.execute(
      "SELECT enrollment_id FROM enrollment WHERE student_id = ? AND school_year_id = ?",
      [student_id, school_year_id]
    );
    if (existingEnrollment.length > 0) {
      throw new Error("Student already enrolled in a section for this school year");
    }

    const [result] = await connection.execute(
      "INSERT INTO enrollment (student_id, grade_level_id, school_year_id, section_id, curriculum_id, enrollment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [student_id, grade_level_id, school_year_id, section_id, curriculum_id, enrollment_date, status]
    );

    const enrollmentId = result.insertId;

    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())",
      [
        userId,
        `Created enrollment for student ${student[0].student_name} in grade ${gradeLevel[0].grade_name}, section ${section[0].section_name}, SY ${schoolYear[0].start_year}-${schoolYear[0].end_year}`,
      ]
    );

    await connection.commit();
    return await fetchEnrollmentById(enrollmentId);
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};


const updateEnrollmentById = async (enrollmentId, enrollmentData, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { student_id, grade_level_id, school_year_id, section_id, curriculum_id, enrollment_date, status } = enrollmentData;

    const [existingEnrollment] = await connection.execute(
      'SELECT enrollment_id FROM enrollment WHERE enrollment_id = ?',
      [enrollmentId]
    );
    if (existingEnrollment.length === 0) {
      throw new Error('Enrollment not found');
    }

    const [student] = await connection.execute(
      'SELECT student_id, CONCAT(first_name, " ", last_name) AS student_name FROM students WHERE student_id = ?',
      [student_id]
    );
    if (student.length === 0) throw new Error('Student not found');

    const [gradeLevel] = await connection.execute(
      'SELECT grade_level_id, grade_name FROM grade_levels WHERE grade_level_id = ?',
      [grade_level_id]
    );
    if (gradeLevel.length === 0) throw new Error('Grade level not found');

    const [schoolYear] = await connection.execute(
      'SELECT school_year_id, start_year, end_year FROM school_years WHERE school_year_id = ?',
      [school_year_id]
    );
    if (schoolYear.length === 0) throw new Error('School year not found');

    const [section] = await connection.execute(
      'SELECT section_id, section_name FROM sections WHERE section_id = ?',
      [section_id]
    );
    if (section.length === 0) throw new Error('Section not found');

    if (curriculum_id) {
      const [curriculum] = await connection.execute(
        'SELECT curriculum_id FROM curriculum WHERE curriculum_id = ?',
        [curriculum_id]
      );
      if (curriculum.length === 0) throw new Error('Curriculum not found');
    }

    const [duplicateEnrollment] = await connection.execute(
      'SELECT enrollment_id FROM enrollment WHERE student_id = ? AND school_year_id = ? AND enrollment_id != ?',
      [student_id, school_year_id, enrollmentId]
    );
    if (duplicateEnrollment.length > 0) {
      throw new Error('Student is already enrolled in another section for this school year');
    }

    const [result] = await connection.execute(
      `UPDATE enrollment 
       SET student_id = ?, grade_level_id = ?, school_year_id = ?, section_id = ?, curriculum_id = ?, enrollment_date = ?, status = ? 
       WHERE enrollment_id = ?`,
      [student_id, grade_level_id, school_year_id, section_id, curriculum_id, enrollment_date, status, enrollmentId]
    );

    if (result.affectedRows === 0) throw new Error('Enrollment not found');

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Updated enrollment ID ${enrollmentId} for student ${student[0].student_name} in grade ${gradeLevel[0].grade_name}, section ${section[0].section_name}, SY ${schoolYear[0].start_year}-${schoolYear[0].end_year}`]
    );

    await connection.commit();
    return await fetchEnrollmentById(enrollmentId);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in updateEnrollmentById:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};


const deleteEnrollmentById = async (enrollmentId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingEnrollment] = await connection.execute(
      `SELECT e.enrollment_id, e.student_id, e.school_year_id, e.section_id, e.status,
              CONCAT(s.first_name, ' ', s.last_name) AS student_name,
              sec.section_name,
              CONCAT(sy.start_year, '-', sy.end_year) AS school_year
       FROM enrollment e
       JOIN students s ON e.student_id = s.student_id
       JOIN sections sec ON e.section_id = sec.section_id
       JOIN school_years sy ON e.school_year_id = sy.school_year_id
       WHERE e.enrollment_id = ?`,
      [enrollmentId]
    );
    if (existingEnrollment.length === 0) {
      throw new Error('Enrollment not found');
    }

    const [grades] = await connection.execute(
      'SELECT COUNT(*) as count FROM student_grades WHERE enrollment_id = ?',
      [enrollmentId]
    );
    if (grades[0].count > 0) {
      throw new Error('Cannot delete enrollment as it has associated grades');
    }

    const [result] = await connection.execute(
      'DELETE FROM enrollment WHERE enrollment_id = ?',
      [enrollmentId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Enrollment not found');
    }

    console.log(`Enrollment deleted: enrollment_id=${enrollmentId}`);

    await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Deleted enrollment for student ${existingEnrollment[0].student_name} in section ${existingEnrollment[0].section_name} for school year ${existingEnrollment[0].school_year}`]
    );

    await connection.commit();
    return true;
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in deleteEnrollmentById:', err);
    throw new Error(err.message);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = { 
  fetchAllEnrollments, 
  fetchEnrollmentById, 
  createNewEnrollment, 
  updateEnrollmentById, 
  deleteEnrollmentById 
};