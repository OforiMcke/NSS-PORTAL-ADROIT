const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  createSubCategory,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getCategories);
router.post("/", protect, adminOnly, createCategory);
router.post("/:categoryId/subcategories", protect, adminOnly, createSubCategory);

module.exports = router;
