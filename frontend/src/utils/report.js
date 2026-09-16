import { jsPDF } from "jspdf";

export function downloadAtsReport(analysis, meta) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  const ink = "#14171A";
  const soft = "#4B5259";
  const line = "#E4E7EB";

  function ensureSpace(needed) {
    if (y + needed > 780) {
      doc.addPage();
      y = margin;
    }
  }

  function heading(text, size = 14) {
    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(ink);
    doc.text(text, margin, y);
    y += size * 1.2;
  }

  function paragraph(text, size = 10, color = soft) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    ensureSpace(lines.length * (size * 1.4) + 6);
    doc.text(lines, margin, y);
    y += lines.length * (size * 1.4) + 6;
  }

  function divider() {
    ensureSpace(16);
    doc.setDrawColor(line);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  }

  function bulletList(items, size = 10) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(soft);
    for (const item of items) {
      const lines = doc.splitTextToSize(`•  ${item}`, pageWidth - margin * 2 - 10);
      ensureSpace(lines.length * (size * 1.4) + 2);
      doc.text(lines, margin + 4, y);
      y += lines.length * (size * 1.4) + 2;
    }
    y += 6;
  }

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(ink);
  doc.text("ATS Resume Report", margin, y);
  y += 26;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(soft);
  doc.text(`Target role: ${meta.jobRole}`, margin, y);
  y += 14;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 20;
  if (analysis.mode === "demo") {
    doc.setTextColor("#B8860B");
    doc.text("Demo Analysis — generated without a live AI connection.", margin, y);
    doc.setTextColor(soft);
    y += 16;
  }
  divider();

  // Score
  heading(`ATS Score: ${analysis.atsScore} / 100 (${analysis.scoreCategory})`, 16);
  y += 4;

  heading("Score Breakdown", 13);
  bulletList(Object.values(analysis.breakdown).map((c) => `${c.label}: ${Math.round(c.score)}/100 (weight ${c.weight}%)`));

  heading("Section Scores", 13);
  bulletList(Object.entries(analysis.sectionScores).map(([k, v]) => `${k}: ${Math.round(v)}%`));

  heading("Keyword Match", 13);
  paragraph(`Matched: ${analysis.keywords.matched.join(", ") || "None"}`);
  paragraph(`Missing: ${analysis.keywords.missing.join(", ") || "None"}`);

  heading("Strengths", 13);
  bulletList(analysis.strengths.length ? analysis.strengths : ["No specific strengths flagged."]);

  heading("Issues & Weaknesses", 13);
  bulletList(analysis.issues.length ? analysis.issues.map((i) => i.message) : ["No significant issues detected."]);

  heading("Recommendations", 13);
  bulletList(
    (analysis.qualitative.recommendations || []).map(
      (r) => `[${r.priority.toUpperCase()}] ${r.problem} — ${r.howToFix}`
    )
  );

  heading("Section Completeness", 13);
  bulletList(
    Object.entries(analysis.sections).map(([k, present]) => `${k}: ${present ? "Present" : "Missing"}`)
  );

  divider();
  heading("Final Verdict", 13);
  paragraph(analysis.qualitative.finalVerdict);
  bulletList(analysis.qualitative.topThreeToFix || []);

  const filenameSafe = (meta.jobRole || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`ats-report-${filenameSafe}.pdf`);
}
