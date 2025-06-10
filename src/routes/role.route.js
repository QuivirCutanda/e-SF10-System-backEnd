const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorizePermission = require('../middleware/authorizePermission');
const { viewRolesAndPermissions, createRole, viewAllRolesAndPermissions, updateUserRole } = require('../controllers/role-and-permission/RolesAndPermissions.controller');

router.get('/Roles-and-Permissions', authenticate, authorizePermission('manage_permissions', 'manage_roles'), viewRolesAndPermissions);
router.get('/roles-and-permissions/all', authenticate, authorizePermission('manage_permissions', 'manage_roles'), viewAllRolesAndPermissions);
router.post('/create-role', authenticate, authorizePermission('manage_roles'), createRole);
router.post('/update-user-role', authenticate, authorizePermission('manage_roles'), updateUserRole);

module.exports = router;