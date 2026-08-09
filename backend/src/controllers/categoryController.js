const asyncHandler = require("../utils/asyncHandler.js");
const Category = require("../models/Category.js");
const SubCategory = require("../models/SubCategory.js");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate({
      path: "subCategories",
      match: { isActive: true },
    })
    .sort("createdAt");

  // Mongoose's populate `match` doesn't remove non-matching refs from the
  // array — it replaces them with null. Strip those out so the frontend
  // dropdown never has to deal with null entries.
  const cleaned = categories.map((cat) => {
    const obj = cat.toObject();
    obj.subCategories = obj.subCategories.filter(Boolean);
    return obj;
  });

  res.json({ success: true, count: cleaned.length, data: cleaned });
});

// @desc    Create category (admin)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const category = await Category.create({ name, slug, description });
  res.status(201).json({ success: true, data: category });
});

// @desc    Create sub-category under a category
// @route   POST /api/categories/:categoryId/subcategories
// @access  Private/Admin
const createSubCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (!name) {
    res.status(400);
    throw new Error("Sub-category name is required");
  }

  const subCategory = await SubCategory.create({
    name,
    category: category._id,
  });

  // this add a subcategory to the parent category's array
  category.subCategories.push(subCategory._id);
  await category.save();

  res.status(201).json({ success: true, data: subCategory });
});

module.exports = { getCategories, createCategory, createSubCategory };
