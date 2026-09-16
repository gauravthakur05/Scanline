import { useState } from "react";
import { Check, AlertTriangle, Lightbulb, Copy, CheckCheck } from "lucide-react";

export default function KeywordPanel({ keywords }) {
  const { matched, missing, percentage, recommended } = keywords;
  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display font-semibold text-ink">Keyword match</h3>
        {percentage !== null && (
          <span className="font-mono text-sm text-ink-soft">
            <span className="text-ink font-semibold">{percentage}%</span> matched
          </span>
        )}
      </div>

      <KeywordGroup
        title="Matched keywords"
        icon={Check}
        tone="good"
        items={matched}
        empty="No direct keyword matches found yet."
      />
      <KeywordGroup
        title="Missing important keywords"
        icon={AlertTriangle}
        tone="warn"
        items={missing}
        empty="No significant gaps found — nice work."
      />
      {recommended?.length > 0 && (
        <div className="mt-5 rounded-lg bg-signal-soft p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <Lightbulb size={15} className="text-signal" />
            Recommended additions
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Only add these if you genuinely have this experience — don't claim skills you don't have.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recommended.map((k) => (
              <CopyChip key={k} value={k} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KeywordGroup({ title, icon: Icon, tone, items, empty }) {
  const toneMap = {
    good: "bg-good-soft text-good",
    warn: "bg-warn-soft text-warn",
  };
  return (
    <div className="mt-5">
      <div className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2.5">
        <Icon size={14} className={tone === "good" ? "text-good" : "text-warn"} />
        {title}
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((k) => (
            <span key={k} className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneMap[tone]}`}>
              {k}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-soft">{empty}</p>
      )}
    </div>
  );
}

function CopyChip({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable
    }
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink hover:border-signal transition-colors"
    >
      {value}
      {copied ? <CheckCheck size={12} className="text-good" /> : <Copy size={12} className="text-ink-soft" />}
    </button>
  );
}
