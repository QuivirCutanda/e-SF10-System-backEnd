const { body, param } = require('express-validator');

console.log('Loaded transferRequestValidation.js at', new Date().toISOString()); // Debug file load

const validateTransferRequest = [
  body('student_id').isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
  body('requesting_school')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Requesting school is required')
    .isLength({ max: 255 })
    .withMessage('Requesting school name must not exceed 255 characters')
    .matches(/^[a-zA-Z0-9\s\-\.,&()']+$/)
    .withMessage('Requesting school name contains invalid characters')
];

const validateTransferId = [
  param('id').isInt({ min: 1 }).withMessage('Transfer ID must be a positive integer')
];

const validateTransferUpdate = [
  body('request_status')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Request status is required')
    .custom((value, { req }) => {
      console.log('PUT request body:', JSON.stringify(req.body)); // Log entire body
      console.log('Received request_status:', value); // Log request_status
      // Normalize input to title case (e.g., 'pending' -> 'Pending')
      const normalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      console.log('Normalized request_status:', normalizedValue); // Log normalized value
      const validStatuses = ['Pending', 'Approved', 'Rejected'];
      if (!validStatuses.includes(normalizedValue)) {
        throw new Error(`Invalid request_status: ${value}. Must be one of ${validStatuses.join(', ')}`);
      }
      // Update the request body with the normalized value
      req.body.request_status = normalizedValue;
      return true;
    })
    .withMessage('Request status must be Pending, Approved, or Rejected')
];

module.exports = { validateTransferRequest, validateTransferId, validateTransferUpdate };