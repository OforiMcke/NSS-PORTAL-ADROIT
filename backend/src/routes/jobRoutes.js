const express = require("express");
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getOpenJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, createJob);
router.get("/", protect, adminOnly, getAllJobs);
router.get("/open/list", protect, getOpenJobs);
router.get("/:id", getJobById);
router.delete("/:id", protect, adminOnly, deleteJob);

module.exports = router;
