const asyncHandler = require("../utils/asyncHandler.js");
const Application = require("../models/Application.js");
const {
  sendAcceptanceEmail,
  sendRejectionEmail,
  sendApplicationReceivedEmail,
  sendNewApplicationAdminEmail,
} = require("./emailController.js");

const Job = require("../models/Job.js");
const User = require("../models/User.js");
const cloudinary = require("../config/cloudinary.js");
const fs = require("fs/promises");
const connectDB = require("../config/db.js");

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

const submitApplication = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, jobId } = req.body;

  if (!fullName || !email || !phoneNumber) {
    res.status(400);
    throw new Error("All form fields are required");
  }

  if (!jobId) {
    res.status(400);
    throw new Error("A job must be selected to apply");
  }

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  if (job.status === "closed") {
    res.status(410);
    throw new Error("This job is no longer accepting applications");
  }

  const jobTitle = job.title;

  if (!req.files?.cv) {
    res.status(400);
    throw new Error("CV/Resume upload is required");
  }

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
  let additionalDocUpload = null;
  if (req.files?.additionalDoc) {
    additionalDocUpload = await uploadToCloudinary(
      req.files.additionalDoc[0].path,
      "adroit360/additional-docs",
    );
  }
  const application = await Application.create({
    applicant: req.user?._id,
    job: job._id,
    jobTitle,
    fullName,
    email,
    phoneNumber,
    cvUrl: cvUpload.url,
    cvPublicId: cvUpload.publicId,
    additionalDocUrl: additionalDocUpload?.url,
    additionalDocPublicId: additionalDocUpload?.publicId,
    status: "pending",
  });

  sendApplicationReceivedEmail(application).catch((err) =>
    console.error("Applicant confirmation email failed:", err.message),
  );

  User.find({ role: "admin" })
    .select("email")
    .then((admins) => {
      const adminEmails = admins.map((a) => a.email).filter(Boolean);
      return sendNewApplicationAdminEmail(application, adminEmails);
    })
    .catch((err) =>
      console.error("Admin notification email failed:", err.message),
    );

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: application,
  });
});

const getAdminApplications = asyncHandler(async (req, res) => {
  await connectDB();

  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const applications = await Application.find(filter)
    .populate("applicant", "firstName lastName email")
    .populate("job", "title employmentType")
    .sort("-createdAt");

  res.json({ success: true, count: applications.length, data: applications });
});

const getApplicationDetail = asyncHandler(async (req, res) => {
  await connectDB();

  const application = await Application.findById(req.params.id)
    .populate("applicant", "firstName lastName email")
    .populate("job", "title employmentType");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  res.json({ success: true, data: application });
});

const acceptApplication = asyncHandler(async (req, res) => {
  await connectDB();

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.status === "accepted") {
    res.status(400);
    throw new Error("Application already accepted");
  }

  application.status = "accepted";
  application.reviewDate = new Date();
  application.adminFeedback = "";
  await application.save();

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

const declineApplication = asyncHandler(async (req, res) => {
  await connectDB();

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.status === "declined") {
    res.status(400);
    throw new Error("Application already declined");
  }

  application.adminFeedback = req.body.feedback || "";
  application.status = "declined";
  application.reviewDate = new Date();
  await application.save();

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
  await connectDB();

  const applications = await Application.find({ applicant: req.user._id })
    .populate("job", "title employmentType")
    .sort("-createdAt");

  res.json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

const getAdminStats = asyncHandler(async (req, res) => {
  await connectDB();

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
  await connectDB();

  const applications = await Application.find()
    .sort("-createdAt")
    .limit(5)
    .populate("applicant", "firstName lastName")
    .populate("job", "title employmentType");

  res.json({ success: true, count: applications.length, data: applications });
});

module.exports = {
  submitApplication,
  getAdminApplications,
  getApplicationDetail,
  acceptApplication,
  declineApplication,
  getMyApplications,
  getAdminStats,
  getRecentApplications,
};
