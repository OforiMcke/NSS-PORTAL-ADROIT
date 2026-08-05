const mongoose = require("mongoose");

const applicationSchema = mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // What they're applying for
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    // Form fields
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },
    phoneNumber: { type: String, required: [true, "Phone number is required"] },
    //Captures applicants' cover letter
    statementOfMotivation: {
      type: String,
      required: [true, "Personal statement is required"],
      maxlength: [2000, "Statement too long"],
    },

    // Uploaded files
    cvUrl: {
      type: String,
      required: [true, "CV/Resume is required"],
    },
    cvPublicId: String, // id for deletion
    photoUrl: String, // may be optional
    photoPublicId: String,

    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    adminFeedback: {
      type: String,
      default: "",
    },
    // Which admin took the accept/decline action
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewDate: Date,

    // we use this to track Emails that are sent
    emailsSent: {
      acceptance: { type: Boolean, default: false },
      rejection: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

// we use the Index to fetch status faster within a sub-category
applicationSchema.index({ subCategory: 1, status: 1, createdAt: -1 });

// speeds up a top-level category dashboard before drilling into sub-category
applicationSchema.index({ category: 1, status: 1 });

// lets an applicant fetch their own submission history quickly
applicationSchema.index({ applicant: 1 });

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
