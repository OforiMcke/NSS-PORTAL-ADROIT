const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken.js");
const User = require("../models/User.js");
const Application = require("../models/Application.js");
const connectDB = require("../config/db.js");
const { sendPasswordResetEmail } = require("./emailController.js");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// issues both tokens, saves the refresh token's hash on the user
const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

// @desc    Sign up
// @route   POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  await connectDB();

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

  const user = await User.create({
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    role: "applicant",
  });

  try {
    await Application.updateMany(
      { applicant: { $exists: false }, email: user.email },
      { $set: { applicant: user._id } },
    );
  } catch (err) {
    console.error("Linking past applications on signup failed:", err.message);
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  res.status(201).json({
    success: true,
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    accessToken,
    refreshToken,
  });
});

// @desc    Sign in
// @route   POST /api/auth/signin
const signin = asyncHandler(async (req, res) => {
  await connectDB();

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    const { accessToken, refreshToken } = await issueTokens(user);

    res.json({
      success: true,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  await connectDB();

  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404); 
    return res.json({
      success: false,
      message:
        "No account found with this email address. Please check and try again.",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user, resetUrl);
  } catch (error) {
    console.error("Password reset email failed:", error.message);

    // Clear tokens out on email transmission crash to preserve lifecycle integrity
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Could not send reset email. Please try again.");
  }

  res.json({
    success: true,
    message: `A password reset link has been successfully sent to ${email}.`,
  });
});

// @desc    Reset password using the token from the email
// @route   PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  await connectDB();

  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error("A new password is required");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) {
    res.status(400);
    throw new Error("This reset link is invalid or has expired");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  // Also invalidate any existing session which forces a fresh sign-in
  user.refreshTokenHash = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successfully. You can now sign in.",
  });
});

// @desc    Exchange a valid refresh token for a new access token
// @route   POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  await connectDB();

  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshTokenHash");

  if (!user || !user.refreshTokenHash) {
    res.status(401);
    throw new Error("Refresh token is no longer valid");
  }

  if (user.refreshTokenHash !== hashToken(refreshToken)) {
    // this is a stolen/replayed token. Revoke to be safe.
    user.refreshTokenHash = undefined;
    await user.save();
    res.status(401);
    throw new Error("Refresh token is no longer valid");
  }

  //  issue a brand new pair, invalidating the old refresh token
  const { accessToken, refreshToken: newRefreshToken } =
    await issueTokens(user);

  res.json({
    success: true,
    accessToken,
    refreshToken: newRefreshToken,
  });
});

// @desc    Log out — revokes the stored refresh token
// @route   POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  await connectDB();

  const { refreshToken } = req.body;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, {
        $unset: { refreshTokenHash: 1 },
      });
    } catch (err) {}
  }

  res.json({ success: true, message: "Logged out" });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
  await connectDB();

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
  await connectDB();

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
  await connectDB();

  const users = await User.find({}).select("-password");
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Create an admin account
// @route   POST /api/auth/admins
const createAdmin = asyncHandler(async (req, res) => {
  await connectDB();

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
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  getProfile,
  updateProfile,
  getUsers,
  createAdmin,
};
