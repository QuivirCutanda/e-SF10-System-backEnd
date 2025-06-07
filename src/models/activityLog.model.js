const db = require('../config/db');

const getAllActivityLogs = async (page, limit) => {
  const offset = (page - 1) * limit;

  try {
    // Query to get activity logs with user details
    const [logs] = await db.execute(
      `SELECT al.log_id, al.user_id, al.action, al.log_timestamp,
              u.first_name, u.middle_name, u.last_name, u.email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       ORDER BY al.log_timestamp DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Query to get total count of logs
    const [totalResult] = await db.execute(
      `SELECT COUNT(*) AS total FROM activity_logs`
    );
    const total = totalResult[0].total;

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (err) {
    throw new Error(`Error fetching activity logs: ${err.message}`);
  }
};

module.exports = { getAllActivityLogs };