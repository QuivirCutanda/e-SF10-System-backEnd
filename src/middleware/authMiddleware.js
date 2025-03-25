const { API_KEY } = require("../config/env");

const validateApiKey = (req, res, next) => {
    const userApiKey = req.header("x-api-key");

    if (!userApiKey || userApiKey !== API_KEY) {
        return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
    }

    next();
};

module.exports = validateApiKey;
