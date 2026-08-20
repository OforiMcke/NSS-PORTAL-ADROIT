const asyncHandler = require("../utils/asyncHandler.js");
const JobRole = require("../models/jobRole.js");

// @desc  Create a new job role
// @route POST /api/job-roles
const createJobRole = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Role name is required");
  }

  const existing = await JobRole.findOne({ name: name.trim() });
  if (existing) {
    res.status(409);
    throw new Error("This role already exists");
  }

  const jobRole = await JobRole.create({
    name: name.trim(),
    createdBy: req.user?._id,
  });

  res.status(201).json(jobRole);
});

// @desc  Get all job roles
// @route GET /api/job-roles
const getJobRoles = asyncHandler(async (req, res) => {
  const roles = await JobRole.find().sort({ name: 1 });
  res.status(200).json(roles);
});

// @desc  Delete a job role
// @route DELETE /api/job-roles/:id
const deleteJobRole = asyncHandler(async (req, res) => {
  const role = await JobRole.findByIdAndDelete(req.params.id);

  if (!role) {
    res.status(404);
    throw new Error("Job role not found");
  }

  res.status(200).json({ message: "Job role deleted" });
});

module.exports = { createJobRole, getJobRoles, deleteJobRole };
