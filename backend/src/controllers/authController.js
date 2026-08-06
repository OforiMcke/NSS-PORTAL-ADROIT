const asyncHandler = require("../utils/asyncHandler.js");
const generateToken = require("../utils/generateToken.js");
const User = require("../models/User.js");

// @desc    Sign up (applicant)
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
    password: password || `${email}${Date.now()}`,
  });

  res.status(201).json({
    success: true,
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    password: user.password,
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
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    _id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phoneNumber: req.user.phoneNumber,
    role: req.user.role,
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id);
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

module.exports = { signup, signin, getProfile, updateProfile, getUsers };
