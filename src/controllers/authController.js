const bcrypt = require('bcryptjs');
const { createUser, assignRoleToUser, getUserByEmail, getPermissionsByRole, getRoleByUserId, updateUserById, deleteUserById, getUserById } = require('../models/User');
const { generateToken } = require('../utils/generateToken');

// Register user with role
const registerUser = async (req, res) => {
  const {
    first_name,
    middle_name = null,
    last_name,
    email,
    password,
    role // 'admin', 'teacher', 'registrar', or 'student'
  } = req.body;

  try {
    const validRoles = ['admin', 'teacher', 'registrar', 'student'];
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
      return res
        .status(400)
        .json({ message: 'Role not found or cannot be assigned.' });
    }

    const permissions = await getPermissionsByRole(role);

    // Generate JWT token
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
        permissions: permissions.map(p => p.permission_name)
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
      return res
        .status(400)
        .json({ message: 'Role not found or cannot be assigned.' });
    }

    const token = generateToken({
      user_id: result.insertId,
      email,
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
    });
  } catch (err) {
    console.error('Register Error:', err);
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

    // Fetch user's role
    const roleResult = await getRoleByUserId(user.user_id);
    if (!roleResult) {
      return res.status(400).json({ message: 'User has no assigned role' });
    }
    const role = roleResult.role_name;

    // Fetch permissions for the role
    const permissions = await getPermissionsByRole(role);

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
        permissions: permissions.map(p => p.permission_name)
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

    // Check if email is being updated and already exists
    if (email && email !== user.email) {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = {
      first_name: first_name || user.first_name,
      middle_name: user.middle_name, // Preserve existing middle_name
      last_name: last_name || user.last_name,
      email: email || user.email,
      password: user.password // Preserve existing password
    };

    await updateUserById(userId, updateData);

    // Fetch updated user data
    const updatedUser = await getUserById(userId);
    const roleResult = await getRoleByUserId(userId);
    if (!roleResult) {
      return res.status(400).json({ message: 'User has no assigned role' });
    }
    const permissions = await getPermissionsByRole(roleResult.role_name);

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        user_id: updatedUser.user_id,
        first_name: updatedUser.first_name,
        middle_name: updatedUser.middle_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        role: roleResult.role_name,
        permissions: permissions.map(p => p.permission_name)
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

    const permissions = await getPermissionsByRole(role);

    res.status(200).json({
      message: 'User information retrieved successfully',
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        role,
        permissions: permissions.map(p => p.permission_name),
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
    // Validate request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Fetch user
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
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

module.exports = { registerAdmin, registerUser, loginUser, updateUser, deleteUser, getUserInfo, updateUserPassword };