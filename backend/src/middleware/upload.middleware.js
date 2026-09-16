import multer from "multer";
import { ALLOWED_EXTENSIONS, getExtension } from "../utils/validators.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = getExtension(file.originalname);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    const err = new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
}

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single("resume");

export function handleUploadErrors(req, res, next) {
  uploadResume(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large. Please upload a file under 5MB." });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }
    next();
  });
}
