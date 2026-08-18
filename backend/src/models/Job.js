const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },

    roles: {
      type: [String],
      required: [true, "At least one job role is required"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one job role is required",
      },
    },
    employmentType: {
      type: String,
      enum: [
        // "Full-time",
        // "Internship",
        "NSS",
      ],
      required: true,
      default: "NSS",
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
