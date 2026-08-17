const Job = require("../models/Job");
const mongoose = require("mongoose");
const connectDB = require("../config/db.js");
exports.createJob = async (req, res) => {
  await connectDB();
  try {
    const { title, description, employmentType, deadline, roles } = req.body;

    if (!title || !description || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        message: "Title, description, and at least one job role are required",
      });
    }

    const job = await Job.create({
      title,
      description,
      employmentType: employmentType || "NSS",
      deadline,
      roles: roles.map((r) => r.trim()).filter(Boolean),
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
exports.getAllJobs = async (req, res) => {
  await connectDB();

  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    console.error("Get jobs error:", err.message);
    return res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

// @route  GET /api/jobs/open/list
// @access Private
exports.getOpenJobs = async (req, res) => {
  await connectDB();

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
  await connectDB();

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid job link" });
    }

    const job = await Job.findById(req.params.id);
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

// @route  PUT /api/jobs/:id
// @access Admin only
exports.updateJob = async (req, res) => {
  await connectDB();

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
  await connectDB();

  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ message: "Job deleted" });
  } catch (err) {
    console.error("Delete job error:", err.message);
    return res.status(500).json({ message: "Failed to delete job" });
  }
};
