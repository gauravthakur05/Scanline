import { Flag } from "lucide-react";

export default function FinalVerdictPanel({ verdict, topThreeToFix, mode }) {
  return (
    <div className="rounded-xl border border-ink bg-ink text-paper p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <Flag size={17} />
        <h3 className="font-display font-semibold">Final verdict</h3>
        {mode === "demo" && (
          <span className="ml-auto rounded-full bg-paper/15 px-2.5 py-0.5 text-[11px] font-medium">Demo Analysis</span>
        )}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-paper/85">{verdict}</p>

      {topThreeToFix?.length > 0 && (
        <div className="mt-6 pt-5 border-t border-paper/15">
          <p className="text-sm font-medium mb-3">Top 3 things to fix</p>
          <ol className="space-y-2">
            {topThreeToFix.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-paper/85">
                <span className="font-mono text-xs text-paper/60 mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
