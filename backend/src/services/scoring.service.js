import { ACTION_VERBS, WEAK_PHRASES, STANDARD_SECTION_HEADINGS } from "../utils/dictionaries.js";
import { findKnownSkills, extractJobKeywords, matchKeywords, categorizeSkills } from "./keyword.service.js";

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?(\(?\d{3,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}/;
const LINKEDIN_RE = /linkedin\.com\/[a-z0-9\-_/]+/i;
const GITHUB_RE = /github\.com\/[a-z0-9\-_/]+/i;
const PORTFOLIO_RE = /\bhttps?:\/\/[^\s,)]+/gi;
const METRIC_RE = /(\d+(\.\d+)?\s?%|\$\s?\d[\d,]*|\b\d[\d,]*\+?\s?(users|customers|clients|hours|days|ms|sec|seconds|x|times|percent)\b|\b\d{2,}[\d,]*\b)/i;

function round(n) {
  return Math.round(n * 10) / 10;
}
function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/** Split resume text into lines and detect section boundaries by heading. */
function detectSections(text) {
  const lines = text.split("\n");
  const found = {};
  const order = [];

  const headingIndex = [];
  lines.forEach((line, idx) => {
    const clean = line.trim().toLowerCase().replace(/[:•\-–—]+$/, "").trim();
    if (!clean || clean.length > 40) return;
    for (const [key, variants] of Object.entries(STANDARD_SECTION_HEADINGS)) {
      if (variants.some((v) => clean === v || clean.startsWith(v))) {
        headingIndex.push({ key, idx });
        break;
      }
    }
  });

  headingIndex.forEach((h, i) => {
    const start = h.idx + 1;
    const end = i + 1 < headingIndex.length ? headingIndex[i + 1].idx : lines.length;
    const content = lines.slice(start, end).join("\n").trim();
    if (!found[h.key]) {
      found[h.key] = content;
      order.push(h.key);
    }
  });

  return { sections: found, headingCount: headingIndex.length, order };
}

function detectContactInfo(text) {
  return {
    email: EMAIL_RE.test(text),
    phone: PHONE_RE.test(text.slice(0, 1500)) || PHONE_RE.test(text), // usually near top
    linkedin: LINKEDIN_RE.test(text),
    github: GITHUB_RE.test(text),
    portfolio: (() => {
      const links = text.match(PORTFOLIO_RE) || [];
      return links.some((l) => !/linkedin\.com|github\.com/i.test(l));
    })(),
  };
}

function countActionVerbBullets(text) {
  const bulletLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^([•*\-–]|\d+[.)])\s+/.test(l) || (l.length > 0 && l.length < 200));

  let withActionVerb = 0;
  let withWeakPhrase = 0;
  let withMetric = 0;
  let total = 0;

  const experienceLikeLines = bulletLines.filter((l) => /^([•*\-–]|\d+[.)])\s+/.test(l));
  const lines = experienceLikeLines.length > 3 ? experienceLikeLines : bulletLines;

  for (const line of lines) {
    const clean = line.replace(/^([•*\-–]|\d+[.)])\s+/, "").trim();
    if (clean.length < 15) continue;
    total++;
    const firstWord = clean.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (ACTION_VERBS.includes(firstWord)) withActionVerb++;
    if (WEAK_PHRASES.some((p) => clean.toLowerCase().includes(p))) withWeakPhrase++;
    if (METRIC_RE.test(clean)) withMetric++;
  }

  return { total, withActionVerb, withWeakPhrase, withMetric };
}

