const { getPermissionsByUserId } = require('../models/User');
const { authorizeRole } = require('./authorizeRole');

const authorizePermission = (...requiredPermissions) => async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const permissions = await getPermissionsByUserId(userId);

    // Check if user has all required permissions
    const missingPermissions = requiredPermissions.filter(perm => !permissions[perm]);

    if (missingPermissions.length > 0) {
      return res.status(403).json({
        message: `Unauthorized: Missing permissions: ${missingPermissions.join(', ')}`,
      });
    }

    next();
  } catch (err) {
    console.error('Check Permission Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authorizePermission;