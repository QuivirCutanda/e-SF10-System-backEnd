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

module.exports = {
    searchStudents,
};