function detectFormattingIssues(text) {
  const issues = [];
  const lines = text.split("\n");

  const longLines = lines.filter((l) => l.trim().length > 220);
  if (longLines.length > 0) {
    issues.push({
      type: "long_bullet_points",
      severity: "medium",
      message: `${longLines.length} line(s) are very long, which can hurt readability and ATS parsing. Break dense paragraphs into concise bullet points.`,
    });
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) {
    issues.push({
      type: "too_short",
      severity: "high",
      message: "Your resume content is quite short. ATS systems and recruiters typically expect more detail on experience, projects, and skills.",
    });
  }
  if (wordCount > 1200) {
    issues.push({
      type: "too_long",
      severity: "medium",
      message: "Your resume is very long. Aim for 1-2 pages of focused, relevant content -- ATS systems often weight overly long resumes as less relevant.",
    });
  }

  const tableLikeChars = (text.match(/\t{2,}|\|{2,}/g) || []).length;
  if (tableLikeChars > 3) {
    issues.push({
      type: "complex_formatting",
      severity: "high",
      message: "Your resume may contain tables or multi-column layouts, which many ATS parsers struggle to read correctly. Use a single-column, linear layout.",
    });
  }

  const bulletChars = new Set((text.match(/^[\s]*([•\-*◦▪‣o])/gm) || []).map((s) => s.trim()[0]));
  if (bulletChars.size > 3) {
    issues.push({
      type: "inconsistent_bullets",
      severity: "low",
      message: "You're mixing several different bullet-point styles. Stick to one consistent bullet character throughout.",
    });
  }

  const repeatedWords = findRepeatedWords(text);
  if (repeatedWords.length > 0) {
    issues.push({
      type: "repeated_words",
      severity: "low",
      message: `These words are used very frequently and may read as repetitive: ${repeatedWords.join(", ")}. Vary your vocabulary where possible.`,
    });
  }

  return issues;
}

function findRepeatedWords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 5);
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()]
    .filter(([, c]) => c >= 6)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);
}

/**
 * Core deterministic ATS analysis. Produces the same structured schema
 * regardless of whether the AI enrichment step succeeds, fails, or is
 * disabled (demo mode). AI output is layered on top of -- never a
 * replacement for -- these calculations.
 */
