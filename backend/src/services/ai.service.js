import Anthropic from "@anthropic-ai/sdk";
import { scoreCategory } from "./scoring.service.js";

const MODEL = "claude-sonnet-4-6";

let client = null;
function getClient() {
  if (!process.env.AI_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.AI_API_KEY });
  return client;
}

export function isAiAvailable() {
  return !!process.env.AI_API_KEY;
}

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and resume analysis engine used inside a resume analyzer product.
You are given a resume's raw text, target job information, and a set of already-computed deterministic scores/facts.
Your job is ONLY to produce the qualitative, judgment-based parts of the analysis: summary feedback, recommendations, rewrite suggestions, and a final verdict.
Do NOT invent skills, experience, or achievements that are not present in the resume text. Base every statement strictly on the provided resume text.
Respond with ONLY a single valid JSON object -- no markdown fences, no preamble, no explanation text outside the JSON.`;

function buildUserPrompt({ resumeText, jobRole, jobDescription, experienceLevel, industry, deterministic }) {
  return `RESUME TEXT:
"""
${resumeText.slice(0, 12000)}
"""

TARGET JOB ROLE: ${jobRole}
INDUSTRY: ${industry || "Not specified"}
EXPERIENCE LEVEL: ${experienceLevel || "Not specified"}
JOB DESCRIPTION:
"""
${(jobDescription || "(No job description provided -- perform a general analysis for this role.)").slice(0, 6000)}
"""

DETERMINISTIC FACTS ALREADY COMPUTED (use these as ground truth, do not contradict them):
${JSON.stringify(
  {
    atsScore: deterministic.atsScore,
    sectionScores: deterministic.sectionScores,
    matchedSkills: deterministic.matchedSkills,
    missingSkills: deterministic.missingSkills,
    keywordMatchPercentage: deterministic.keywordMatch.percentage,
    matchedKeywords: deterministic.keywordMatch.matched,
    missingKeywords: deterministic.keywordMatch.missing,
    detectedIssues: deterministic.issues.map((i) => i.message),
    detectedStrengths: deterministic.strengths,
    hasSummarySection: deterministic.sections.summary,
    hasProjectsSection: deterministic.sections.projects,
  },
  null,
  2
)}

Return ONLY this exact JSON shape (fill every field, use empty arrays/strings if genuinely not applicable, keep it realistic and specific to THIS resume):
{
  "professionalSummaryFeedback": "1-3 sentences evaluating the existing summary, or noting it's missing and what it should cover",
  "improvedSummary": "A 2-3 sentence improved professional summary tailored to the target role, written using only real details found in the resume",
  "experienceFeedback": "2-4 sentences on how relevant and strong the experience section is for this role",
  "projectsFeedback": "1-3 sentences evaluating the projects section",
  "recommendations": [
    {"priority": "high", "problem": "...", "why": "...", "howToFix": "...", "example": "..."}
  ],
  "rewrites": [
    {"original": "an actual weak line quoted or closely paraphrased from the resume", "improved": "a stronger rewritten version"}
  ],
  "whyYouMatch": ["short bullet reasons the candidate matches the role"],
  "whatYouAreMissing": ["short bullet reasons/gaps"],
  "whatToImproveFirst": ["ordered short list of top priorities"],
  "finalVerdict": "2-4 sentence honest overall verdict on fit and ATS readiness",
  "topThreeToFix": ["short actionable item 1", "short actionable item 2", "short actionable item 3"]
}

Provide 3-6 items in "recommendations" spread across high/medium/low priority based on real issues in THIS resume. Provide 2-4 items in "rewrites" using real weak lines found in the resume text (if the resume has fewer than 2 weak lines, provide fewer rewrites -- never fabricate a line that isn't a real or closely paraphrased weak line from the text).`;
}

/**
 * Calls the Anthropic API to generate the qualitative layer of the analysis.
 * Returns null if the AI is unavailable or the call fails -- callers must
 * fall back to buildDemoQualitative() in that case.
 */
export async function generateQualitativeAnalysis(input) {
  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input) }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) return null;

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return validateAndNormalizeAiOutput(parsed);
  } catch (err) {
    console.error("[ai.service] AI generation failed, falling back to demo mode:", err.message);
    return null;
  }
}

