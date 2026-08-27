const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  refresh,
  logout,
  getProfile,
  updateProfile,
  getUsers,
  createAdmin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/users", protect, adminOnly, getUsers);
router.post("/admins", protect, adminOnly, createAdmin);

module.exports = router;
