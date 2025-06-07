const { validationResult } = require('express-validator');
const { 
  getUserDashboardInfo, 
  getStudentStats, 
  getSchoolInfo, 
  getRecentLogs, 
  getLatestBackup, 
  getRecentRecords, 
  logDashboardAccess 
} = require('../models/dashboard.model');

// Dashboard endpoint controller
exports.getDashboardData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.user_id;
    const dashboardData = {};

    // Fetch user info
    dashboardData.user = await getUserDashboardInfo(userId);

    // Student statistics (for users with view_student_info)
    const studentStats = await getStudentStats(userId);
    if (studentStats) {
      dashboardData.studentStats = studentStats;
    }

    // School defaults (for users with manage_school_settings or view_reports)
    const schoolInfo = await getSchoolInfo(userId);
    if (schoolInfo) {
      dashboardData.schoolInfo = schoolInfo;
    }

    // Recent activity logs (for users with view_logs)
    const recentLogs = await getRecentLogs(userId);
    if (recentLogs) {
      dashboardData.recentLogs = recentLogs;
    }

    // Backup status (for users with manage_backups)
    const latestBackup = await getLatestBackup(userId);
    if (latestBackup) {
      dashboardData.latestBackup = latestBackup;
    }

    // Recent SF10 uploads (for users with view_ecards or upload_documents)
    const recentRecords = await getRecentRecords(userId);
    if (recentRecords) {
      dashboardData.recentRecords = recentRecords;
    }

    // Log dashboard access
    await logDashboardAccess(userId);

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};