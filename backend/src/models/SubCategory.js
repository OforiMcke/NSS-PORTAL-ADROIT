const mongoose = require("mongoose");

const subCategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sub-category name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    acceptedApplications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

subCategorySchema.index({ category: 1, isActive: 1 });

const SubCategory = mongoose.model("SubCategory", subCategorySchema);
module.exports = SubCategory;
