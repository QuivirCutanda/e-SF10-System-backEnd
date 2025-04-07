const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Server Started, Please Read the API-Documentation 📘'
  });
});

module.exports = router;
  