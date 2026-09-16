import { useState } from "react";
import { Loader2, TrendingUp, Info } from "lucide-react";
import { simulateImprovements } from "../services/api.js";
import { useToast } from "./Toast.jsx";

const OPTIONS = [
  { key: "addMissingKeywords", label: "Add missing keywords" },
  { key: "improveSummary", label: "Improve professional summary" },
  { key: "addMeasurableAchievements", label: "Add measurable achievements" },
  { key: "improveProjectDescriptions", label: "Improve project descriptions" },
  { key: "addRelevantSkills", label: "Add relevant skills" },
  { key: "fixFormattingIssues", label: "Fix formatting issues" },
];

export default function ImprovementSimulator({ formPayload }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { showToast } = useToast();

  const toggle = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const run = async () => {
    if (selected.length === 0) {
      showToast("Select at least one improvement to simulate.", "error");
      return;
    }
    setLoading(true);
    try {
      const data = await simulateImprovements({ ...formPayload, selectedImprovements: selected });
      setResult(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-signal" />
        <h3 className="font-display font-semibold text-ink">Improve my score</h3>
      </div>
      <p className="text-sm text-ink-soft mt-1">Select changes you're considering to preview an estimated score.</p>

      <div className="mt-5 grid sm:grid-cols-2 gap-2.5">
        {OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
              selected.includes(opt.key) ? "border-signal bg-signal-soft text-ink" : "border-line text-ink-soft hover:border-ink-soft"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.key)}
              onChange={() => toggle(opt.key)}
              className="accent-[#2F5DFF]"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-signal-dark transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Estimating…" : "Estimate new score"}
      </button>

      {result && (
        <div className="mt-6 pt-5 border-t border-line">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-mono text-2xl text-ink-soft">{result.before}</div>
              <div className="text-xs text-ink-soft mt-1">Before</div>
            </div>
            <div className="flex-1 h-px bg-line" />
            <div className="text-center">
              <div className="font-mono text-2xl font-semibold text-good">{result.after}</div>
              <div className="text-xs text-ink-soft mt-1">Estimated after</div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-panel px-3.5 py-2.5">
            <Info size={14} className="text-ink-soft shrink-0 mt-0.5" />
            <p className="text-xs text-ink-soft leading-relaxed">{result.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
