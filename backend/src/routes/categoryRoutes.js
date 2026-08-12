const express = require("express");
const router = express.Router();
// const {
//   getCategories,
//   createCategory,
//   createSubCategory,
// } = require("../controllers/categoryController");
// const { protect, adminOnly } = require("../middleware/authMiddleware");

// Categories/sub-categories are disabled for now — not needed yet.
// router.get("/", protect, getCategories);
// router.post("/", protect, adminOnly, createCategory);
// router.post("/:categoryId/subcategories", protect, adminOnly, createSubCategory);

module.exports = router;
