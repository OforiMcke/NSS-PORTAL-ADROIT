const asyncHandler = require("../utils/asyncHandler.js");
const generateToken = require("../utils/generateToken.js");
const User = require("../models/User.js");

// @desc    Sign up (applicant)
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  // Validate the required input
  if (!fullName || !email || !phoneNumber) {
    res.status(400);
    throw new Error("Full name, email, and phone number are required");
  }

  // Check duplicate emails
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    password: password || `${email}${Date.now()}`,
  });

  res.status(201).json({
    success: true,
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

// @desc    Sign in
// @route   POST /api/auth/signin
// @access  Public
const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
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
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phoneNumber: req.user.phoneNumber,
    role: req.user.role,
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.fullName = req.body.fullName || user.fullName;
  user.email = req.body.email || user.email;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

  if (req.body.password) {
    user.password = req.body.password;
  }
  const updated = await user.save();
  res.json({
    success: true,
    _id: updated._id,
    fullName: updated.fullName,
    email: updated.email,
    phoneNumber: updated.phoneNumber,
    role: updated.role,
  });
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json({ success: true, count: users.length, data: users });
});

module.exports = { signup, signin, getProfile, updateProfile, getUsers };
