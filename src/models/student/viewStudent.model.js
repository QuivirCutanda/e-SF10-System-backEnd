const db = require('../../config/db');

const getStudentByLRN = async (lrn) => {
    const sql = `
        SELECT student_id, lrn, first_name, middle_name, last_name, date_of_birth, gender, 
               street, city, province, zip_code, guardian_name, contact_number
        FROM students
        WHERE lrn = ?
    `;
    
    const [rows] = await db.query(sql, [lrn]);

    return rows[0];  
};

module.exports = { getStudentByLRN };