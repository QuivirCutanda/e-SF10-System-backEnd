const express = require('express');
const router = express.Router();
const { registerAdmin, registerUser, loginUser, updateUser, deleteUser, getUserInfo, updateUserPassword } = require('../controllers/authController'); 
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizeRole');

router.post('/register-admin', authMiddleware, registerAdmin); 
router.post('/register-user', authMiddleware, authorizeRole(['admin', 'registrar']), registerUser);
router.post('/login', loginUser); 
router.get('/user/:userId/info', authMiddleware, getUserInfo);
router.put('/update-user/:userId', authMiddleware, updateUser);
router.put('/user/:userId/update-password', authMiddleware, updateUserPassword);
router.delete('/delete-user/:userId', authMiddleware, authorizeRole(['admin']), deleteUser);

module.exports = router;