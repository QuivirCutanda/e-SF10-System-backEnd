const db = require('../../config/db');

const searchStudents = async (query) => {
    const sql = `
        SELECT student_id, lrn, first_name, middle_name, last_name, date_of_birth, gender
        FROM students
        WHERE 
            lrn LIKE ? OR 
            first_name LIKE ? OR 
            middle_name LIKE ? OR 
            last_name LIKE ?
        ORDER BY last_name ASC
    `;

    const param = `%${query}%`;
    const [rows] = await db.query(sql, [param, param, param, param]);
    return rows;
};

const getStudentByLRN = async (lrn) => {
    const sql = `
        SELECT student_id, lrn, first_name, middle_name, last_name, date_of_birth, gender, street, city, province, zip_code, guardian_name, contact_number
        FROM students
        WHERE lrn = ?
    `;
    
    const [rows] = await db.query(sql, [lrn]);

    return rows[0]; 
};

const getSchoolRecordsByLRN = async (lrn) => {
    const sql = `
        SELECT start_year, end_year, grade_level, section
        FROM school_records
        WHERE student_id = (
            SELECT student_id FROM students WHERE lrn = ?
        )
    `;
    
    const [rows] = await db.query(sql, [lrn]);

    return rows; 
};


module.exports = {
    searchStudents,
    getStudentByLRN,
    getSchoolRecordsByLRN,
};
