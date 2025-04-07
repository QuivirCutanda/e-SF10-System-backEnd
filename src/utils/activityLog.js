const db = require('../config/db'); 

const logActivity = async (userId, action) => {
  const connection = await db.getConnection();
  try {
    await connection.execute(
      `INSERT INTO activity_logs (user_id, action) 
       VALUES (?, ?)`,
      [userId, action]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
    throw err;
  } finally {
    connection.release(); 
  }
};

module.exports = { logActivity };
