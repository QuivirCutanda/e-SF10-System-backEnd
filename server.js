require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path"); // Added for static file serving
const db = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const studentRoutes = require("./src/routes/student.routes");
const userManagementRoutes = require("./src/routes/userManagement.route");
const backupRoutes = require("./src/routes/backup.routes");
const schoolDefualt = require("./src/routes/schoolDefault.routes");
const dashboard = require("./src/routes/dashboard.routes");
const homePage = require("./src/routes/homepage");
const activityLog = require("./src/routes/activityLog.route");
const roleAndPermission = require("./src/routes/role.route");
const transferRequest = require("./src/routes/transferRequest.route");
const generateExcel = require("./src/routes/excel.route");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for SF10 documents
app.use("/esf10/images", express.static(path.join(__dirname, "data/documents/sf10")));
app.use('/school_logos', express.static(path.join(__dirname, 'data/school_logos')));

// Routes
app.use("/esf10", homePage);
app.use("/esf10", authRoutes);
app.use("/esf10/students", studentRoutes);
app.use("/esf10/users", userManagementRoutes);
app.use("/esf10/backups", backupRoutes);
app.use("/esf10/school-defaults", schoolDefualt);
app.use("/esf10/dashboard", dashboard);
app.use("/esf10/activity-log", activityLog);
app.use("/esf10/roles/", roleAndPermission);
app.use("/esf10/transfer-request/", transferRequest);
app.use("/esf10/", generateExcel);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/esf10`);
});