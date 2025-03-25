const express = require("express");
const validateApiKey = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", validateApiKey, (req, res) => {
    res.json({ message: "Hello world? |  Hello Love?" });
});

module.exports = router;
