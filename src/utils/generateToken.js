const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (user) => {
  const { user_id, email,password } = user;
  return jwt.sign({ user_id, email,password }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken };
