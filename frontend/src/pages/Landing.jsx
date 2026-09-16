import { Link } from "react-router-dom";
import {
  ScanLine, Target, ListChecks, Sparkles, ShieldCheck, ArrowRight,
  FileText, SearchCheck, Wand2, TrendingUp,
} from "lucide-react";

const features = [
  { icon: Target, title: "Real ATS scoring", body: "A deterministic scoring engine checks keywords, skills, structure, and content quality — not a random number." },
  { icon: ListChecks, title: "Section-by-section breakdown", body: "See exactly how your summary, experience, projects, and skills each score, with specific fixes for each." },
  { icon: SearchCheck, title: "Keyword & job matching", body: "Paste any job description to see matched and missing keywords, plus an overall job-fit percentage." },
  { icon: Wand2, title: "AI rewrite suggestions", body: "Weak bullet points get rewritten with stronger action verbs and measurable outcomes, ready to copy." },
  { icon: TrendingUp, title: "Improvement simulator", body: "Preview an estimated score after applying specific fixes, before you spend time rewriting." },
  { icon: ShieldCheck, title: "No account, nothing stored", body: "Analyze instantly with no sign-up. Your resume isn't kept on our servers after analysis." },
];

const steps = [
  { title: "Add your resume", body: "Upload a PDF, DOCX, or TXT file, or paste your resume text directly." },
  { title: "Target a role", body: "Enter the job title and, optionally, paste the full job description." },
  { title: "Get your ATS score", body: "A hybrid engine combines deterministic checks with AI analysis for a 0–100 score." },
  { title: "Fix what matters", body: "Work through prioritized recommendations, rewrites, and a missing-keyword list." },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line relative overflow-hidden">
        <div className="container-page py-20 sm:py-28 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm text-ink-soft mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-good" />
              No sign-up required
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-semibold tracking-tight text-ink">
              Know exactly why your resume isn't getting past the scanner.
            </h1>
            <p className="mt-6 text-lg text-ink-soft max-w-xl leading-relaxed">
              Scanline runs your resume through the same kind of checks an ATS uses — keyword matching, section
              structure, formatting, and content quality — and tells you precisely what to fix, in plain language.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-base font-medium text-paper transition-colors hover:bg-signal-dark"
              >
                Analyze your resume
                <ArrowRight size={17} />
              </Link>
              <Link to="/how-it-works" className="text-sm font-medium text-ink-soft hover:text-ink underline underline-offset-4">
                See how scoring works
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <ScoreShowcase />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-20 sm:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Built to explain the score, not just show it
          </h2>
          <p className="mt-3 text-ink-soft leading-relaxed">
            Most resume checkers give you a vague number. Scanline breaks the score into categories you can act on
            immediately.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line rounded-xl overflow-hidden border border-line">
          {features.map((f) => (
            <div key={f.title} className="bg-paper p-6 hover:bg-panel/60 transition-colors">
              <f.icon size={20} strokeWidth={1.75} className="text-signal" />
              <h3 className="mt-4 font-display font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-panel/50">
        <div className="container-page py-20 sm:py-24">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">From resume to fixes in under a minute</h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="font-mono text-sm text-signal mb-3">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-display font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 sm:py-24 text-center">
        <FileText size={26} className="mx-auto text-ink-soft" strokeWidth={1.5} />
        <h2 className="mt-5 font-display text-2xl sm:text-3xl font-semibold tracking-tight">Ready to see your score?</h2>
        <p className="mt-3 text-ink-soft">It takes about a minute, and nothing is saved without your say-so.</p>
        <Link
          to="/analyze"
          className="mt-7 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-base font-medium text-paper transition-colors hover:bg-signal-dark"
        >
          Start free analysis
          <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}

function ScoreShowcase() {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const score = 78;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-line bg-paper shadow-panel p-6 sm:p-7 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 overflow-hidden opacity-[0.08]">
        <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-signal to-transparent animate-scan-line" />
      </div>
      <div className="flex items-center justify-between">
        <span className="label-mono">ats_score.result</span>
        <ScanLine size={16} className="text-ink-soft" />
      </div>
      <div className="mt-6 flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#E4E7EB" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={radius} fill="none" stroke="#1D9A6C" strokeWidth="10"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-semibold text-ink">{score}</span>
            <span className="text-[11px] text-ink-soft">/ 100</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <MiniBar label="Keyword match" value={81} tone="good" />
          <MiniBar label="Skills match" value={72} tone="warn" />
          <MiniBar label="Structure" value={90} tone="good" />
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-line flex items-center gap-2 text-sm text-ink-soft">
        <Sparkles size={15} className="text-signal" />
        Strong match — 2 missing keywords found
      </div>
    </div>
  );
}

function MiniBar({ label, value, tone }) {
  const colors = { good: "bg-good", warn: "bg-warn", bad: "bg-bad" };
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-ink-soft">{label}</span>
        <span className="font-mono text-ink">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-panel overflow-hidden">
        <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
