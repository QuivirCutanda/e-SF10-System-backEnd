const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { validateTransferRequest, validateTransferId, validateTransferUpdate } = require('../middleware/transferRequestValidation');
const { validatePagination } = require('../middleware/paginationValidation');
const { check, validationResult } = require('express-validator');
const { createTransferRequest, getAllTransferRequests, getTransferRequestById, updateTransferRequest, deleteTransferRequest, searchSchoolNames } = require('../controllers/transferRequest/transferRequest.controller');

// // Validation middleware for search query
// const validateSchoolSearch = [
//   check('query')
//     .optional()
//     .isString()
//     .trim()
//     .isLength({ min: 1, max: 255 })
//     .withMessage('Search query must be a string between 1 and 255 characters'),
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }
//     next();
//   }
// ];

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

router.get(
  '/search-schools',
  authenticate,
  authorizePermission('request_transfers', 'approve_transfers'),
  searchSchoolNames
);

module.exports = router;