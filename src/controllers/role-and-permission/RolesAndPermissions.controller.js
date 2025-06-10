const { getAllRolesAndPermissions, createNewRole, getAllRolesAndPermissionsSeparately, updateUserRole } = require('../../models/role-and-permission/role-model');

// View all roles with their associated permissions
exports.viewRolesAndPermissions = async (req, res) => {
  try {
    const roles = await getAllRolesAndPermissions();
    return res.status(200).json({
      success: true,
      roles,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('View Roles and Permissions Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching roles and permissions',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// View all available roles and all available permissions separately
exports.viewAllRolesAndPermissions = async (req, res) => {
  try {
    const { roles, permissions } = await getAllRolesAndPermissionsSeparately();
    return res.status(200).json({
      success: true,
      data: {
        roles,
        permissions
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('View All Roles and Permissions Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching all roles and permissions',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Create a new role with selected permissions
exports.createRole = async (req, res) => {
  const { role_name, permission_ids } = req.body;
  const userId = req.user?.user_id; // Extract user_id from JWT token

  // Validate input
  if (!role_name || typeof role_name !== 'string' || role_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Role name is required and must be a non-empty string',
      timestamp: new Date().toISOString()
    });
  }

  if (!Array.isArray(permission_ids) || permission_ids.some(id => !Number.isInteger(id) || id <= 0)) {
    return res.status(400).json({
      success: false,
      error: 'Permission IDs must be an array of positive integers',
      timestamp: new Date().toISOString()
    });
  }

  if (!userId || !Number.isInteger(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const result = await createNewRole(role_name.trim(), permission_ids, userId);
    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      role: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create Role Error:', error);
    if (error.message.includes('Role name already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Role name already exists',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Invalid permission IDs')) {
      return res.status(400).json({
        success: false,
        error: 'One or more permission IDs are invalid',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Invalid user ID')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID for logging',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while creating role',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Update user roles
exports.updateUserRole = async (req, res) => {
  const { user_id, role_ids } = req.body;
  const requesterId = req.user?.user_id; // Extract user_id from JWT token

  // Validate input
  if (!user_id || !Number.isInteger(user_id) || user_id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required and must be a positive integer',
      timestamp: new Date().toISOString()
    });
  }

  if (!Array.isArray(role_ids) || role_ids.some(id => !Number.isInteger(id) || id <= 0)) {
    return res.status(400).json({
      success: false,
      error: 'Role IDs must be an array of positive integers',
      timestamp: new Date().toISOString()
    });
  }

  if (!requesterId || !Number.isInteger(requesterId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid requester ID from authentication token',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const result = await updateUserRole(user_id, role_ids, requesterId);
    return res.status(200).json({
      success: true,
      message: 'User roles updated successfully',
      user_roles: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update User Role Error:', error);
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Invalid role IDs')) {
      return res.status(400).json({
        success: false,
        error: 'One or more role IDs are invalid',
        timestamp: new Date().toISOString()
      });
    }
    if (error.message.includes('Invalid requester ID')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid requester ID for logging',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error while updating user roles',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};