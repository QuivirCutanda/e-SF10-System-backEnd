const { validationResult } = require('express-validator');
const db = require('../config/database'); // Assuming your DB connection setup
const { checkPermission } = require('../middleware/authMiddleware'); // Existing middleware

// Helper to check if user has a specific permission
const hasPermission = async (userId, permissionName) => {
  const [rows] = await db.query(`
    SELECT 1
    FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.permission_id
    WHERE up.user_id = ? AND p.permission_name = ? AND up.is_granted = TRUE
    UNION
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE ur.user_id = ? AND p.permission_name = ?
    LIMIT 1
  `, [userId, permissionName, userId, permissionName]);
  return rows.length > 0;
};

// Dashboard endpoint controller
exports.getDashboardData = [
  // Input validation (optional pagination params)
  checkPermission('view_reports'), // Ensure user has view_reports permission
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.user_id; // From JWT middleware
      const dashboardData = {};

      // Fetch user info
      const [userRows] = await db.query(`
        SELECT user_id, first_name, last_name, email, 
               GROUP_CONCAT(r.role_name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE u.user_id = ?
        GROUP BY u.user_id
      `, [userId]);
      dashboardData.user = userRows[0] || {};

      // Student statistics (for admins, registrars, school heads)
      if (await hasPermission(userId, 'view_student_info')) {
        const [studentStats] = await db.query(`
          SELECT 
            (SELECT COUNT(*) FROM students) as total_students,
            (SELECT COUNT(*) FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as recent_students,
            (SELECT COUNT(*) FROM transfer_requests WHERE request_status = 'Pending') as pending_transfers
        `);
        dashboardData.studentStats = studentStats[0];
      }

      // School defaults (for users with manage_school_settings or view_reports)
      if (await hasPermission(userId, 'manage_school_settings') || await hasPermission(userId, 'view_reports')) {
        const [schoolRows] = await db.query(`
          SELECT school_id, school_name, school_address, region, division, district, school_head
          FROM school_defaults
          LIMIT 1
        `);
        dashboardData.schoolInfo = schoolRows[0] || {};
      }

      // Recent activity logs (for users with view_logs)
      if (await hasPermission(userId, 'view_logs')) {
        const [logRows] = await db.query(`
          SELECT log_id, action, log_timestamp
          FROM activity_logs
          WHERE user_id = ? OR user_id IS NULL
          ORDER BY log_timestamp DESC
          LIMIT 5
        `, [userId]);
        dashboardData.recentLogs = logRows;
      }

      // Backup status (for users with manage_backups)
      if (await hasPermission(userId, 'manage_backups')) {
        const [backupRows] = await db.query(`
          SELECT backup_id, backup_filename, backup_date
          FROM backups
          ORDER BY backup_date DESC
          LIMIT 1
        `);
        dashboardData.latestBackup = backupRows[0] || {};
      }

      // Recent SF10 uploads (for users with view_ecards or upload_documents)
      if (await hasPermission(userId, 'view_ecards') || await hasPermission(userId, 'upload_documents')) {
        const [recordRows] = await db.query(`
          SELECT sr.record_id, sr.student_id, s.lrn, s.first_name, s.last_name, 
                 sr.grade_level, sr.section, sr.uploaded_at
          FROM school_records sr
          JOIN students s ON sr.student_id = s.student_id
          WHERE sr.is_deleted = FALSE
          ORDER BY sr.uploaded_at DESC
          LIMIT 5
        `);
        dashboardData.recentRecords = recordRows;
      }

      // Log dashboard access
      await db.query(`
        INSERT INTO activity_logs (user_id, action)
        VALUES (?, 'Accessed dashboard')
      `, [userId]);

      res.status(200).json(dashboardData);
    } catch (error) {
      console.error('Dashboard Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];
