const Job = require("../models/Job");
// const Category = require("../models/Category");
// const SubCategory = require("../models/SubCategory");
const mongoose = require("mongoose");
exports.createJob = async (req, res) => {
  try {
    const { title, description, employmentType, deadline } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const job = await Job.create({
      title,
      description,
      employmentType: employmentType || "NSS",
      deadline,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Job created successfully",
      job,
      applicationLink: `${process.env.CLIENT_URL}/apply/${job._id}`,
    });
  } catch (err) {
    console.error("Create job error:", err.message);
    return res.status(500).json({ message: "Failed to create job" });
  }
};

// @route  GET /api/jobs
// @access Admin only (list, for dashboard)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      // .populate("category", "name")
      // .populate("subCategory", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error("Get jobs error:", err.message);
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

// @route  GET /api/jobs/open/list
// @access Private (any signed-in user — applicants included)
exports.getOpenJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
      .select("title employmentType deadline")
      .sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error("Get open jobs error:", err.message);
    return res.status(500).json({ message: "Failed to fetch open jobs" });
  }
};

// @route  GET /api/jobs/:id
// @access Public
exports.getJobById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid job link" });
    }

    const job = await Job.findById(req.params.id);
    // .populate("category", "name")
    // .populate("subCategory", "name");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.status === "closed") {
      return res
        .status(410)
        .json({ message: "This job is no longer accepting applications" });
    }

    return res.status(200).json(job);
  } catch (err) {
    console.error("Get job error:", err.message);
    return res.status(500).json({ message: "Failed to fetch job" });
  }
};

// updateJob and deleteJob are unchanged

// @route  PUT /api/jobs/:id
// @access Admin only
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ message: "Job updated", job });
  } catch (err) {
    console.error("Update job error:", err.message);
    return res.status(500).json({ message: "Failed to update job" });
  }
};

// @route  DELETE /api/jobs/:id
// @access Admin only
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ message: "Job deleted" });
  } catch (err) {
    console.error("Delete job error:", err.message);
    return res.status(500).json({ message: "Failed to delete job" });
  }
};
