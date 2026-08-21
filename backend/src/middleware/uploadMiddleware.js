const multer = require("multer");
const os = require("os");
const path = require("path");

// Vercel's serverless functions only allow writes to os.tmpdir() (/tmp)
const uploadDir = os.tmpdir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

// File type filters
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "cv") {
    if (file.mimetype === "application/pdf") return cb(null, true);
    return cb(new Error("CV must be a PDF file"), false);
  }
  if (file.fieldname === "photo") {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    return cb(new Error("Photo must be an image"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
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
