const db = require('../config/db');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.user_id) {
      return res.status(400).json({ message: 'Bad Request: User ID is missing' });
    }

    const connection = await db.getConnection(); 
    try {
      const userId = req.user.user_id;  
      console.log(`Decoded userId: ${userId}`); 

      const [roles] = await connection.execute(
        `
        SELECT r.role_name
        FROM users u
        JOIN user_roles ur ON u.user_id = ur.user_id
        JOIN roles r ON ur.role_id = r.role_id
        WHERE u.user_id = ?
        `,
        [userId]
      );

      if (!roles || roles.length === 0) {
        return res.status(404).json({ message: 'No roles found for user' });
      }

      if (roles.some(role => role.role_name === 'admin')) {
        return next(); 
      }

      const [permissions] = await connection.execute(
        `
        SELECT p.permission_name
        FROM users u
        JOIN user_roles ur ON u.user_id = ur.user_id
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE u.user_id = ? AND p.permission_name = ?
        `,
        [userId, requiredPermission]
      );

      if (permissions.length > 0) {
        return next(); 
      }

      return res.status(403).json({ message: 'Forbidden: You do not have the required permission' });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      connection.release();  
    }
  };
};

module.exports = { checkPermission };
