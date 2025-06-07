const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');

router.get('/', authMiddleware, authorizePermission('view_reports'), getDashboardData);

module.exports = router;