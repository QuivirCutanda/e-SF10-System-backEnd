const db = require('../config/db');

// Helper to check if user has a specific permission
const hasPermission = async (userId, permissionName) => {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.execute(`
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
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

// Fetch user info for dashboard
const getUserDashboardInfo = async (userId) => {
  const connection = await db.getConnection();
  try {
    const [userRows] = await connection.execute(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, 
             GROUP_CONCAT(r.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE u.user_id = ?
      GROUP BY u.user_id
    `, [userId]);
    return userRows[0] || {};
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

// Fetch student statistics
const getStudentStats = async (userId) => {
  if (!(await hasPermission(userId, 'view_student_info'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [studentStats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as recent_students,
        (SELECT COUNT(*) FROM transfer_requests WHERE request_status = 'Pending') as pending_transfers
    `);
    return studentStats[0];
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

// Fetch school defaults
const getSchoolInfo = async (userId) => {
  if (!(await hasPermission(userId, 'manage_school_settings') || await hasPermission(userId, 'view_reports'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [schoolRows] = await connection.execute(`
      SELECT school_id, school_name, school_address, region, division, district, school_head
      FROM school_defaults
      LIMIT 1
    `);
    return schoolRows[0] || {};
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

// Fetch recent activity logs
const getRecentLogs = async (userId) => {
  if (!(await hasPermission(userId, 'view_logs'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [logRows] = await connection.execute(`
      SELECT log_id, action, log_timestamp
      FROM activity_logs
      WHERE user_id = ? OR user_id IS NULL
      ORDER BY log_timestamp DESC
      LIMIT 5
    `, [userId]);
    return logRows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

// Fetch latest backup
const getLatestBackup = async (userId) => {
  if (!(await hasPermission(userId, 'manage_backups'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [backupRows] = await connection.execute(`
      SELECT backup_id, backup_filename, backup_date
      FROM backups
      ORDER BY backup_date DESC
      LIMIT 1
    `);
    return backupRows[0] || {};
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

// Fetch recent SF10 records
const getRecentRecords = async (userId) => {
  if (!(await hasPermission(userId, 'view_ecards') || await hasPermission(userId, 'upload_documents'))) {
    return null;
  }
  const connection = await db.getConnection();
  try {
    const [recordRows] = await connection.execute(`
      SELECT sr.record_id, sr.student_id, s.lrn, s.first_name, s.last_name, 
             sr.grade_level, sr.section, sr.uploaded_at
      FROM school_records sr
      JOIN students s ON sr.student_id = s.student_id
      WHERE sr.is_deleted = FALSE
      ORDER BY sr.uploaded_at DESC
      LIMIT 5
    `);
    return recordRows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

// Log dashboard access
const logDashboardAccess = async (userId) => {
  const connection = await db.getConnection();
  try {
    await connection.execute(`
      INSERT INTO activity_logs (user_id, action)
      VALUES (?, 'Accessed dashboard')
    `, [userId]);
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  getUserDashboardInfo,
  getStudentStats,
  getSchoolInfo,
  getRecentLogs,
  getLatestBackup,
  getRecentRecords,
  logDashboardAccess
};