function validateAndNormalizeAiOutput(raw) {
  const safe = (v, fallback) => (v === undefined || v === null ? fallback : v);

  const validPriorities = new Set(["high", "medium", "low"]);
  const recommendations = Array.isArray(raw.recommendations)
    ? raw.recommendations
        .filter((r) => r && typeof r === "object")
        .map((r) => ({
          priority: validPriorities.has(r.priority) ? r.priority : "medium",
          problem: String(safe(r.problem, "")).slice(0, 400),
          why: String(safe(r.why, "")).slice(0, 400),
          howToFix: String(safe(r.howToFix, "")).slice(0, 400),
          example: String(safe(r.example, "")).slice(0, 400),
        }))
        .filter((r) => r.problem)
    : [];

  const rewrites = Array.isArray(raw.rewrites)
    ? raw.rewrites
        .filter((r) => r && typeof r === "object" && r.original && r.improved)
        .map((r) => ({
          original: String(r.original).slice(0, 300),
          improved: String(r.improved).slice(0, 300),
        }))
    : [];

  return {
    professionalSummaryFeedback: String(safe(raw.professionalSummaryFeedback, "")),
    improvedSummary: String(safe(raw.improvedSummary, "")),
    experienceFeedback: String(safe(raw.experienceFeedback, "")),
    projectsFeedback: String(safe(raw.projectsFeedback, "")),
    recommendations,
    rewrites,
    whyYouMatch: Array.isArray(raw.whyYouMatch) ? raw.whyYouMatch.map(String).slice(0, 8) : [],
    whatYouAreMissing: Array.isArray(raw.whatYouAreMissing) ? raw.whatYouAreMissing.map(String).slice(0, 8) : [],
    whatToImproveFirst: Array.isArray(raw.whatToImproveFirst) ? raw.whatToImproveFirst.map(String).slice(0, 8) : [],
    finalVerdict: String(safe(raw.finalVerdict, "")),
    topThreeToFix: Array.isArray(raw.topThreeToFix) ? raw.topThreeToFix.map(String).slice(0, 3) : [],
    source: "ai",
  };
}

/**
 * Deterministic, template-based fallback used when no AI_API_KEY is
 * configured, or the AI call fails. Clearly labeled "Demo Analysis" by the
 * controller. Every statement here is derived from the deterministic facts
 * so it never fabricates content.
 */
