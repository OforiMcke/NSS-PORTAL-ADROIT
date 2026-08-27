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
    jobRole: {
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
      trim: true,
      lowercase: true,
      // unique: true,
      required: [true, "Email address is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },

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
      enum: ["pending", "accepted", "declined", "hired"],
      default: "pending",
    },
    adminFeedback: {
      type: String,
      default: "",
    },
    interviewDate: Date,
    hiredDate: Date,
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
applicationSchema.index({ job: 1, status: 1, createdAt: -1 });
applicationSchema.index({ email: 1, job: 1 }, { unique: true });
const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
