const db = require('../../config/db');

const getEcardsByStudentLRN = async (lrn) => {
    const sql = `
        SELECT sr.record_id, sr.student_id, sr.start_year, sr.end_year, sr.grade_level, 
               sr.section, sr.sf10_document_path, sr.uploaded_at
        FROM school_records sr
        JOIN students s ON sr.student_id = s.student_id
        WHERE s.lrn = ? AND sr.is_deleted = FALSE
    `;
    
    const [rows] = await db.query(sql, [lrn]);
    
    return rows;
};

module.exports = { getEcardsByStudentLRN };