const db = require('../config/db');
const { logActivity } = require('../utils/activityLog');

const createSchoolRecord = async (studentId, data, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO school_records 
        (student_id, start_year, end_year, grade_level, section, sf10_document_path, uploaded_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        data.start_year,
        data.end_year,
        data.grade_level,
        data.section,
        data.sf10_document_path, 
        userId
      ]
    );

    const schoolRecordId = result.insertId;

    await logActivity(userId, `Created school record for student ID ${studentId} with record ID ${schoolRecordId}`);

    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = { createSchoolRecord };
