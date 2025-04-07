const bcrypt = require('bcryptjs');
const { createUser, assignRoleToUser, getUserByEmail } = require('../models/user');
const { generateToken } = require('../utils/generateToken');

// Register admin
const registerAdmin = async (req, res) => {
  const {
    first_name,
    middle_name = null, 
    last_name,
    email,
    password,
    role = 'admin',
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
      password,
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

    const token = generateToken({ user_id: user.user_id, email: user.email,password });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerAdmin, loginUser };
