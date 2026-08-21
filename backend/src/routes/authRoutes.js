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
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/users", protect, adminOnly, getUsers);
router.post("/admins", protect, adminOnly, createAdmin);

module.exports = router;
