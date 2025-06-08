  const db = require('../../config/db');
  const { createTransferRequestModel, getAllTransferRequestsModel, getTransferRequestByIdModel, updateTransferRequestModel, deleteTransferRequestModel } = require('../../models/transferRequest/transferRequest.model');
  const { validationResult } = require('express-validator');

  exports.createTransferRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { student_id, requesting_school } = req.body;
    const userId = req.user?.user_id;
    let connection;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User ID not found in request'
      });
    }

    try {
      connection = await db.getConnection();

      // Verify student exists
      const [studentRows] = await connection.execute(
        'SELECT student_id FROM students WHERE student_id = ?',
        [student_id]
      );
      if (studentRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Student not found',
          details: `No student found with ID ${student_id}`
        });
      }

      const result = await createTransferRequestModel(student_id, requesting_school, userId);

      return res.status(201).json({
        success: true,
        message: 'Transfer request created successfully',
        transferId: result.insertId
      });
    } catch (error) {
      console.error('Create Transfer Request Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error during transfer request creation',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        timestamp: new Date().toISOString()
      });
    } finally {
      if (connection) await connection.release();
    }
  };

  exports.getAllTransferRequests = async (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page) > 0 ? parseInt(page) : 1;
    limit = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const offset = (page - 1) * limit;
    let connection;

    try {
      connection = await db.getConnection();
      const { requests, total } = await getAllTransferRequestsModel(limit, offset);

      return res.status(200).json({
        success: true,
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get All Transfer Requests Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving transfer requests',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        timestamp: new Date().toISOString()
      });
    } finally {
      if (connection) await connection.release();
    }
  };

  exports.getTransferRequestById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const transferId = parseInt(id);
    let connection;

    try {
      connection = await db.getConnection();
      const request = await getTransferRequestByIdModel(transferId);

      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Transfer request not found',
          details: `No transfer request found with ID ${transferId}`
        });
      }

      return res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      console.error('Get Transfer Request By ID Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error retrieving transfer request',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        timestamp: new Date().toISOString()
      });
    } finally {
      if (connection) await connection.release();
    }
  };


exports.updateTransferRequest = async (req, res) => {
  // Validate request input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const transferId = parseInt(id, 10);
  const { request_status } = req.body;
  const userId = req.user?.user_id;

  // Debug log
  console.log('Update Transfer Request - Params:', { transferId, request_status, userId });

  // Validate inputs
  if (isNaN(transferId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid transfer ID',
      transferId,
    });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: User ID not found in request',
    });
  }

  // Validate request_status against ENUM values
  const validStatuses = ['Pending', 'Approved', 'Rejected', 'Deleted'];
  if (!request_status || !validStatuses.includes(request_status)) {
    return res.status(400).json({
      success: false,
      error: `Request status must be one of: ${validStatuses.join(', ')}`,
      transferId,
    });
  }

  try {
    const result = await updateTransferRequestModel(transferId, request_status, userId);
    return res.status(200).json({
      success: true,
      message: `Transfer request updated to ${request_status} successfully`,
      transferId,
    });
  } catch (error) {
    console.error('Update Transfer Request Error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    const errorMessage = error.message.includes('not found')
      ? 'Transfer request not found or has been deleted'
      : 'Server error updating transfer request';
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      transferId,
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
      timestamp: new Date().toISOString(),
    });
  }
};

  exports.deleteTransferRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const transferId = parseInt(id);
    const userId = req.user?.user_id;
    let connection;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User ID not found in request'
      });
    }

    try {
      connection = await db.getConnection();
      const result = await deleteTransferRequestModel(transferId, userId);
      return res.status(200).json({
        success: true,
        message: 'Transfer request deleted successfully',
        transferId
      });
    } catch (error) {
      console.error('Delete Transfer Request Error:', error);
      return res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message.includes('not found') ? 'Transfer request not found' : 'Server error deleting transfer request',
        transferId,
        details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later',
        timestamp: new Date().toISOString()
      });
    } finally {
      if (connection) await connection.release();
    }
  };