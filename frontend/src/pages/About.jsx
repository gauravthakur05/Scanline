import { Link } from "react-router-dom";
import { FileText, Cpu, Sparkles, ListChecks, ArrowRight, ArrowDown } from "lucide-react";

const pipeline = [
  { icon: FileText, title: "Resume", body: "You upload a PDF/DOCX/TXT file or paste your resume text. Files are parsed in memory and never permanently stored." },
  { icon: Cpu, title: "Parsing", body: "The backend extracts raw text, detects section headings, contact details, bullet points, and known skills/tools." },
  { icon: ListChecks, title: "Deterministic scoring", body: "A rules-based engine calculates category scores for keywords, skills, structure, content quality, and completeness — the same inputs always produce the same score." },
  { icon: Sparkles, title: "AI analysis", body: "When an AI key is configured, an LLM adds qualitative feedback, rewrite suggestions, and a final verdict — grounded in the deterministic facts, never inventing new skills or experience." },
];

const weights = [
  { label: "Keyword Match", value: 25 },
  { label: "ATS Compatibility", value: 20 },
  { label: "Skills Match", value: 20 },
  { label: "Experience Relevance", value: 15 },
  { label: "Content Quality", value: 10 },
  { label: "Section Completeness", value: 10 },
];

export default function About() {
  return (
    <div className="container-page py-16 sm:py-20">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">How the scoring actually works</h1>
        <p className="mt-4 text-ink-soft leading-relaxed">
          Scanline is a hybrid system: most of your score comes from deterministic, explainable checks. AI is layered
          on top for feedback and rewrite suggestions — it never determines the score by itself.
        </p>
      </div>

      <div className="mt-14 space-y-0">
        {pipeline.map((step, i) => (
          <div key={step.title} className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-panel">
                <step.icon size={18} className="text-signal" strokeWidth={1.75} />
              </span>
              {i < pipeline.length - 1 && <ArrowDown size={14} className="text-line my-2" />}
            </div>
            <div className="pb-8">
              <h3 className="font-display font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft leading-relaxed max-w-lg">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-line bg-panel/50 p-6 sm:p-8">
        <h2 className="font-display font-semibold text-lg">Score weighting</h2>
        <p className="mt-1.5 text-sm text-ink-soft">The overall 0–100 ATS score is a weighted average of six categories.</p>
        <div className="mt-6 space-y-4">
          {weights.map((w) => (
            <div key={w.label} className="flex items-center gap-4">
              <span className="w-44 shrink-0 text-sm text-ink">{w.label}</span>
              <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-signal rounded-full" style={{ width: `${w.value * 4}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-sm text-ink-soft">{w.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        <div className="rounded-xl border border-line p-6">
          <h3 className="font-display font-semibold">Demo Mode</h3>
          <p className="mt-2 text-sm text-ink-soft leading-relaxed">
            If no AI API key is configured on the backend, Scanline still runs the full deterministic engine and
            generates feedback from templates built on your actual results. Results are clearly labeled
            "Demo Analysis" so you always know which mode produced them.
          </p>
        </div>
        <div className="rounded-xl border border-line p-6">
          <h3 className="font-display font-semibold">Your data</h3>
          <p className="mt-2 text-sm text-ink-soft leading-relaxed">
            There's no account system. Uploaded files are parsed in memory and discarded. Your last few analyses are
            optionally saved in your browser's local storage only — never on our servers.
          </p>
        </div>
      </div>

      <div className="mt-14 text-center">
        <Link to="/analyze" className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-base font-medium text-paper hover:bg-signal-dark transition-colors">
          Try it on your resume
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}
