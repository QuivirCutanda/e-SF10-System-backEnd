const express = require('express');
const router = express.Router();
const { registerAdmin, registerUser, loginUser, updateUser, deleteUser, getUserInfo, updateUserPassword, modifyUserPermission, listStudents } = require('../controllers/authController'); 
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizeRole');
const authorizePermission = require('../middleware/authorizePermission');

router.post('/register-admin',authMiddleware, authorizeRole(['admin']), registerAdmin);
router.post('/register-user', authMiddleware, authorizeRole(['admin', 'registrar']), registerUser);
router.post('/login', loginUser);
router.get('/user/:userId/info', authMiddleware, getUserInfo);
router.put('/update-user/:userId', authMiddleware, updateUser);
router.put('/user/:userId/update-password', authMiddleware, updateUserPassword);
router.delete('/delete-user/:userId', authMiddleware, authorizeRole(['admin']), deleteUser);
router.put('/user/:userId/permissions', authMiddleware, authorizePermission('manage_permissions'), modifyUserPermission);
router.get('/students', authMiddleware, authorizePermission('view_student_info', 'search_student'), listStudents);

module.exports = router;