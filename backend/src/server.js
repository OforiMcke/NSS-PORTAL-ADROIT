require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobRoleRoute = require("./routes/jobRoleRoute.js");
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// API Route Links
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/job-roles", jobRoleRoute);

//Error Handlers
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});

module.exports = app;
