  require("dotenv").config();

  const express = require("express");
  const db = require("./src/config/db");
  const authRoutes = require("./src/routes/authRoutes");
  const studentRoutes = require("./src/routes/student.routes");
  const userManagementRoutes = require("./src/routes/userManagement.route")
  const backupRoutes = require("./src/routes/backup.routes");
  const HomePage = require("./src/routes/homepage");
  const app = express();

  app.use(express.json());

  app.use("/esf10", HomePage);
  app.use("/esf10", authRoutes);
  app.use('/esf10/students', studentRoutes );
  app.use("/esf10/users", userManagementRoutes);
 app.use("/esf10/backups", backupRoutes);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    })
    
  })

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port  http://localhost:${PORT}/esf10`);
  });
