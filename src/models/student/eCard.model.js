const db = require("../../config/db");

const getEcardsByStudentLRN = async (lrn) => {
  const sql = `
       SELECT record_id, student_id, grade_level, section, start_year, end_year, sf10_document_path
FROM school_records
WHERE student_id = (
    SELECT student_id FROM students WHERE lrn = ?
)

    `;

  const [rows] = await db.query(sql, [lrn]);

  return rows; 
};

module.exports = { getEcardsByStudentLRN };
