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

const updateUser = async (userId, userData) =>{
    const connection =  await db.getConnection();

    try {
        await connection.beginTransaction();

        const {first_name, middle_name, last_name, email} = userData;

        const [result] = await connection.execute(`
            UPDATE users
            SET first_name = ?, middle_name = ?, last_name = ?, email = ?
            WHERE user_id = ?
            `,[first_name,middle_name || null, last_name, email,userId]);

            await connection.commit();
            return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    }finally{
        connection.release();
    }
}

const deleteUser =  async (userId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);

        const [result] = await connection.execute('DELETE FROM users WHERE user_id = ?', [userId]);

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    }finally {
        connection.release();

    }
}

module.exports = {getAllUsers, getUserById, updateUser, deleteUser};
