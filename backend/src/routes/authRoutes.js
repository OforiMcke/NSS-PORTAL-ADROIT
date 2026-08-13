const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  getProfile,
  updateProfile,
  getUsers,
  createAdmin,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/users", protect, adminOnly, getUsers);
router.post("/admins", protect, adminOnly, createAdmin);

module.exports = router;
