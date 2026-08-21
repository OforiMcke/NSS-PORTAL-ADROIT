const express = require("express");
const router = express.Router();
const {
  submitApplication,
  getApplicationsBySubCategory,
  getAdminApplications,
  getApplicationDetail,
  acceptApplication,
  declineApplication,
  getMyApplications,
  getAdminStats,
  getRecentApplications,
} = require("../controllers/applicationController");
const {
  protect,
  optionalAuth,
  adminOnly,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/",
  // protect,
  optionalAuth,
  upload.handleUploadErrors(
    upload.fields([
      { name: "cv", maxCount: 1 },
      { name: "photo", maxCount: 1 },
      { name: "additionalDocs", maxCount: 5 },
    ]),
  ),
  submitApplication,
);
router.get("/me", protect, getMyApplications);
router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/admin/recent", protect, adminOnly, getRecentApplications);
router.get("/admin/list", protect, adminOnly, getAdminApplications);
router.get("/:id", protect, adminOnly, getApplicationDetail);
router.put("/:id/accept", protect, adminOnly, acceptApplication);
router.put("/:id/decline", protect, adminOnly, declineApplication);

module.exports = router;
