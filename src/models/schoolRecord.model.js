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
        userId,
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

const updateSchoolRecord = async (recordId, data, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify record exists and is not deleted
    const [existingRecord] = await connection.execute(
      `SELECT sf10_document_path FROM school_records WHERE record_id = ? AND is_deleted = FALSE`,
      [recordId]
    );
    if (existingRecord.length === 0) {
      throw new Error('School record not found or has been deleted');
    }

    const [result] = await connection.execute(
      `UPDATE school_records 
       SET start_year = ?, end_year = ?, grade_level = ?, section = ?, sf10_document_path = ?, uploaded_by = ?, uploaded_at = CURRENT_TIMESTAMP
       WHERE record_id = ? AND is_deleted = FALSE`,
      [
        data.start_year,
        data.end_year,
        data.grade_level,
        data.section,
        data.sf10_document_path,
        userId,
        recordId,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to update school record');
    }

    await logActivity(userId, `Updated school record ID ${recordId} for student`);

    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const deleteSchoolRecord = async (recordId, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify record exists and is not deleted
    const [existingRecord] = await connection.execute(
      `SELECT sf10_document_path FROM school_records WHERE record_id = ? AND is_deleted = FALSE`,
      [recordId]
    );
    if (existingRecord.length === 0) {
      throw new Error('School record not found or has been deleted');
    }

    // Soft delete the record
    const [result] = await connection.execute(
      `UPDATE school_records SET is_deleted = TRUE WHERE record_id = ?`,
      [recordId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to delete school record');
    }

    await logActivity(userId, `Soft deleted school record ID ${recordId}`);

    await connection.commit();
    return { affectedRows: result.affectedRows, sf10_document_path: existingRecord[0].sf10_document_path };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = { createSchoolRecord, updateSchoolRecord, deleteSchoolRecord };