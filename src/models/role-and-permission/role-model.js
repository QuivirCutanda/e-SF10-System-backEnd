const db = require('../../config/db');

// Get all roles and their associated permissions
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

// Get all available roles and all available permissions separately
const getAllRolesAndPermissionsSeparately = async () => {
  try {
    // Fetch all roles
    const [roleRows] = await db.execute(
      `SELECT role_id, role_name
       FROM roles
       ORDER BY role_name`
    );

    // Fetch all permissions
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

// Create a new role with selected permissions
const createNewRole = async (roleName, permissionIds, userId) => {
  try {
    // Validate userId
    if (!userId || !Number.isInteger(userId)) {
      throw new Error('Invalid user ID for logging');
    }

    // Check if role name already exists
    const [existingRole] = await db.execute(
      'SELECT role_id FROM roles WHERE role_name = ?',
      [roleName]
    );
    if (existingRole.length > 0) {
      throw new Error('Role name already exists');
    }

    // Insert new role
    const [roleResult] = await db.execute(
      'INSERT INTO roles (role_name) VALUES (?)',
      [roleName]
    );
    const roleId = roleResult.insertId;
    console.log(`Role created: role_id=${roleId}, role_name=${roleName}`);

    // Validate and insert permissions if provided
    if (permissionIds.length > 0) {
      // Generate placeholders for IN clause (e.g., ?,?,?)
      const placeholders = permissionIds.map(() => '?').join(',');
      const query = `SELECT permission_id FROM permissions WHERE permission_id IN (${placeholders})`;

      // Flatten permissionIds for query parameters
      const [validPermissions] = await db.execute(query, permissionIds);
      const validPermissionIds = validPermissions.map(p => p.permission_id);
      console.log('Input permission IDs:', permissionIds);
      console.log('Valid permission IDs:', validPermissionIds);

      if (validPermissionIds.length !== permissionIds.length) {
        throw new Error('Invalid permission IDs');
      }

      // Insert permissions using INSERT ... SELECT
      const insertQuery = `INSERT INTO role_permissions (role_id, permission_id)
                           SELECT ?, permission_id
                           FROM permissions
                           WHERE permission_id IN (${placeholders})`;
      const [permissionResult] = await db.execute(insertQuery, [roleId, ...permissionIds]);
      console.log(`Inserted ${permissionResult.affectedRows} permissions for role_id=${roleId}`);
    } else {
      console.log('No permissions provided for role_id=', roleId);
    }

    // Log role creation to activity_logs
    const [logResult] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, log_timestamp) VALUES (?, ?, NOW())',
      [userId, `Created role ${roleName} with ID ${roleId}`]
    );
    console.log(`Activity log created: log_id=${logResult.insertId}, user_id=${userId}`);

    // Fetch the created role with its permissions
    const [rows] = await db.execute(
      `SELECT r.role_id, r.role_name, p.permission_id, p.permission_name
       FROM roles r
       LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
       LEFT JOIN permissions p ON rp.permission_id = p.permission_id
       WHERE r.role_id = ?`,
      [roleId]
    );

    // Transform the result
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

module.exports = { getAllRolesAndPermissions, createNewRole, getAllRolesAndPermissionsSeparately };