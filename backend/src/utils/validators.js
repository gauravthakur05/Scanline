export const MIN_RESUME_LENGTH = 200; // characters
export const MAX_RESUME_LENGTH = 20000; // characters
export const MAX_JOB_DESCRIPTION_LENGTH = 8000;

export function validateAnalyzeInput(body) {
  const errors = [];
  const resumeText = (body.resumeText || "").trim();
  const jobRole = (body.jobRole || "").trim();
  const jobDescription = (body.jobDescription || "").trim();

  if (!resumeText) {
    errors.push({ field: "resumeText", message: "Please upload or paste your resume before analyzing." });
  } else if (resumeText.length < MIN_RESUME_LENGTH) {
    errors.push({ field: "resumeText", message: "Your resume looks too short to analyze accurately. Add more detail (at least a few sentences per section)." });
  } else if (resumeText.length > MAX_RESUME_LENGTH) {
    errors.push({ field: "resumeText", message: "Your resume text is unusually long. Please trim it to under 20,000 characters." });
  }

  if (!jobRole) {
    errors.push({ field: "jobRole", message: "Please enter the job role you're targeting, e.g. 'Frontend Developer'." });
  } else if (jobRole.length > 120) {
    errors.push({ field: "jobRole", message: "Job role is too long. Keep it short, e.g. 'Data Analyst'." });
  }

  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    errors.push({ field: "jobDescription", message: "Job description is too long. Please paste a shorter excerpt (under 8,000 characters)." });
  }

  return errors;
}

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt"]);

export function getExtension(filename = "") {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}
