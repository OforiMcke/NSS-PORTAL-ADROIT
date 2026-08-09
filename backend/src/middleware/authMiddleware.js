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

  // Only jwt.verify's own failures (expired/malformed/bad signature) are
  // caught here. Previously the "user not found/deactivated" check lived
  // inside this same try block, so its specific message got swallowed by
  // this catch and replaced with a generic one.
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("User not found or deactivated");
  }

  req.user = user;
  next();
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
