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
      `SELECT role_id FROM roles WHERE role_name = ?`,
      [role]
    );

    if (roleResult.length === 0) {
      throw new Error('Role does not exist');
    }

    const roleId = roleResult[0].role_id;

    const [result] = await connection.execute(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
      [userId, roleId]
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

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

const getPermissionsByRole = async (role) => {
  const connection = await db.getConnection();
  try {
    const [result] = await connection.execute(
      `SELECT p.permission_name
       FROM permissions p
       JOIN role_permissions rp ON p.permission_id = rp.permission_id
       JOIN roles r ON rp.role_id = r.role_id
       WHERE r.role_name = ?`,
      [role]
    );

    return result;
  } catch (err) {
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

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = { createUser, assignRoleToUser, getUserByEmail, getPermissionsByRole, getRoleByUserId };