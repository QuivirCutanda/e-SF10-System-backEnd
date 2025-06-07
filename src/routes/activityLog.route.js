const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { validatePagination } = require('../middleware/paginationValidation');
const { viewActivityLogs } = require('../controllers/activityLog/viewActivityLogs.controller');

router.get('/', authenticate, authorizePermission('view_logs'), validatePagination, viewActivityLogs);

module.exports = router;