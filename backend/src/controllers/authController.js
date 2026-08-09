const asyncHandler = require("../utils/asyncHandler.js");
const generateToken = require("../utils/generateToken.js");
const User = require("../models/User.js");

// @desc    Sign up (public — always creates an applicant account)
// @route   POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  // Validate the required input
  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  // Check duplicate emails
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    role: "applicant",
  });

  res.status(201).json({
    success: true,
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

// @desc    Sign in
// @route   POST /api/auth/signin
const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    _id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phoneNumber: req.user.phoneNumber,
    role: req.user.role,
    avatarUrl: req.user.avatarUrl || "",
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.email = req.body.email || user.email;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  if (req.body.password) {
    user.password = req.body.password;
  }
  const updated = await user.save();
  res.json({
    success: true,
    _id: updated._id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email,
    phoneNumber: updated.phoneNumber,
    role: updated.role,
  });
});

// @desc    Get all users
// @route   GET /api/auth/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Create an admin account (admin-only — this is the ONLY
//          way an admin role should ever be assigned)
// @route   POST /api/auth/admins
// @access  Private/Admin
const createAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    role: "admin",
  });

  res.status(201).json({
    success: true,
    _id: admin._id,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role,
  });
});

module.exports = {
  signup,
  signin,
  getProfile,
  updateProfile,
  getUsers,
  createAdmin,
};
