import { toneClasses, scoreTone } from "../utils/format.js";

const EXPLANATIONS = {
  summary: { good: "Clear and tailored to the role.", warn: "Present but could be more targeted.", bad: "Missing or too generic." },
  skills: { good: "Strong overlap with target role.", warn: "Some relevant skills present.", bad: "Limited overlap with target role." },
  experience: { good: "Strong action verbs and measurable results.", warn: "Some bullet points need stronger phrasing.", bad: "Needs stronger action verbs and metrics." },
  projects: { good: "Relevant and well-described.", warn: "Present, could use more detail.", bad: "Missing or underdeveloped." },
  education: { good: "Complete and clearly presented.", warn: "Present, minor gaps.", bad: "Missing or incomplete." },
  formatting: { good: "Clean, ATS-friendly structure.", warn: "Some formatting issues detected.", bad: "Formatting likely to cause parsing issues." },
};

const SUGGESTIONS = {
  summary: "Add 2-3 sentences naming your target role and top skills.",
  skills: "Add genuinely-held skills that appear in the job description.",
  experience: "Start bullets with action verbs and add measurable outcomes.",
  projects: "List technologies used and any measurable impact.",
  education: "Include degree, institution, and graduation year.",
  formatting: "Use a single-column layout with standard section headings.",
};

const LABELS = { summary: "Summary", skills: "Skills", experience: "Experience", projects: "Projects", education: "Education", formatting: "Formatting" };

export default function SectionScoreCards({ sectionScores }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <h3 className="font-display font-semibold text-ink">Section-by-section score</h3>
      <p className="text-sm text-ink-soft mt-1">Individual scores for each part of your resume.</p>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(sectionScores).map(([key, score]) => {
          const tone = scoreTone(score);
          const { text, bg } = toneClasses(tone);
          return (
            <div key={key} className="rounded-lg border border-line p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-ink">{LABELS[key] || key}</span>
                <span className={`font-mono text-sm font-semibold px-2 py-0.5 rounded-md ${text} ${bg}`}>{Math.round(score)}%</span>
              </div>
              <p className="mt-2 text-xs text-ink-soft leading-relaxed">{EXPLANATIONS[key]?.[tone]}</p>
              <p className="mt-2 text-xs text-signal">{SUGGESTIONS[key]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
