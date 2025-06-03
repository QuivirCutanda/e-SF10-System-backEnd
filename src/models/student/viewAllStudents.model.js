const db = require('../../config/db');

const viewAllStudents = async ({ limit, offset }) => {
    const sql = `
        SELECT 
            student_id, 
            lrn, 
            first_name, 
            middle_name, 
            last_name, 
            date_of_birth, 
            gender
        FROM students
        ORDER BY last_name ASC
        LIMIT ? OFFSET ?
    `;

    const countSql = `
        SELECT COUNT(*) as total
        FROM students
    `;

    const [students] = await db.query(sql, [limit, offset]);
    const [countResult] = await db.query(countSql);

    return {
        students,
        total: countResult[0].total
    };
};

module.exports = {
    viewAllStudents,
};