require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

// 1. Import your custom error middlewares (explained earlier)
const { notFound, errorHandler } = require("./middleware/errorMiddleware"); // Adjust path

// 2. Import your route routers
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
// Note: Email controllers are usually triggered internally inside application actions,
// but if you have dedicated email routes, import them here as well.

const app = express();

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// API Route Links
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/applications", applicationRoutes);

// Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
