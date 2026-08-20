const express = require("express");
const {
  createJobRole,
  getJobRoles,
  deleteJobRole,
} = require("../controllers/jobRoleController.js");
const { protect, adminOnly } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/", getJobRoles);
router.post("/", protect, adminOnly, createJobRole);
router.delete("/:id", protect, adminOnly, deleteJobRole);

module.exports = router;
