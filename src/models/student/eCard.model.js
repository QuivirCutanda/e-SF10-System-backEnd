const db = require('../../config/db');
const path = require('path');

const getEcardsByStudentLRN = async (lrn) => {
  const sql = `
        SELECT sr.record_id, sr.student_id, sr.start_year, sr.end_year, sr.grade_level, 
               sr.section, sr.sf10_document_path, sr.uploaded_at
        FROM school_records sr
        JOIN students s ON sr.student_id = s.student_id
        WHERE s.lrn = ? AND sr.is_deleted = FALSE
    `;

  const [rows] = await db.query(sql, [lrn]);

  // Transform sf10_document_path to a URL
  const baseUrl = process.env.IMAGE_BASE_URL || `http://localhost:${process.env.PORT || 3001}/esf10/images`;
  const transformedRows = rows.map((row) => {
    if (row.sf10_document_path) {
      // Extract relative path from absolute path
      const baseDir = path.join(__dirname, '../../../data/documents/sf10');
      const relativePath = path.relative(baseDir, row.sf10_document_path).replace(/\\/g, '/');
      row.sf10_document_path = `${baseUrl}/${relativePath}`;
    }
    return row;
  });

  return transformedRows;
};

module.exports = { getEcardsByStudentLRN };