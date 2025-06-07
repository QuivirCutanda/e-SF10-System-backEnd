const { getAllActivityLogs } = require('../../models/activityLog.model');

exports.viewActivityLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await getAllActivityLogs(page, limit);
    return res.status(200).json({
      success: true,
      logs: result.logs,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('View Activity Logs Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching activity logs',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString()
    });
  }
};