const asyncHandler = require("../utils/asyncHandler.js");
const Application = require("../models/Application.js");
const {
  sendAcceptanceEmail,
  sendRejectionEmail,
} = require("./emailController.js");
const Category = require("../models/Category.js");
const SubCategory = require("../models/SubCategory.js");
const cloudinary = require("../config/cloudinary.js");
const fs = require("fs/promises");

// upload — now throws instead of swallowing failures, so callers can't
// mistake a failed upload for a successful one with an empty url.
// Also removes the local temp file multer wrote to disk regardless of
// whether the Cloudinary upload succeeds or fails, so files don't pile
// up in the uploads/ folder forever.
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    throw new Error("File upload failed, please try again");
  } finally {
    fs.unlink(filePath).catch((err) =>
      console.error("Temp file cleanup failed:", err.message),
    );
  }
};

// @desc    Submit a new application
// @route   POST /api/applications
// @access  Private (applicant)

const submitApplication = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    statementOfMotivation,
    categoryId,
    subCategoryId,
  } = req.body;

  // Validate required text fields — categoryId/subCategoryId included so
  // we never hit Mongoose's findById with undefined (which throws a
  // CastError and surfaces as an ugly 500 instead of a clean 400)
  if (
    !fullName ||
    !email ||
    !phoneNumber ||
    !statementOfMotivation ||
    !categoryId ||
    !subCategoryId
  ) {
    res.status(400);
    throw new Error("All form fields are required");
  }

  // Verify if category & sub-category exist
  const category = await Category.findById(categoryId);
  const subCategory = await SubCategory.findById(subCategoryId);
  if (!category || !subCategory) {
    res.status(404);
    throw new Error("Category or sub-category not found");
  }

  // CV file is required
  if (!req.files?.cv) {
    res.status(400);
    throw new Error("CV/Resume upload is required");
  }

  // Upload files to Cloudinary. uploadToCloudinary now throws on failure,
  // so a broken CV upload stops the request here instead of silently
  // saving an application with an empty cvUrl.
  const cvUpload = await uploadToCloudinary(
    req.files.cv[0].path,
    "adroit360/cvs",
  );
  let photoUpload = null;
  if (req.files?.photo) {
    photoUpload = await uploadToCloudinary(
      req.files.photo[0].path,
      "adroit360/photos",
    );
  }

  // Create application
  const application = await Application.create({
    applicant: req.user._id,
    category: categoryId,
    subCategory: subCategoryId,
    fullName,
    email,
    phoneNumber,
    statementOfMotivation,
    cvUrl: cvUpload.url,
    cvPublicId: cvUpload.publicId,
    photoUrl: photoUpload?.url,
    photoPublicId: photoUpload?.publicId,
    status: "pending",
  });

  // Push into sub-category's pending applications list
  subCategory.applications.push(application._id);
  await subCategory.save();

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: application,
  });
});

// @desc    Get applicants for a sub-category (list view for admin)
// @route   GET /api/applications/subcategory/:subCategoryId?status=pending
// @access  Private/Admin
const getApplicationsBySubCategory = asyncHandler(async (req, res) => {
  const { subCategoryId } = req.params;
  const { status } = req.query; // optional: pending | accepted | declined

  const filter = { subCategory: subCategoryId };
  if (status) filter.status = status;

  const applications = await Application.find(filter)
    .select("fullName email phoneNumber status createdAt cvUrl photoUrl")
    .sort("-createdAt");

  res.json({ success: true, count: applications.length, data: applications });
});

// @desc    Get all applications for admin dashboard/list views
// @route   GET /api/applications/admin/list
// @access  Private/Admin
const getAdminApplications = asyncHandler(async (req, res) => {
  const { status, categoryId, subCategoryId } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (categoryId) filter.category = categoryId;
  if (subCategoryId) filter.subCategory = subCategoryId;

  const applications = await Application.find(filter)
    .populate("applicant", "firstName lastName email avatarUrl")
    .populate("category", "name slug")
    .populate("subCategory", "name")
    .sort("-createdAt");

  res.json({ success: true, count: applications.length, data: applications });
});

// @desc    Get a single application detail
// @route   GET /api/applications/:id
// @access  Private/Admin
const getApplicationDetail = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("category", "name")
    .populate("subCategory", "name");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  res.json({ success: true, data: application });
});

// @desc    Accept an application
// @route   PUT /api/applications/:id/accept
// @access  Private/Admin
const acceptApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.status === "accepted") {
    res.status(400);
    throw new Error("Application already accepted");
  }

  // Update status
  application.status = "accepted";
  application.reviewDate = new Date();
  application.adminFeedback = "";
  await application.save();

  // Move into sub-category's accepted applications list
  await SubCategory.findByIdAndUpdate(application.subCategory, {
    $addToSet: { acceptedApplications: application._id },
    $pull: { applications: application._id },
  });

  // Send acceptance email (once)
  if (!application.emailsSent.acceptance) {
    try {
      await sendAcceptanceEmail(application);
      application.emailsSent.acceptance = true;
      await application.save();
    } catch (error) {
      console.error("Acceptance email failed:", error.message);
    }
  }

  res.json({
    success: true,
    message: "Application accepted. Confirmation email sent.",
    data: application,
  });
});

// @desc    Decline an application (with optional feedback)
// @route   PUT /api/applications/:id/decline
// @access  Private/Admin
const declineApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.status === "declined") {
    res.status(400);
    throw new Error("Application already declined");
  }

  // Capture feedback/notes from the decline modal
  application.adminFeedback = req.body.feedback || "";
  application.status = "declined";
  application.reviewDate = new Date();
  await application.save();

  // Remove from sub-category's active applications list
  await SubCategory.findByIdAndUpdate(application.subCategory, {
    $pull: {
      applications: application._id,
      acceptedApplications: application._id,
    },
  });

  // Send rejection email (with feedback, once)
  if (!application.emailsSent.rejection) {
    try {
      await sendRejectionEmail(application);
      application.emailsSent.rejection = true;
      await application.save();
    } catch (error) {
      console.error("Rejection email failed:", error.message);
    }
  }

  res.json({
    success: true,
    message: "Application declined. Rejection email sent.",
    data: application,
  });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("category", "name")
    .populate("subCategory", "name")
    .sort("-createdAt");

  res.json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

const getAdminStats = asyncHandler(async (req, res) => {
  const totalApplications = await Application.countDocuments();
  const pendingApplications = await Application.countDocuments({
    status: "pending",
  });
  const acceptedApplications = await Application.countDocuments({
    status: "accepted",
  });
  const declinedApplications = await Application.countDocuments({
    status: "declined",
  });
  const totalApplicants = await Application.distinct("applicant").then(
    (distinct) => distinct.length,
  );

  res.json({
    success: true,
    data: {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      declinedApplications,
      totalApplicants,
    },
  });
});

const getRecentApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .sort("-createdAt")
    .limit(5)
    .populate("applicant", "firstName lastName")
    .populate("category", "name")
    .populate("subCategory", "name");

  res.json({ success: true, count: applications.length, data: applications });
});

module.exports = {
  submitApplication,
  getApplicationsBySubCategory,
  getAdminApplications,
  getApplicationDetail,
  acceptApplication,
  declineApplication,
  getMyApplications,
  getAdminStats,
  getRecentApplications,
};
