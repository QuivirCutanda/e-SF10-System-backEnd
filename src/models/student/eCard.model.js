const db = require("../../config/db");

const getECardsByStudentId = async (studentId) => {
  
  const sql = `
       SELECT record_id, student_id, grade_level, section, start_year, end_year, sf10_document_path
FROM school_records
WHERE student_id = ?
    `;

  const [rows] = await db.query(sql, [studentId]);

  return rows; 
};

module.exports = { getECardsByStudentId };
