import { AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { severityTone } from "../utils/format.js";

const ICONS = { high: AlertOctagon, medium: AlertTriangle, low: Info };
const COLORS = { high: "text-bad", medium: "text-warn", low: "text-ink-soft" };
const BG = { high: "bg-bad-soft", medium: "bg-warn-soft", low: "bg-panel" };

export default function IssuesPanel({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper p-6">
        <h3 className="font-display font-semibold text-ink">Resume issues detected</h3>
        <p className="mt-3 text-sm text-good">No significant issues detected. Nice work.</p>
      </div>
    );
  }

  const sorted = [...issues].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <h3 className="font-display font-semibold text-ink">Resume issues detected</h3>
      <p className="text-sm text-ink-soft mt-1">{issues.length} issue(s) found, ordered by severity.</p>
      <div className="mt-5 space-y-3">
        {sorted.map((issue, i) => {
          const Icon = ICONS[issue.severity] || Info;
          return (
            <div key={i} className={`flex gap-3 rounded-lg p-3.5 ${BG[issue.severity]}`}>
              <Icon size={16} className={`shrink-0 mt-0.5 ${COLORS[issue.severity]}`} />
              <p className="text-sm text-ink leading-relaxed">{issue.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
