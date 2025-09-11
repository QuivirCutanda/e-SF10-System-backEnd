const db = require('../../config/db');

const getAllRolesAndPermissions = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT r.role_id, r.role_name, p.permission_id, p.permission_name
       FROM roles r
       LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.permission_id
       ORDER BY r.role_name, p.permission_name`
    );

    const rolesMap = new Map();
    rows.forEach(row => {
      const { role_id, role_name, permission_id, permission_name } = row;
      if (!rolesMap.has(role_id)) {
        rolesMap.set(role_id, {
          role_id,
          role_name,
          permissions: []
        });
      }
      if (permission_id && permission_name) {
        rolesMap.get(role_id).permissions.push({
          permission_id,
          permission_name
        });
      }
    });

    return Array.from(rolesMap.values());
  } catch (err) {
    console.error('Error in getAllRolesAndPermissions:', err);
    throw new Error(`Error fetching roles and permissions: ${err.message}`);
  }
};

const getAllRolesAndPermissionsSeparately = async () => {
  try {
    const [roleRows] = await db.execute(
      `SELECT role_id, role_name
       FROM roles
       ORDER BY role_name`
    );

    const [permissionRows] = await db.execute(
      `SELECT permission_id, permission_name
       FROM permissions
       ORDER BY permission_name`
    );

    return {
      roles: roleRows.map(row => ({
        role_id: row.role_id,
        role_name: row.role_name
      })),
      permissions: permissionRows.map(row => ({
        permission_id: row.permission_id,
        permission_name: row.permission_name
      }))
    };
  } catch (err) {
    console.error('Error in getAllRolesAndPermissionsSeparately:', err);
    throw new Error(`Error fetching all roles and permissions: ${err.message}`);
  }
};

const createNewRole = async (roleName, permissionIds, userId) => {
  try {
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    const [existingRole] = await db.execute(
      'SELECT role_id FROM roles WHERE role_name = ?',
      [roleName]
    );
    if (existingRole.length > 0) {
      throw new Error('Role name already exists');
    }

    const [roleResult] = await db.execute(
      'INSERT INTO roles (role_name) VALUES (?)',
      [roleName]
    );
    const roleId = roleResult.insertId;
    console.log(`Role created: role_id=${roleId}, role_name=${roleName}`);

    if (permissionIds.length > 0) {
      const placeholders = permissionIds.map(() => '?').join(',');
      const query = `SELECT permission_id FROM permissions WHERE permission_id IN (${placeholders})`;

      const [validPermissions] = await db.execute(query, permissionIds);
      const validPermissionIds = validPermissions.map(p => p.permission_id);
      console.log('Input permission IDs:', permissionIds);
      console.log('Valid permission IDs:', validPermissionIds);

      if (validPermissionIds.length !== permissionIds.length) {
        throw new Error('Invalid permission IDs');
      }

      const insertQuery = `INSERT INTO role_permissions (role_id, permission_id)
                           SELECT ?, permission_id
                           FROM permissions
                           WHERE permission_id IN (${placeholders})`;
      const [permissionResult] = await db.execute(insertQuery, [roleId, ...permissionIds]);
      console.log(`Inserted ${permissionResult.affectedRows} permissions for role_id=${roleId}`);
    } else {
      console.log('No permissions provided for role_id=', roleId);
    }

    const [logResult] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Created role ${roleName} with ID ${roleId}`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, user_id=${userId}`);

    const [rows] = await db.execute(
      `SELECT r.role_id, r.role_name, p.permission_id, p.permission_name
       FROM roles r
       LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.permission_id
       WHERE r.role_id = ?`,
      [roleId]
    );

    const role = {
      role_id: roleId,
      role_name: roleName,
      permissions: []
    };
    rows.forEach(row => {
      if (row.permission_id && row.permission_name) {
        role.permissions.push({
          permission_id: row.permission_id,
          permission_name: row.permission_name
        });
      }
    });

    return role;
  } catch (err) {
    console.error('Error in createNewRole:', err);
    throw new Error(err.message);
  }
};

const updateUserRole = async (userId, roleIds, requesterId) => {
  let connection;
  try {
    if (!requesterId || !Number.isInteger(requesterId)) {
      throw new Error('Invalid requester ID for logging');
    }

    const [userResult] = await db.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );
    if (userResult.length === 0) {
      throw new Error('User not found');
    }

    if (roleIds.length > 0) {
      const placeholders = roleIds.map(() => '?').join(',');
      const query = `SELECT role_id FROM roles WHERE role_id IN (${placeholders})`;
      const [validRoles] = await db.execute(query, roleIds);
      const validRoleIds = validRoles.map(r => r.role_id);

      if (validRoleIds.length !== roleIds.length) {
        throw new Error('Invalid role IDs');
      }
    }

    connection = await db.getConnection();

    await connection.beginTransaction();

    await connection.execute(
      'DELETE FROM user_roles WHERE user_id = ?',
      [userId]
    );

    if (roleIds.length > 0) {
      const placeholders = roleIds.map(() => '(?, ?)').join(',');
      const values = roleIds.flatMap(roleId => [userId, roleId]);
      const insertQuery = `INSERT INTO user_roles (user_id, role_id) VALUES ${placeholders}`;
      const [roleResult] = await connection.execute(insertQuery, values);
      console.log(`Inserted ${roleResult.affectedRows} roles for user_id=${userId}`);
    } else {
      console.log(`No roles assigned for user_id=${userId}`);
    }

    const roleIdsStr = roleIds.length > 0 ? roleIds.join(', ') : 'none';
    const [logResult] = await connection.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [requesterId, `Updated roles for user_id=${userId} to role_ids=[${roleIdsStr}]`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, requester_id=${requesterId}`);

    await connection.commit();

    const [rows] = await connection.execute(
      `SELECT ur.user_id, ur.role_id, r.role_name
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );

    const userRoles = {
      user_id: userId,
      roles: rows.map(row => ({
        role_id: row.role_id,
        role_name: row.role_name
      }))
    };

    return userRoles;
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error in updateUserRole:', err);
    throw new Error(err.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { getAllRolesAndPermissions, createNewRole, getAllRolesAndPermissionsSeparately, updateUserRole };