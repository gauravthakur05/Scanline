import { extractTextFromFile } from "../services/parser.service.js";
import { computeDeterministicAnalysis, scoreCategory } from "../services/scoring.service.js";
import { generateQualitativeAnalysis, buildDemoQualitative, isAiAvailable } from "../services/ai.service.js";
import { simulateImprovements, AVAILABLE_IMPROVEMENTS } from "../services/simulator.service.js";
import { validateAnalyzeInput } from "../utils/validators.js";

export async function parseResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded. Please choose a PDF, DOCX, or TXT file." });
    }
    const text = await extractTextFromFile(req.file);
    const preview = text.length > 600 ? text.slice(0, 600) + "…" : text;

    res.json({
      filename: req.file.originalname,
      characterCount: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      preview,
      resumeText: text,
    });
  } catch (err) {
    next(err);
  }
}

export async function analyzeResume(req, res, next) {
  try {
    const errors = validateAnalyzeInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0].message, fieldErrors: errors });
    }

    const { resumeText, jobRole, jobDescription = "", experienceLevel = "", industry = "" } = req.body;
    const cleanResumeText = resumeText.trim();
    const cleanJobRole = jobRole.trim();

    const deterministic = computeDeterministicAnalysis({
      resumeText: cleanResumeText,
      jobRole: cleanJobRole,
      jobDescription,
      experienceLevel,
      industry,
    });

    let qualitative = null;
    let mode = "demo";

    if (isAiAvailable()) {
      qualitative = await generateQualitativeAnalysis({
        resumeText: cleanResumeText,
        jobRole: cleanJobRole,
        jobDescription,
        experienceLevel,
        industry,
        deterministic,
      });
      if (qualitative) mode = "ai";
    }

    if (!qualitative) {
      qualitative = buildDemoQualitative({ jobRole: cleanJobRole, deterministic });
      mode = "demo";
    }

    const result = {
      mode, // "ai" | "demo" -- frontend must clearly label demo mode
      atsScore: deterministic.atsScore,
      scoreCategory: scoreCategory(deterministic.atsScore),
      breakdown: deterministic.breakdown,
      sectionScores: deterministic.sectionScores,
      sections: deterministic.sections,
      contact: deterministic.contact,
      skills: {
        technical: deterministic.technicalSkills,
        soft: deterministic.softSkills,
        matched: deterministic.matchedSkills,
        missing: deterministic.missingSkills,
      },
      keywords: {
        matched: deterministic.keywordMatch.matched,
        missing: deterministic.keywordMatch.missing,
        percentage: deterministic.keywordMatch.percentage,
        recommended: deterministic.missingSkills.slice(0, 8),
      },
      jobMatch: {
        overall: Math.round(
          (deterministic.breakdown.skillsMatch.score +
            deterministic.breakdown.experienceRelevance.score +
            (deterministic.keywordMatch.percentage ?? deterministic.breakdown.keywordMatch.score) +
            deterministic.sectionScores.projects) / 4
        ),
        skills: deterministic.breakdown.skillsMatch.score,
        experience: deterministic.breakdown.experienceRelevance.score,
        keywords: deterministic.keywordMatch.percentage ?? deterministic.breakdown.keywordMatch.score,
        projectRelevance: deterministic.sectionScores.projects,
      },
      issues: deterministic.issues,
      strengths: deterministic.strengths,
      hasJobDescription: deterministic.hasJD,
      qualitative,
      meta: {
        jobRole: cleanJobRole,
        experienceLevel: experienceLevel || null,
        industry: industry || null,
        analyzedAt: new Date().toISOString(),
        resumeWordCount: cleanResumeText.split(/\s+/).filter(Boolean).length,
      },
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function scoreResume(req, res, next) {
  try {
    const errors = validateAnalyzeInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0].message, fieldErrors: errors });
    }
    const { resumeText, jobRole, jobDescription = "", experienceLevel = "", industry = "" } = req.body;
    const deterministic = computeDeterministicAnalysis({
      resumeText: resumeText.trim(),
      jobRole: jobRole.trim(),
      jobDescription,
      experienceLevel,
      industry,
    });

    res.json({
      atsScore: deterministic.atsScore,
      scoreCategory: scoreCategory(deterministic.atsScore),
      breakdown: deterministic.breakdown,
    });
  } catch (err) {
    next(err);
  }
}

export async function improveResume(req, res, next) {
  try {
    const { resumeText, jobRole, jobDescription = "", experienceLevel = "", industry = "", selectedImprovements = [] } = req.body;

    const errors = validateAnalyzeInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0].message, fieldErrors: errors });
    }

    if (!Array.isArray(selectedImprovements) || selectedImprovements.length === 0) {
      return res.status(400).json({ error: "Select at least one improvement to simulate." });
    }

    const invalid = selectedImprovements.filter((s) => !AVAILABLE_IMPROVEMENTS.includes(s));
    if (invalid.length > 0) {
      return res.status(400).json({ error: `Unknown improvement option(s): ${invalid.join(", ")}` });
    }

    const deterministic = computeDeterministicAnalysis({
      resumeText: resumeText.trim(),
      jobRole: jobRole.trim(),
      jobDescription,
      experienceLevel,
      industry,
    });

    const simulation = simulateImprovements(deterministic, selectedImprovements);
    res.json(simulation);
  } catch (err) {
    next(err);
  }
}

export function healthCheck(req, res) {
  res.json({
    status: "ok",
    aiMode: isAiAvailable() ? "live" : "demo",
    timestamp: new Date().toISOString(),
  });
}
