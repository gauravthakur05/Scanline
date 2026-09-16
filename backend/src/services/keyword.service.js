import { TECH_SKILLS, SOFT_SKILLS, STOP_WORDS } from "../utils/dictionaries.js";

const ALL_KNOWN_SKILLS = [...TECH_SKILLS, ...SOFT_SKILLS];

// Sort longest-first so multi-word skills ("react native") match before
// their substrings ("react") when scanning text.
const SORTED_SKILLS = [...ALL_KNOWN_SKILLS].sort((a, b) => b.length - a.length);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Find which known skills (from our dictionary) appear in a block of text.
 * Returns skills in their canonical (dictionary) casing/spelling.
 */
export function findKnownSkills(text) {
  const lower = text.toLowerCase();
  const found = new Set();

  for (const skill of SORTED_SKILLS) {
    const pattern = new RegExp(`(?:^|[^a-z0-9+.#])${escapeRegExp(skill)}(?:[^a-z0-9+.#]|$)`, "i");
    if (pattern.test(` ${lower} `)) {
      found.add(skill);
    }
  }
  return [...found];
}

/**
 * Extract meaningful keywords/phrases from a job description using simple
 * frequency + heuristics (no external NLP dependency required).
 */
export function extractJobKeywords(jobDescription, jobRole) {
  const knownSkillsInJD = findKnownSkills(jobDescription + " " + jobRole);

  // Also pull out capitalized / technical-looking tokens that aren't in our
  // dictionary, so we still surface role-specific terms.
  const words = (jobDescription || "")
    .replace(/[^\w\s+#./-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const freq = new Map();
  for (const raw of words) {
    const w = raw.toLowerCase();
    if (w.length < 3) continue;
    if (STOP_WORDS.has(w)) continue;
    if (/^\d+$/.test(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  const frequentTerms = [...freq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term]) => term)
    .filter((term) => !knownSkillsInJD.includes(term));

  const combined = [...new Set([...knownSkillsInJD, ...frequentTerms])];
  return combined.slice(0, 30);
}

export function matchKeywords(resumeText, jobKeywords) {
  const lowerResume = resumeText.toLowerCase();
  const matched = [];
  const missing = [];

  for (const kw of jobKeywords) {
    const pattern = new RegExp(`(?:^|[^a-z0-9+.#])${escapeRegExp(kw.toLowerCase())}(?:[^a-z0-9+.#]|$)`, "i");
    if (pattern.test(` ${lowerResume} `)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const percentage = jobKeywords.length > 0 ? Math.round((matched.length / jobKeywords.length) * 100) : null;

  return { matched, missing, percentage };
}

export function categorizeSkills(resumeSkills) {
  const lowerSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const technical = [];
  const soft = [];
  for (const skill of resumeSkills) {
    if (SOFT_SKILLS.includes(skill.toLowerCase())) soft.push(skill);
    else technical.push(skill);
  }
  return { technical, soft };
}