export function computeDeterministicAnalysis({ resumeText, jobRole, jobDescription, experienceLevel, industry }) {
  const { sections, headingCount } = detectSections(resumeText);
  const contact = detectContactInfo(resumeText);
  const resumeSkillsFound = findKnownSkills(resumeText);
  const { technical: technicalSkills, soft: softSkills } = categorizeSkills(resumeSkillsFound);
  const bulletStats = countActionVerbBullets(resumeText);
  const formattingIssues = detectFormattingIssues(resumeText);

  const hasJD = !!(jobDescription && jobDescription.trim().length > 40);
  const jobKeywords = hasJD ? extractJobKeywords(jobDescription, jobRole) : findKnownSkills(jobRole);
  const jdSkills = hasJD ? findKnownSkills(jobDescription) : [];
  const keywordMatch = matchKeywords(resumeText, jobKeywords.length ? jobKeywords : jdSkills);

  const requiredSkills = jdSkills.length ? jdSkills : findKnownSkills(jobRole);
  const matchedSkills = requiredSkills.filter((s) => resumeSkillsFound.map((r) => r.toLowerCase()).includes(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s) => !matchedSkills.map((m) => m.toLowerCase()).includes(s.toLowerCase()));

  // ---- Section scores (0-100 each) ----
  const sectionScores = {};

  // Summary
  const summaryText = sections.summary || "";
  let summaryScore = 40;
  if (summaryText) {
    summaryScore = 60;
    if (summaryText.split(/\s+/).length >= 20) summaryScore += 15;
    if (jobRole && summaryText.toLowerCase().includes(jobRole.toLowerCase().split(" ")[0])) summaryScore += 10;
    const weakHits = WEAK_PHRASES.filter((p) => summaryText.toLowerCase().includes(p)).length;
    summaryScore -= weakHits * 8;
  }
  sectionScores.summary = clamp(round(summaryScore));

  // Skills
  let skillsScore = clamp(resumeSkillsFound.length * 6);
  if (requiredSkills.length > 0) {
    const matchRatio = matchedSkills.length / requiredSkills.length;
    skillsScore = clamp(round(matchRatio * 70 + Math.min(resumeSkillsFound.length, 15) * 2));
  }
  sectionScores.skills = clamp(round(skillsScore));

  // Experience
  let experienceScore = 30;
  if (sections.experience) {
    experienceScore = 50;
    if (bulletStats.total > 0) {
      experienceScore += (bulletStats.withActionVerb / bulletStats.total) * 25;
      experienceScore += (bulletStats.withMetric / bulletStats.total) * 20;
      experienceScore -= (bulletStats.withWeakPhrase / bulletStats.total) * 15;
    }
  }
  sectionScores.experience = clamp(round(experienceScore));

  // Projects
  let projectsScore = sections.projects ? 65 : 35;
  if (sections.projects) {
    const projSkills = findKnownSkills(sections.projects);
    projectsScore += Math.min(projSkills.length * 4, 25);
    if (METRIC_RE.test(sections.projects)) projectsScore += 10;
  }
  sectionScores.projects = clamp(round(projectsScore));

  // Education
  let educationScore = sections.education ? 85 : 30;
  if (sections.education && /\b(19|20)\d{2}\b/.test(sections.education)) educationScore = Math.min(100, educationScore + 5);
  sectionScores.education = clamp(round(educationScore));

  // Formatting
  let formattingScore = 90;
  formattingScore -= formattingIssues.reduce((acc, i) => acc + (i.severity === "high" ? 20 : i.severity === "medium" ? 10 : 5), 0);
  if (headingCount < 3) formattingScore -= 15;
  sectionScores.formatting = clamp(round(formattingScore));

  // ---- Section completeness ----
  const requiredSections = ["contact", "summary", "experience", "education", "skills"];
  const optionalSections = ["projects", "certifications", "achievements"];
  const hasContactSection = contact.email && contact.phone;
  const presentRequired = requiredSections.filter((s) => (s === "contact" ? hasContactSection : !!sections[s])).length;
  const presentOptional = optionalSections.filter((s) => !!sections[s]).length;
  const sectionCompletenessScore = clamp(round((presentRequired / requiredSections.length) * 80 + (presentOptional / optionalSections.length) * 20));

  // ---- ATS compatibility (structure/readability/format) ----
  const atsCompatibilityScore = sectionScores.formatting;

  // ---- Keyword match ----
  const keywordMatchScore = keywordMatch.percentage !== null ? keywordMatch.percentage : clamp(resumeSkillsFound.length * 5);

  // ---- Skills match ----
  const skillsMatchScore = requiredSkills.length > 0
    ? clamp(round((matchedSkills.length / requiredSkills.length) * 100))
    : sectionScores.skills;

  // ---- Experience relevance ----
  let experienceRelevanceScore = experienceScore;
  if (hasJD) {
    const roleTerms = (jobRole || "").toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const expText = (sections.experience || "").toLowerCase();
    const roleTermHits = roleTerms.filter((t) => expText.includes(t)).length;
    experienceRelevanceScore = clamp(round(experienceScore * 0.7 + (roleTerms.length ? (roleTermHits / roleTerms.length) : 0) * 30));
  }

  // ---- Content quality ----
  let contentQualityScore = 50;
  if (bulletStats.total > 0) {
    contentQualityScore =
      (bulletStats.withActionVerb / bulletStats.total) * 45 +
      (bulletStats.withMetric / bulletStats.total) * 45 +
      10;
    contentQualityScore -= (bulletStats.withWeakPhrase / bulletStats.total) * 15;
  }
  contentQualityScore = clamp(round(contentQualityScore));

  // ---- Weighted overall ATS score ----
  const weights = {
    atsCompatibility: 0.20,
    keywordMatch: 0.25,
    skillsMatch: 0.20,
    experienceRelevance: 0.15,
    contentQuality: 0.10,
    sectionCompleteness: 0.10,
  };

  const breakdown = {
    atsCompatibility: { label: "ATS Compatibility", weight: 20, score: atsCompatibilityScore },
    keywordMatch: { label: "Keyword Match", weight: 25, score: keywordMatchScore },
    skillsMatch: { label: "Skills Match", weight: 20, score: skillsMatchScore },
    experienceRelevance: { label: "Experience Relevance", weight: 15, score: clamp(round(experienceRelevanceScore)) },
    contentQuality: { label: "Resume Content Quality", weight: 10, score: contentQualityScore },
    sectionCompleteness: { label: "Section Completeness", weight: 10, score: sectionCompletenessScore },
  };

  const atsScore = clamp(Math.round(
    breakdown.atsCompatibility.score * weights.atsCompatibility +
    breakdown.keywordMatch.score * weights.keywordMatch +
    breakdown.skillsMatch.score * weights.skillsMatch +
    breakdown.experienceRelevance.score * weights.experienceRelevance +
    breakdown.contentQuality.score * weights.contentQuality +
    breakdown.sectionCompleteness.score * weights.sectionCompleteness
  ));

  // ---- Issues ----
  const issues = [...formattingIssues];
  if (!contact.email) issues.push({ type: "missing_email", severity: "high", message: "No email address detected. Recruiters and ATS systems need this to contact you." });
  if (!contact.phone) issues.push({ type: "missing_phone", severity: "medium", message: "No phone number detected in your resume." });
  if (!sections.summary) issues.push({ type: "missing_summary", severity: "medium", message: "No professional summary section found. A short summary helps both ATS parsing and recruiter skimming." });
  if (!sections.skills) issues.push({ type: "missing_skills_section", severity: "high", message: "No dedicated skills section found. ATS systems often specifically scan for a skills section." });
  if (bulletStats.total > 0 && bulletStats.withMetric / bulletStats.total < 0.3) {
    issues.push({ type: "lacking_metrics", severity: "medium", message: "Most of your bullet points lack measurable results (numbers, percentages, or scale). Quantified achievements are far more persuasive." });
  }
  if (bulletStats.total > 0 && bulletStats.withWeakPhrase / bulletStats.total > 0.25) {
    issues.push({ type: "weak_phrasing", severity: "medium", message: "Several bullet points use passive phrases like 'responsible for' or 'worked on'. Replace them with strong action verbs." });
  }
  if (headingCount < 3) {
    issues.push({ type: "non_standard_headings", severity: "medium", message: "We could only detect a few standard section headings. Use clear, conventional headings (e.g. 'Experience', 'Education', 'Skills') so ATS software can parse your resume correctly." });
  }

  // ---- Strengths ----
  const strengths = [];
  if (technicalSkills.length >= 6) strengths.push("Strong technical skill coverage across multiple areas");
  if (sections.projects) strengths.push("Includes a dedicated projects section demonstrating hands-on work");
  if (sections.education) strengths.push("Education section is clearly present");
  if (keywordMatch.percentage !== null && keywordMatch.percentage >= 60) strengths.push("Good keyword alignment with the target job description");
  if (bulletStats.total > 0 && bulletStats.withActionVerb / bulletStats.total >= 0.5) strengths.push("Good use of strong action verbs in experience bullet points");
  if (bulletStats.total > 0 && bulletStats.withMetric / bulletStats.total >= 0.4) strengths.push("Several achievements are backed by measurable results");
  if (contact.linkedin) strengths.push("LinkedIn profile is included for recruiter visibility");
  if (contact.github) strengths.push("GitHub profile is included, useful for technical roles");

  return {
    atsScore,
    breakdown,
    sectionScores,
    contact,
    sections: Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.length > 0])),
    resumeSkillsFound,
    technicalSkills,
    softSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    jobKeywords: jobKeywords.length ? jobKeywords : jdSkills,
    keywordMatch,
    bulletStats,
    issues,
    strengths,
    hasJD,
  };
}

export function scoreCategory(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Poor";
}
