import { toneClasses, scoreTone } from "../utils/format.js";

export default function BreakdownPanel({ breakdown }) {
  const entries = Object.values(breakdown);
  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <h3 className="font-display font-semibold text-ink">Score breakdown</h3>
      <p className="text-sm text-ink-soft mt-1">How each category contributes to your overall ATS score.</p>
      <div className="mt-6 space-y-5">
        {entries.map((cat) => {
          const tone = scoreTone(cat.score);
          const { ring } = toneClasses(tone);
          return (
            <div key={cat.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-ink font-medium">{cat.label}</span>
                <span className="text-ink-soft">
                  <span className="font-mono text-ink">{Math.round(cat.score)}</span>
                  <span className="text-ink-soft"> / 100 </span>
                  <span className="text-xs">· {cat.weight}% weight</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-panel overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${cat.score}%`, backgroundColor: ring }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
