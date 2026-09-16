import { useState } from "react";
import { Copy, CheckCheck, ArrowRight } from "lucide-react";

export default function RewritesPanel({ rewrites }) {
  if (!rewrites || rewrites.length === 0) return null;

  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <h3 className="font-display font-semibold text-ink">Rewrite suggestions</h3>
      <p className="text-sm text-ink-soft mt-1">Weak lines from your resume, rewritten to be stronger.</p>
      <div className="mt-5 space-y-4">
        {rewrites.map((r, i) => (
          <RewriteCard key={i} rewrite={r} />
        ))}
      </div>
    </div>
  );
}

function RewriteCard({ rewrite }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rewrite.improved);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="rounded-lg border border-line p-4">
      <div className="flex items-start gap-2">
        <span className="label-mono shrink-0 mt-0.5">Current</span>
      </div>
      <p className="mt-1 text-sm text-ink-soft line-through">{rewrite.original}</p>

      <div className="my-3 flex items-center gap-2 text-ink-soft/60">
        <ArrowRight size={14} />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="label-mono">Suggested</span>
          <p className="mt-1 text-sm text-ink font-medium leading-relaxed">{rewrite.improved}</p>
        </div>
        <button
          onClick={copy}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink hover:border-signal transition-colors"
        >
          {copied ? <CheckCheck size={13} className="text-good" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
