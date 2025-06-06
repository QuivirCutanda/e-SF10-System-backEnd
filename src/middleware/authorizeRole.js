const { getRoleByUserId } = require('../models/User');

const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const roleResult = await getRoleByUserId(req.user.user_id);
      if (!roleResult) {
        return res.status(403).json({ message: 'User has no assigned role' });
      }

      const userRole = roleResult.role_name;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      console.error('Authorization error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = { authorizeRole };