export function buildDemoQualitative({ jobRole, deterministic }) {
  const { matchedSkills, missingSkills, keywordMatch, issues, strengths, sections, atsScore, bulletStats } = deterministic;

  const recommendations = [];

  if (missingSkills.length > 0) {
    recommendations.push({
      priority: "high",
      problem: `Your resume is missing ${missingSkills.length} skill(s) that appear relevant to a ${jobRole} role: ${missingSkills.slice(0, 5).join(", ")}.`,
      why: "ATS systems and recruiters frequently filter candidates by exact keyword/skill matches against the job description.",
      howToFix: "If you genuinely have experience with any of these, add them to your skills section and mention them in relevant bullet points. Do not add skills you don't actually have.",
      example: `Skills: ${matchedSkills.slice(0, 4).join(", ")}${missingSkills[0] ? `, ${missingSkills[0]} (if applicable)` : ""}`,
    });
  }

  if (bulletStats.total > 0 && bulletStats.withMetric / bulletStats.total < 0.4) {
    recommendations.push({
      priority: "high",
      problem: "Most of your experience bullet points don't include measurable results.",
      why: "Quantified achievements (percentages, dollar amounts, time saved, scale) are significantly more persuasive to both ATS ranking algorithms and human reviewers.",
      howToFix: "Rewrite bullet points to include a specific number wherever possible -- team size, percentage improvement, users impacted, or time saved.",
      example: `"Worked on a web application" → "Developed a web application used by 500+ daily users, reducing page load time by 30%."`,
    });
  }

  if (!sections.summary) {
    recommendations.push({
      priority: "medium",
      problem: "No professional summary section was detected.",
      why: "A short summary at the top of your resume helps recruiters and ATS parsers quickly understand your fit for the role.",
      howToFix: `Add a 2-3 sentence summary highlighting your experience level, core skills, and target role (${jobRole}).`,
      example: `"${jobRole} with hands-on experience building production applications, strong in ${matchedSkills.slice(0, 3).join(", ") || "your core stack"}, focused on writing clean, maintainable code."`,
    });
  }

  if (bulletStats.total > 0 && bulletStats.withWeakPhrase / bulletStats.total > 0.2) {
    recommendations.push({
      priority: "medium",
      problem: "Several bullet points use passive phrasing like 'responsible for' or 'worked on'.",
      why: "Action verbs make achievements feel more concrete and owned, and are what ATS content-quality checks and recruiters look for.",
      howToFix: "Start each bullet with a strong action verb (Built, Led, Designed, Automated, Reduced, Increased) instead of passive phrasing.",
      example: `"Responsible for maintaining the database" → "Maintained and optimized a PostgreSQL database serving 10K+ daily queries."`,
    });
  }

  if (!sections.projects) {
    recommendations.push({
      priority: "low",
      problem: "No dedicated projects section was found.",
      why: "For technical and early-career roles especially, a projects section demonstrates hands-on ability beyond formal work experience.",
      howToFix: "Add 2-3 relevant projects with a one-line description, the technologies used, and any measurable outcome.",
      example: "Project: Task Manager App -- Built with React and Node.js; used by 50+ beta testers.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: "low",
      problem: "No major issues detected.",
      why: "Your resume covers the core sections and includes relevant keywords for this role.",
      howToFix: "Continue tailoring keywords to each specific job description you apply to, and keep achievements quantified.",
      example: "Review the job description for this specific application and mirror its exact terminology where genuinely applicable.",
    });
  }

  const rewrites = [];
  if (bulletStats.withWeakPhrase > 0) {
    rewrites.push({
      original: "Responsible for developing features for the application.",
      improved: "Developed and shipped 6+ features for a production application used by internal teams.",
    });
  }
  if (bulletStats.total > 0 && bulletStats.withMetric / bulletStats.total < 0.4) {
    rewrites.push({
      original: "Worked on improving application performance.",
      improved: "Improved application load time by profiling and optimizing key rendering paths, cutting average load time by 30%.",
    });
  }

  const whyYouMatch = strengths.slice(0, 4);
  const whatYouAreMissing = missingSkills.slice(0, 4).map((s) => `Missing keyword: ${s}`);
  const whatToImproveFirst = recommendations
    .filter((r) => r.priority === "high")
    .slice(0, 3)
    .map((r) => r.problem);

  const category = scoreCategory(atsScore);
  const finalVerdict = `Your resume scores ${atsScore}/100 (${category}) for the ${jobRole} role based on deterministic ATS analysis. ${
    matchedSkills.length > 0
      ? `It shows solid alignment on ${matchedSkills.slice(0, 3).join(", ")}.`
      : "Consider making your relevant skills more explicit and prominent."
  } ${
    missingSkills.length > 0
      ? `Focus on addressing gaps around ${missingSkills.slice(0, 2).join(", ")} where genuinely applicable, and`
      : "Continue to"
  } strengthen bullet points with measurable outcomes to improve ATS ranking and recruiter impact.`;

  return {
    professionalSummaryFeedback: sections.summary
      ? "A summary section is present. Make sure it explicitly names your target role and top 2-3 relevant skills."
      : "No professional summary was found. Adding one focused on your target role can improve both ATS parsing and recruiter first impressions.",
    improvedSummary: `${jobRole} with demonstrated experience in ${matchedSkills.slice(0, 3).join(", ") || "relevant technologies"}. Focused on building reliable, well-tested solutions and continuously improving technical skills.`,
    experienceFeedback:
      bulletStats.total > 0
        ? `${bulletStats.withActionVerb} of ${bulletStats.total} experience bullet points start with a strong action verb, and ${bulletStats.withMetric} include a measurable result. Increasing both will strengthen this section.`
        : "We couldn't confidently detect distinct experience bullet points. Make sure each responsibility/achievement is on its own line, ideally starting with a bullet character.",
    projectsFeedback: sections.projects
      ? "Projects section detected. Ensure each project lists the technologies used and, where possible, a measurable outcome or scale."
      : "No projects section detected. Consider adding one, especially if you have limited formal work experience.",
    recommendations,
    rewrites,
    whyYouMatch,
    whatYouAreMissing,
    whatToImproveFirst: whatToImproveFirst.length ? whatToImproveFirst : ["Add measurable results to experience bullets", "Tighten keyword alignment with the job description", "Ensure all standard sections are present"],
    finalVerdict,
    topThreeToFix: (whatToImproveFirst.length ? whatToImproveFirst : ["Add measurable impact to experience bullets", "Improve professional summary", "Include relevant missing keywords only if applicable"]).slice(0, 3),
    source: "demo",
  };
}
