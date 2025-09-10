const { validationResult } = require('express-validator');
const { 
  getUserDashboardInfo, 
  getStudentStats, 
  getSchoolInfo, 
  getRecentLogs, 
  getLatestBackup, 
  getRecentRecords, 
  logDashboardAccess,
  getTeacherDashboardStats
} = require('../models/dashboard.model');

exports.getDashboardData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.user_id;
    const dashboardData = {};

    dashboardData.user = await getUserDashboardInfo(userId);

    const studentStats = await getStudentStats(userId);
    if (studentStats) {
      dashboardData.studentStats = studentStats;
    }

    const schoolInfo = await getSchoolInfo(userId);
    if (schoolInfo) {
      dashboardData.schoolInfo = schoolInfo;
    }

    const recentLogs = await getRecentLogs(userId);
    if (recentLogs) {
      dashboardData.recentLogs = recentLogs;
    }

    const latestBackup = await getLatestBackup(userId);
    if (latestBackup) {
      dashboardData.latestBackup = latestBackup;
    }

    const recentRecords = await getRecentRecords(userId);
    if (recentRecords) {
      dashboardData.recentRecords = recentRecords;
    }

    await logDashboardAccess(userId);

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getTeacherDashboard = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    const dashboardData = await getTeacherDashboardStats(teacher_id);

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Teacher Dashboard Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
