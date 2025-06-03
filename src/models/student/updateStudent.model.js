const db = require('../../config/db');

const updateStudent = async (lrn, updateData, userId) => {
    const {
        first_name,
        middle_name,
        last_name,
        extension_name,
        date_of_birth,
        gender,
        street,
        city,
        province,
        zip_code,
        guardian_name,
        contact_number
    } = updateData;

    const sql = `
        UPDATE students
        SET 
            first_name = ?,
            middle_name = ?,
            last_name = ?,
            extension_name = ?,
            date_of_birth = ?,
            gender = ?,
            street = ?,
            city = ?,
            province = ?,
            zip_code = ?,
            guardian_name = ?,
            contact_number = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE lrn = ?
    `;

    const [result] = await db.query(sql, [
        first_name,
        middle_name || null,
        last_name,
        extension_name || null,
        date_of_birth,
        gender,
        street,
        city,
        province,
        zip_code,
        guardian_name || null,
        contact_number || null,
        lrn
    ]);

    if (result.affectedRows === 0) {
        return null;
    }

    // Log the update action
    const logSql = `
        INSERT INTO activity_logs (user_id, action)
        VALUES (?, ?)
    `;
    await db.query(logSql, [userId, `Updated student info for LRN: ${lrn}`]);

    // Fetch updated student data
    const fetchSql = `
        SELECT 
            student_id, 
            lrn, 
            first_name, 
            middle_name, 
            last_name, 
            extension_name, 
            date_of_birth, 
            gender, 
            street, 
            city, 
            province, 
            zip_code, 
            guardian_name, 
            contact_number
        FROM students
        WHERE lrn = ?
    `;
    const [updatedRows] = await db.query(fetchSql, [lrn]);

    return updatedRows[0];
};

module.exports = {
    updateStudent,
};