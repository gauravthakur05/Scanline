export function scoreCategory(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Poor";
}

export function scoreTone(score) {
  if (score >= 80) return "good";
  if (score >= 60) return "warn";
  return "bad";
}

export function toneClasses(tone) {
  const map = {
    good: { text: "text-good", bg: "bg-good-soft", ring: "#1D9A6C", border: "border-good/30" },
    warn: { text: "text-warn", bg: "bg-warn-soft", ring: "#B8860B", border: "border-warn/30" },
    bad: { text: "text-bad", bg: "bg-bad-soft", ring: "#D8442B", border: "border-bad/30" },
  };
  return map[tone] || map.warn;
}

export function severityTone(severity) {
  if (severity === "high") return "bad";
  if (severity === "medium") return "warn";
  return "good";
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}
