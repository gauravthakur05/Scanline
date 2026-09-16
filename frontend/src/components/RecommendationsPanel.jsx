import { useState } from "react";
import { ChevronDown } from "lucide-react";

const PRIORITY_META = {
  high: { label: "High priority", dot: "bg-bad", bg: "bg-bad-soft", text: "text-bad" },
  medium: { label: "Medium priority", dot: "bg-warn", bg: "bg-warn-soft", text: "text-warn" },
  low: { label: "Low priority", dot: "bg-good", bg: "bg-good-soft", text: "text-good" },
};

export default function RecommendationsPanel({ recommendations }) {
  const groups = { high: [], medium: [], low: [] };
  for (const r of recommendations || []) {
    (groups[r.priority] || groups.medium).push(r);
  }

  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <h3 className="font-display font-semibold text-ink">Recommendations</h3>
      <p className="text-sm text-ink-soft mt-1">Prioritized, specific changes based on your actual resume.</p>

      <div className="mt-6 space-y-6">
        {["high", "medium", "low"].map((priority) =>
          groups[priority].length > 0 ? (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2 w-2 rounded-full ${PRIORITY_META[priority].dot}`} />
                <span className={`text-sm font-medium ${PRIORITY_META[priority].text}`}>{PRIORITY_META[priority].label}</span>
              </div>
              <div className="space-y-2.5">
                {groups[priority].map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} />
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-line overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-panel/60 transition-colors"
      >
        <span className="text-sm font-medium text-ink">{rec.problem}</span>
        <ChevronDown size={16} className={`shrink-0 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 text-sm">
          {rec.why && (
            <div>
              <p className="label-mono mb-1">Why it matters</p>
              <p className="text-ink-soft leading-relaxed">{rec.why}</p>
            </div>
          )}
          {rec.howToFix && (
            <div>
              <p className="label-mono mb-1">How to fix it</p>
              <p className="text-ink-soft leading-relaxed">{rec.howToFix}</p>
            </div>
          )}
          {rec.example && (
            <div>
              <p className="label-mono mb-1">Example</p>
              <p className="rounded-md bg-panel px-3 py-2 text-ink font-mono text-xs leading-relaxed">{rec.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
