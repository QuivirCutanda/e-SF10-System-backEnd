const db = require('../config/db');

const createUser = async (user) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { first_name, middle_name, last_name, email, password } = user;
    const [result] = await connection.execute(
      `INSERT INTO users (first_name, middle_name, last_name, email, password)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, middle_name, last_name, email, password]
    );
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const assignRoleToUser = async (userId, role) => {
  const connection = await db.getConnection();
  try {
    const [roleResult] = await connection.execute(
      `SELECT role_id FROM roles WHERE role_name = LOWER(?)`,
      [role]
    );
    if (roleResult.length === 0) {
      throw new Error(`Role '${role}' does not exist`);
    }
    const roleId = roleResult[0].role_id;
    await connection.execute(
      `DELETE FROM user_roles WHERE user_id = ?`,
      [userId]
    );
    const [result] = await connection.execute(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
      [userId, roleId]
    );
    await connection.execute(
      `INSERT INTO activity_logs (user_id, action)
       VALUES (?, ?)`,
      [userId, `Assigned role '${role}' to user_id ${userId}`]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getUserByEmail = async (email) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return result.length === 0 ? null : result[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getUserById = async (userId) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      `SELECT * FROM users WHERE user_id = ?`,
      [userId]
    );
    return result.length === 0 ? null : result[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getPermissionsByUserId = async (userId) => {
  const connection = await db.getConnection();
  try {
    console.log(`Fetching permissions for user_id: ${userId}`);
    const [roleCheck] = await connection.execute(
      `SELECT r.role_name 
       FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.role_id 
       WHERE ur.user_id = ?`,
      [userId]
    );
    console.log(`Role check result:`, roleCheck);
    if (roleCheck.length === 0) {
      console.warn(`No role assigned for user_id ${userId}`);
      const [allPermissions] = await connection.execute(
        `SELECT permission_name, FALSE AS has_access
         FROM permissions
         ORDER BY permission_name`
      );
      const permissions = {};
      allPermissions.forEach(row => {
        permissions[row.permission_name] = false;
      });
      return permissions;
    }
    const [result] = await connection.execute(
      `SELECT p.permission_name,
              COALESCE(up.is_granted, EXISTS (
                SELECT 1 
                FROM role_permissions rp
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE rp.permission_id = p.permission_id AND ur.user_id = ?
              )) AS has_access
       FROM permissions p
       LEFT JOIN user_permissions up ON p.permission_id = up.permission_id AND up.user_id = ?
       ORDER BY p.permission_name`,
      [userId, userId]
    );
    console.log(`Raw permissions query result:`, result);
    const permissions = {};
    result.forEach(row => {
      permissions[row.permission_name] = row.has_access === 1;
    });
    return permissions;
  } catch (err) {
    console.error('Get Permissions Error:', err);
    throw err;
  } finally {
    connection.release();
  }
};

const getRoleByUserId = async (userId) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      `SELECT r.role_name
       FROM roles r
       JOIN user_roles ur ON r.role_id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );
    return result.length === 0 ? null : result[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const updateUserById = async (userId, userData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { first_name, middle_name, last_name, email, password } = userData;
    const query = `
      UPDATE users 
      SET 
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        email = ?,
        password = COALESCE(?, password)
      WHERE user_id = ?
    `;
    const [result] = await connection.execute(query, [
      first_name, middle_name, last_name, email, password, userId
    ]);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const deleteUserById = async (userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `DELETE FROM user_roles WHERE user_id = ?`,
      [userId]
    );
    await connection.execute(
      `DELETE FROM user_permissions WHERE user_id = ?`,
      [userId]
    );
    const [result] = await connection.execute(
      `DELETE FROM users WHERE user_id = ?`,
      [userId]
    );
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const modifyUserPermissions = async (userId, permissionName, isGranted, modifiedBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify user exists
    const [userCheck] = await connection.execute(
      `SELECT 1 FROM users WHERE user_id = ?`,
      [userId]
    );
    if (userCheck.length === 0) {
      throw new Error(`User ID ${userId} does not exist`);
    }

    // Verify permission exists
    const [permissionCheck] = await connection.execute(
      `SELECT permission_id FROM permissions WHERE permission_name = ?`,
      [permissionName]
    );
    if (permissionCheck.length === 0) {
      throw new Error(`Permission '${permissionName}' does not exist`);
    }
    const permissionId = permissionCheck[0].permission_id;

    // Insert or update permission override
    const [result] = await connection.execute(
      `INSERT INTO user_permissions (user_id, permission_id, is_granted)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE is_granted = ?`,
      [userId, permissionId, isGranted, isGranted]
    );

    // Log the action
    await connection.execute(
      `INSERT INTO activity_logs (user_id, action)
       VALUES (?, ?)`,
      [modifiedBy, `Modified permission '${permissionName}' to ${isGranted} for user_id ${userId}`]
    );

    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = { 
  createUser, 
  assignRoleToUser, 
  getUserByEmail, 
  getPermissionsByUserId, 
  getRoleByUserId,
  getUserById,
  updateUserById,
  deleteUserById,
  modifyUserPermissions
};