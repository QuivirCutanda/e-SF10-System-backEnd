const express = require('express');
const router = express.Router();
const { registerAdmin, registerUser, loginUser } = require('../controllers/authController'); 

router.post('/register-admin', registerAdmin); 
router.post('/register-user', registerUser);
router.post('/login', loginUser); 

module.exports = router;