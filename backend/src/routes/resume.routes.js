import { Router } from "express";
import { handleUploadErrors } from "../middleware/upload.middleware.js";
import { analyzeRateLimiter } from "../middleware/rateLimiter.js";
import { parseResume, analyzeResume, scoreResume, improveResume, healthCheck } from "../controllers/resume.controller.js";

const router = Router();

router.post("/resume/parse", handleUploadErrors, parseResume);
router.post("/resume/analyze", analyzeRateLimiter, analyzeResume);
router.post("/resume/score", analyzeRateLimiter, scoreResume);
router.post("/resume/improve", analyzeRateLimiter, improveResume);
router.get("/health", healthCheck);

export default router;
