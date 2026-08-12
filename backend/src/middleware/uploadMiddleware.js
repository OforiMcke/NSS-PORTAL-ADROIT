const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

// File type filters
const fileFilter = (req, file, cb) => {
  // CV: pdf only
  if (file.fieldname === "cv") {
    if (file.mimetype === "application/pdf") return cb(null, true);
    return cb(new Error("CV must be a PDF file"), false);
  }
  // Photo: image only
  if (file.fieldname === "photo") {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Photo must be an image"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const handleUploadErrors = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(err instanceof Error ? err : new Error(String(err)));
    }
    next();
  });
};

module.exports = upload;
module.exports.handleUploadErrors = handleUploadErrors;
