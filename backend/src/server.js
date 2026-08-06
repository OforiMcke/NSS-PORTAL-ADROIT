require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
// const categoryRoutes = require("./routes/categoryRoutes");
// const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// API Route Links
app.use("/api/auth", authRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/applications", applicationRoutes);

// Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
