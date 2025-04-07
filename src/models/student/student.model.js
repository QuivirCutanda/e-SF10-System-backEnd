const db = require('../../config/db'); 
const { logActivity } = require('../../utils/activityLog');

const createStudent = async (data, userId) => {
  const connection = await db.getConnection(); 
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO students 
         (lrn, first_name, middle_name, last_name, extension_name, date_of_birth, gender, street, city, province, zip_code, guardian_name, contact_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.lrn,
        data.first_name,
        data.middle_name,
        data.last_name,
        data.extension_name,
        data.date_of_birth,
        data.gender,
        data.street,
        data.city,
        data.province,
        data.zip_code,
        data.guardian_name,
        data.contact_number
      ]
    );

    const studentId = result.insertId; 

    if (data.schoolRecord) {
      await connection.execute(
        `INSERT INTO school_records 
          (student_id, start_year, end_year, grade_level, section) 
          VALUES (?, ?, ?, ?, ?)`,
        [
          studentId,
          data.schoolRecord.start_year,
          data.schoolRecord.end_year,
          data.schoolRecord.grade_level,
          data.schoolRecord.section
        ]
      );
    }

    await logActivity(userId, `Created student with ID ${studentId}`);

    await connection.commit(); 
    return result;
  } catch (err) {
    await connection.rollback();
    throw err; 
  } finally {
    connection.release(); 
  }
};

module.exports = { createStudent };
