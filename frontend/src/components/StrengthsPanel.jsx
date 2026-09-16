import { CheckCircle2 } from "lucide-react";

export default function StrengthsPanel({ strengths }) {
  if (!strengths || strengths.length === 0) return null;
  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <h3 className="font-display font-semibold text-ink">Resume strengths</h3>
      <p className="text-sm text-ink-soft mt-1">What's already working well.</p>
      <ul className="mt-4 space-y-2.5">
        {strengths.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
            <CheckCircle2 size={16} className="text-good shrink-0 mt-0.5" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
