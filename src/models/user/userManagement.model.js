const db = require("../../config/db");

const getAllUsers = async () => {
    const connection = await db.getConnection();

    try {
         const [users] = await connection.execute(`
            SELECT u.user_id, u.first_name,  u.middle_name, u.last_name, u.email, u.created_at, GROUP_CONCAT(r.role_name)
                as roles FROM users u LEFT JOIN user_roles  ur ON u.user_id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.role_id
                GROUP BY u.user_id
                ORDER BY u.created_at DESC  `);

                return users;
    } catch (error) {
        throw error;
    } finally{
        connection.release();
    }
};

const getUserById = async (userId) => {
    const connection =  await db.getConnection();
    try {
        const [user] =  await connection.execute(`
            SELECT u.user_id, u.first_name, u.middle_name, u.last_name, u.email,
            u.created_at, GROUP_CONCAT(r.role_name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.user_id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.role_id
            WHERE u.user_id = ?
            GROUP BY u.user_id
            `, [userId]);

            if(user.length === 0){
                return null;
            }

            return user[0];
    } catch (error) {
        throw error;
    }finally{
        connection.release();
    }
 
};

module.exports = {getAllUsers, getUserById}
