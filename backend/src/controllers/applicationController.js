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
  await connectDB();

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
  await connectDB();

  const { fullName, email, phoneNumber, jobId, jobRole } = req.body;

  if (!fullName || !email || !phoneNumber) {
    res.status(400);
    throw new Error("All form fields are required");
  }

  if (!jobId) {
    res.status(400);
    throw new Error("A job must be selected to apply");
  }

  if (!jobRole) {
    res.status(400);
    throw new Error("A job role must be selected to apply");
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

  let additionalDocsUpload = [];
  if (req.files?.additionalDocs?.length > 0) {
    additionalDocsUpload = await Promise.all(
      req.files.additionalDocs.map((file) =>
        uploadToCloudinary(file.path, "adroit360/additional-docs"),
      ),
    );
  }
  const application = await Application.create({
    applicant: req.user?._id,
    job: job._id,
    jobTitle,
    jobRole,
    fullName,
    email,
    phoneNumber,
    cvUrl: cvUpload.url,
    cvPublicId: cvUpload.publicId,
    additionalDocs: additionalDocsUpload.map((doc) => ({
      url: doc.url,
      publicId: doc.publicId,
    })),
    status: "pending",
    emailsSent: {
      applicationReceived: false,
      newApplicationAdmin: false,
      acceptance: false,
      rejection: false,
    },
  });

  try {
    await sendApplicationReceivedEmail(application);
    application.emailsSent.applicationReceived = true;
  } catch (err) {
    console.error("Applicant confirmation email failed:", err.message);
  }

  try {
    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins.map((a) => a.email).filter(Boolean);
    await sendNewApplicationAdminEmail(application, adminEmails);
    application.emailsSent.newApplicationAdmin = true;
  } catch (err) {
    console.error("Admin notification email failed:", err.message);
  }

  await application.save();

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

  if (!application.emailsSent) {
    application.emailsSent = {
      applicationReceived: false,
      newApplicationAdmin: false,
      acceptance: false,
      rejection: false,
    };
  }

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

  if (!application.emailsSent) {
    application.emailsSent = {
      applicationReceived: false,
      newApplicationAdmin: false,
      acceptance: false,
      rejection: false,
    };
  }

  try {
    await application.save();
  } catch (err) {
    console.error("Failed to save declined application:", err.message);
    res.status(400);
    throw new Error(`Could not decline: ${err.message}`);
  }

  if (!application.emailsSent.rejection) {
    try {
      await sendRejectionEmail(application);
      application.emailsSent.rejection = true;
      await application.save({ validateModifiedOnly: true });
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
  const hiredApplications = await Application.countDocuments({
    status: "hired",
  });
  const openJobsCount = await Job.countDocuments({ status: "open" });
  const totalApplicants = await Application.distinct("applicant").then(
    (d) => d.filter(Boolean).length,
  );

  res.json({
    success: true,
    data: {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      declinedApplications,
      hiredApplications,
      openJobsCount,
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

// @desc    Upcoming interviews for the admin dashboard widget
// @route   GET /api/applications/admin/upcoming-interviews
// @access  Private/Admin
const getUpcomingInterviews = asyncHandler(async (req, res) => {
  await connectDB();

  const applications = await Application.find({
    status: "accepted",
    interviewDate: { $gte: new Date() },
  })
    .populate("job", "title employmentType")
    .sort("interviewDate")
    .limit(5);

  res.json({ success: true, count: applications.length, data: applications });
});

// @desc    Schedule (or reschedule) an interview for an accepted application
// @route   PUT /api/applications/:id/interview
// @access  Private/Admin
const scheduleInterview = asyncHandler(async (req, res) => {
  await connectDB();

  const { interviewDate } = req.body;

  if (!interviewDate) {
    res.status(400);
    throw new Error("An interview date is required");
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.status !== "accepted") {
    res.status(400);
    throw new Error(
      "Only accepted applications can have an interview scheduled",
    );
  }

  application.interviewDate = new Date(interviewDate);
  await application.save();

  res.json({
    success: true,
    message: "Interview scheduled successfully",
    data: application,
  });
});

// @desc    List accepted applications for interview scheduling
// @route   GET /api/applications/admin/interviews
const getInterviewSchedule = asyncHandler(async (req, res) => {
  await connectDB();

  const applications = await Application.find({ status: "accepted" })
    .populate("job", "title employmentType")
    .sort("interviewDate");

  res.json({ success: true, count: applications.length, data: applications });
});

// @route   GET /api/applications/admin/hiring-trend?months=6
const getHiringTrend = asyncHandler(async (req, res) => {
  await connectDB();

  // Parse time window constraint safely from client request
  const rangeLimit = parseInt(req.query.months, 10) || 10;
  const loopIndexStart = rangeLimit - 1;

  const now = new Date();
  const months = [];

  // Dynamically compute requested chronological windows
  for (let i = loopIndexStart; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const rangeStart = new Date(months[0].year, months[0].month, 1);

  const hires = await Application.aggregate([
    {
      $match: {
        status: "hired",
        hiredDate: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: { year: { $year: "$hiredDate" }, month: { $month: "$hiredDate" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const data = months.map(({ year, month }) => {
    const match = hires.find(
      (h) => h._id.year === year && h._id.month === month + 1,
    );

    return {
      label: new Date(year, month, 1).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      value: match ? match.count : 0,
    };
  });

  res.json({ success: true, data });
});

// @route   PUT /api/applications/:id/hire
const markAsHired = asyncHandler(async (req, res) => {
  await connectDB();

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.status !== "accepted") {
    res.status(400);
    throw new Error(
      "Only accepted candidates who have interviewed can be marked as hired",
    );
  }

  application.status = "hired";
  application.hiredDate = new Date();
  await application.save();

  res.json({
    success: true,
    message: "Candidate marked as hired",
    data: application,
  });
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
  getUpcomingInterviews,
  scheduleInterview,
  getInterviewSchedule,
  getHiringTrend,
  markAsHired,
};
