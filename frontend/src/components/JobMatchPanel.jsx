import { CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

export default function JobMatchPanel({ jobMatch, whyYouMatch, whatYouAreMissing, whatToImproveFirst, hasJobDescription }) {
  const rows = [
    { label: "Skills match", value: jobMatch.skills },
    { label: "Experience match", value: jobMatch.experience },
    { label: "Keyword match", value: jobMatch.keywords },
    { label: "Project relevance", value: jobMatch.projectRelevance },
  ];

  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display font-semibold text-ink">Job match</h3>
          <p className="text-sm text-ink-soft mt-1">
            {hasJobDescription ? "Resume vs. the job description you provided." : "General match based on the job role only — add a job description for more precision."}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-semibold text-ink">{Math.round(jobMatch.overall)}%</div>
          <div className="text-xs text-ink-soft">overall match</div>
        </div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-lg bg-panel px-4 py-3">
            <span className="text-sm text-ink">{r.label}</span>
            <span className="font-mono text-sm font-semibold text-ink">{Math.round(r.value)}%</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
            <CheckCircle2 size={14} className="text-good" />
            Why you match
          </div>
          <ul className="space-y-1.5">
            {(whyYouMatch?.length ? whyYouMatch : ["Add a job description for a tailored match summary."]).map((item, i) => (
              <li key={i} className="text-sm text-ink-soft flex gap-2">
                <span className="text-good mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
            <AlertCircle size={14} className="text-warn" />
            What you're missing
          </div>
          <ul className="space-y-1.5">
            {(whatYouAreMissing?.length ? whatYouAreMissing : ["No major gaps detected."]).map((item, i) => (
              <li key={i} className="text-sm text-ink-soft flex gap-2">
                <span className="text-warn mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {whatToImproveFirst?.length > 0 && (
        <div className="mt-6 pt-5 border-t border-line">
          <div className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2.5">
            <ArrowUpRight size={14} className="text-signal" />
            What to improve first
          </div>
          <ol className="space-y-1.5">
            {whatToImproveFirst.map((item, i) => (
              <li key={i} className="text-sm text-ink-soft flex gap-2.5">
                <span className="font-mono text-xs text-signal mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
