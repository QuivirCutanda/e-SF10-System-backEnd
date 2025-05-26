const express = require('express');
const router = express.Router();
const {checkPermission} = require('../middleware/roleBaseAccessControl');
const authenticate  = require('../middleware/authMiddleware');

const {createBackupHandler, getBackupsHandller} = require('../controllers/backupController');

router.post('/create', authenticate, checkPermission('manage_backups'),createBackupHandler );
router.get('/', authenticate, checkPermission('manage_backups'), getBackupsHandller);

module.exports = router;