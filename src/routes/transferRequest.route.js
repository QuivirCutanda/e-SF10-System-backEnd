const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { validateTransferRequest, validateTransferId, validateTransferUpdate } = require('../middleware/transferRequestValidation');
const { validatePagination } = require('../middleware/paginationValidation');
const { createTransferRequest, getAllTransferRequests, getTransferRequestById, updateTransferRequest, deleteTransferRequest } = require('../controllers/transferRequest/transferRequest.controller');

router.post(
  '/create-request',
  authenticate,
  authorizePermission('request_transfers'),
  validateTransferRequest,
  createTransferRequest
);

router.get(
  '/view-all-requests',
  authenticate,
  authorizePermission('approve_transfers', 'view_reports'),
  validatePagination,
  getAllTransferRequests
);

router.get(
  '/view-request/:id',
  authenticate,
  authorizePermission('approve_transfers', 'view_reports'),
  validateTransferId,
  getTransferRequestById
);

router.put(
  '/update-request/:id',
  authenticate,
  authorizePermission('approve_transfers'),
  validateTransferId,
  validateTransferUpdate,
  updateTransferRequest
);

router.delete(
  '/delete/:id',
  authenticate,
  authorizePermission('manage_users'),
  validateTransferId,
  deleteTransferRequest
);

module.exports = router;