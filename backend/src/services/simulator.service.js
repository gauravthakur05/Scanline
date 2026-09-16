// Estimated, clearly-labeled point impact per improvement. These are
// heuristic caps (not guarantees) applied on top of the real deterministic
// score, and are always presented to the user as an *estimate*.
const IMPROVEMENT_IMPACT = {
  addMissingKeywords: { max: 8, appliesIf: (d) => d.missingSkills.length > 0 },
  improveSummary: { max: 4, appliesIf: (d) => !d.sections.summary || d.sectionScores.summary < 70 },
  addMeasurableAchievements: { max: 7, appliesIf: (d) => d.bulletStats.total > 0 && d.bulletStats.withMetric / d.bulletStats.total < 0.5 },
  improveProjectDescriptions: { max: 3, appliesIf: (d) => !d.sections.projects || d.sectionScores.projects < 70 },
  addRelevantSkills: { max: 5, appliesIf: (d) => d.missingSkills.length > 0 },
  fixFormattingIssues: { max: 4, appliesIf: (d) => d.issues.some((i) => i.severity === "high" || i.severity === "medium") },
};

export function simulateImprovements(deterministic, selectedImprovements = []) {
  const before = deterministic.atsScore;
  let gain = 0;
  const appliedDetails = [];

  for (const key of selectedImprovements) {
    const rule = IMPROVEMENT_IMPACT[key];
    if (!rule) continue;
    const applicable = rule.appliesIf(deterministic);
    const points = applicable ? rule.max : Math.round(rule.max * 0.25);
    gain += points;
    appliedDetails.push({ key, estimatedPoints: points, alreadyStrong: !applicable });
  }

  // Diminishing returns so stacking many improvements doesn't feel unrealistic.
  const dampedGain = Math.round(gain * 0.85);
  const after = Math.min(99, before + dampedGain);

  return {
    before,
    after,
    estimatedGain: after - before,
    appliedDetails,
    isEstimate: true,
    disclaimer: "This is an estimated score based on typical impact -- not a guaranteed result. Actual improvement depends on how the changes are implemented.",
  };
}

export const AVAILABLE_IMPROVEMENTS = Object.keys(IMPROVEMENT_IMPACT);
