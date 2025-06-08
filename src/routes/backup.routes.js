const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { createBackupHandler, getBackupsHandler, restoreBackupHandler, getBackupFileHandler } = require('../controllers/backupController');

router.post('/create', authenticate, authorizePermission('manage_backups'), createBackupHandler);
router.get('/', authenticate, authorizePermission('manage_backups'), getBackupsHandler);
router.post('/restore/:backupId', authenticate, authorizePermission('manage_backups'), restoreBackupHandler);
router.get('/:filename', authenticate, authorizePermission('manage_backups'), getBackupFileHandler);

module.exports = router;