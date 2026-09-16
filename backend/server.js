import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { generalRateLimiter } from "./src/middleware/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./src/middleware/errorHandler.js";
import resumeRoutes from "./src/routes/resume.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = "https://scanline-l9xm.vercel.app";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalRateLimiter);

app.use("/api", resumeRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ATS Resume Analyzer API is running.", docs: "See README.md for endpoint documentation." });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ATS Resume Analyzer backend listening on port ${PORT}`);
  console.log(`AI mode: ${process.env.AI_API_KEY ? "live (Anthropic API key detected)" : "demo (no AI_API_KEY set)"}`);
});
