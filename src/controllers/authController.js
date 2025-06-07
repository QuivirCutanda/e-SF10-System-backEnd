const bcrypt = require('bcryptjs');
const { createUser, assignRoleToUser, getUserByEmail, getPermissionsByUserId, getRoleByUserId, updateUserById, deleteUserById, getUserById, modifyUserPermissions } = require('../models/User');
const { generateToken } = require('../utils/generateToken');

// Register user with role
const registerUser = async (req, res) => {
  const {
    first_name,
    middle_name = null,
    last_name,
    email,
    password,
    role
  } = req.body;

  try {
    const validRoles = ['admin', 'teacher', 'registrar', 'student', 'school_head', 'parent_guardian', 'it_support'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await createUser({
      first_name,
      middle_name,
      last_name,
      email,
      password: hashedPassword,
    });

    const roleResult = await assignRoleToUser(result.insertId, role);

    if (!roleResult) {
      return res.status(400).json({ message: 'Role not found or cannot be assigned.' });
    }

    const permissions = await getPermissionsByUserId(result.insertId);

    const token = generateToken({
      user_id: result.insertId,
      email,
      role
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        user_id: result.insertId,
        first_name,
        last_name,
        email,
        role,
        permissions
      }
    });
  } catch (err) {
    console.error('Register User Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register admin
const registerAdmin = async (req, res) => {
  const {
    first_name,
    middle_name = null,
    last_name,
    email,
    password,
    role = 'admin'
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await createUser({
      first_name,
      middle_name,
      last_name,
      email,
      password: hashedPassword,
    });

    const roleResult = await assignRoleToUser(result.insertId, role);

    if (!roleResult) {
      return res.status(400).json({ message: 'Role not found or cannot be assigned.' });
    }

    const permissions = await getPermissionsByUserId(result.insertId);

    const token = generateToken({
      user_id: result.insertId,
      email,
      role
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: {
        user_id: result.insertId,
        first_name,
        last_name,
        email,
        role,
        permissions
      }
    });
  } catch (err) {
    console.error('Register Admin Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const roleResult = await getRoleByUserId(user.user_id);
    if (!roleResult) {
      return res.status(400).json({ message: 'User has no assigned role' });
    }
    const role = roleResult.role_name;

    const permissions = await getPermissionsByUserId(user.user_id);

    const token = generateToken({ user_id: user.user_id, email: user.email, role });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role,
        permissions
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const {
    first_name,
    last_name,
    email
  } = req.body;

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = {
      first_name: first_name || user.first_name,
      middle_name: user.middle_name,
      last_name: last_name || user.last_name,
      email: email || user.email,
      password: user.password
    };

    await updateUserById(userId, updateData);

    const updatedUser = await getUserById(userId);
    const roleResult = await getRoleByUserId(userId);
    if (!roleResult) {
      return res.status(400).json({ message: 'User has no assigned role' });
    }
    const permissions = await getPermissionsByUserId(userId);

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        user_id: updatedUser.user_id,
        first_name: updatedUser.first_name,
        middle_name: updatedUser.middle_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        role: roleResult.role_name,
        permissions
      }
    });
  } catch (err) {
    console.error('Update User Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await deleteUserById(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user info
const getUserInfo = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const roleResult = await getRoleByUserId(userId);
    if (!roleResult) {
      return res.status(400).json({ message: 'User has no assigned role' });
    }
    const role = roleResult.role_name;

    const permissions = await getPermissionsByUserId(userId);

    res.status(200).json({
      message: 'User information retrieved successfully',
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        role,
        permissions,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    console.error('Get User Info Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user password
const updateUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updateData = {
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      email: user.email,
      password: hashedNewPassword
    };

    await updateUserById(userId, updateData);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update User Password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Modify user permissions
const modifyUserPermission = async (req, res) => {
  const { userId } = req.params;
  const { permission_name, is_granted } = req.body;
  const requestingUserId = req.user.user_id; // From authMiddleware

  try {
    // Validate request body
    if (!permission_name || typeof is_granted !== 'boolean') {
      return res.status(400).json({ message: 'permission_name and is_granted (boolean) are required' });
    }

    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Modify permission
    await modifyUserPermissions(userId, permission_name, is_granted, requestingUserId);

    // Fetch updated permissions
    const updatedPermissions = await getPermissionsByUserId(userId);

    res.status(200).json({
      message: 'User permissions modified successfully',
      user: {
        user_id: Number(userId),
        permissions: updatedPermissions
      }
    });
  } catch (err) {
    console.error('Modify User Permissions Error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Placeholder for listing students
const listStudents = async (req, res) => {
  try {
    // This is a stub; implement actual student fetching logic here
    res.status(200).json({
      message: 'Students retrieved successfully',
      students: [] // Replace with actual data
    });
  } catch (err) {
    console.error('List Students Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerAdmin, registerUser, loginUser, updateUser, deleteUser, getUserInfo, updateUserPassword, modifyUserPermission, listStudents };