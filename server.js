require("dotenv").config();

const express = require("express");
const db = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const studentRoutes = require("./src/routes/student.routes");
const HomePage = require("./src/routes/homepage");
const app = express();

app.use(express.json());

app.use("/esf10", HomePage);
app.use("/esf10", authRoutes);
app.use('/esf10/students', studentRoutes );






const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port  http://localhost:${PORT}/esf10`);
});
