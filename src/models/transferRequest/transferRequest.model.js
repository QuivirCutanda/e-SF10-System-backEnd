const db = require('../../config/db');
const { logActivity } = require('../../utils/activityLog');

const createTransferRequestModel = async (studentId, requestingSchool, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO transfer_requests (student_id, requesting_school, request_status, requested_at)
       VALUES (?, ?, 'Pending', CURRENT_TIMESTAMP)`,
      [studentId, requestingSchool]
    );

    const transferId = result.insertId;
    await logActivity(userId, `Created transfer request ID ${transferId} for student ID ${studentId}`);

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getAllTransferRequestsModel = async (limit, offset) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      `SELECT tr.transfer_id, tr.student_id, s.lrn, s.first_name, s.last_name, tr.requesting_school, 
              tr.request_status, tr.requested_at, 
              COALESCE(tr.processed_by, 0) AS processed_by, 
              COALESCE(tr.processed_at, '') AS processed_at, 
              COALESCE(u.first_name, 'Not Processed') AS processor_first_name, 
              COALESCE(u.last_name, 'Not Processed') AS processor_last_name
       FROM transfer_requests tr
       JOIN students s ON tr.student_id = s.student_id
       LEFT JOIN users u ON tr.processed_by = u.user_id
       WHERE tr.request_status != 'Deleted'
       ORDER BY tr.requested_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    const [totalRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM transfer_requests WHERE request_status != 'Deleted'`
    );
    return { requests: rows, total: totalRows[0].total };
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

const getTransferRequestByIdModel = async (transferId) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute(
      `SELECT tr.transfer_id, tr.student_id, s.lrn, s.first_name, s.last_name, tr.requesting_school, 
              tr.request_status, tr.requested_at, 
              COALESCE(tr.processed_by, 0) AS processed_by, 
              COALESCE(tr.processed_at, '') AS processed_at, 
              COALESCE(u.first_name, 'Not Processed') AS processor_first_name, 
              COALESCE(u.last_name, 'Not Processed') AS processor_last_name
       FROM transfer_requests tr
       JOIN students s ON tr.student_id = s.student_id
       LEFT JOIN users u ON tr.processed_by = u.user_id
       WHERE tr.transfer_id = ? AND tr.request_status != 'Deleted'`,
      [parseInt(transferId)]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};


const updateTransferRequestModel = async (transferId, requestStatus, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    console.log('updateTransferRequestModel - Params:', { transferId, requestStatus, userId });

    // Validate userId exists in users table
    const [userCheck] = await connection.execute(
      `SELECT user_id FROM users WHERE user_id = ?`,
      [userId]
    );
    if (userCheck.length === 0) {
      throw new Error('Invalid user ID');
    }

    // Check if transfer request exists and is not deleted
    const [existing] = await connection.execute(
      `SELECT transfer_id, request_status FROM transfer_requests WHERE transfer_id = ? AND request_status != 'Deleted'`,
      [transferId]
    );
    if (existing.length === 0) {
      throw new Error('Transfer request not found or has been deleted');
    }

    // Update transfer request
    const [result] = await connection.execute(
      `UPDATE transfer_requests 
       SET request_status = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP
       WHERE transfer_id = ? AND request_status != 'Deleted'`,
      [requestStatus, userId, transferId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to update transfer request');
    }

    // Log activity (ensure logActivity is defined and handles errors gracefully)
    try {
      await logActivity(userId, `Updated transfer request ID ${transferId} to status ${requestStatus}`);
    } catch (logError) {
      console.error('Log Activity Error:', logError);
      // Optionally, decide whether to throw or continue based on your requirements
    }

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};



module.exports = updateTransferRequestModel;

const deleteTransferRequestModel = async (transferId, userId) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      `SELECT transfer_id FROM transfer_requests WHERE transfer_id = ? AND request_status != 'Deleted'`,
      [parseInt(transferId)]
    );
    if (existing.length === 0) {
      throw new Error('Transfer request not found or has been deleted');
    }

    const [result] = await connection.execute(
      `UPDATE transfer_requests SET request_status = 'Deleted' WHERE transfer_id = ?`,
      [parseInt(transferId)]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to delete transfer request');
    }

    await logActivity(userId, `Soft deleted transfer request ID ${transferId}`);

    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  createTransferRequestModel,
  getAllTransferRequestsModel,
  getTransferRequestByIdModel,
  updateTransferRequestModel,
  deleteTransferRequestModel
};