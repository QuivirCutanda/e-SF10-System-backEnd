const bcrypt = require('bcryptjs');
const { createUser, assignRoleToUser, getUserByEmail, getPermissionsByRole, getRoleByUserId } = require('../models/User');
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

module.exports = { registerAdmin, registerUser, loginUser };