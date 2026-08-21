const mongoose = require("mongoose");

const applicationSchema = mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    jobTitle: {
      type: String,
      required: true,
    },

    fullName: {
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

    // Uploaded files
    cvUrl: {
      type: String,
      required: [true, "CV/Resume is required"],
    },
    cvPublicId: String,
    photoUrl: String,
    photoPublicId: String,
    additionalDocs: [
      {
        url: String,
        publicId: String,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    adminFeedback: {
      type: String,
      default: "",
    },
    interviewDate: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewDate: Date,

    // we use this to track Emails that are sent
    emailsSent: {
      applicationReceived: { type: Boolean, default: false },
      newApplicationAdmin: { type: Boolean, default: false },
      acceptance: { type: Boolean, default: false },
      rejection: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

// lets an applicant fetch their own submission history quickly
applicationSchema.index({ applicant: 1 });

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
