const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/User.js");

// we verify token and loads user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_password");

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("User not found or deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// We must used them after verification
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. Admins only.");
  }
};

module.exports = { protect, adminOnly };
