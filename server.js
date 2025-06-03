require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const studentRoutes = require("./src/routes/student.routes");
const userManagementRoutes = require("./src/routes/userManagement.route");
const backupRoutes = require("./src/routes/backup.routes");
const homePage = require("./src/routes/homepage");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // allow all origins or configure as needed
app.use(express.json());

// Routes
app.use("/esf10", homePage);
app.use("/esf10", authRoutes);
app.use("/esf10/students", studentRoutes);
app.use("/esf10/users", userManagementRoutes);
app.use("/esf10/backups", backupRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/esf10`);
});