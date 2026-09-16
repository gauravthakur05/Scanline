import { History, Trash2, X } from "lucide-react";
import { formatDate, scoreTone, toneClasses } from "../utils/format.js";

export default function HistoryPanel({ history, onSelect, onDelete, onClear }) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={16} className="text-ink-soft" />
          <h3 className="font-display font-semibold text-sm text-ink">Recent analyses</h3>
        </div>
        <button onClick={onClear} className="text-xs text-ink-soft hover:text-bad">
          Clear all
        </button>
      </div>
      <div className="mt-3 space-y-1.5">
        {history.map((item) => {
          const tone = scoreTone(item.atsScore);
          const { text } = toneClasses(tone);
          return (
            <div key={item.id} className="group flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-panel transition-colors">
              <button onClick={() => onSelect(item)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                <span className={`font-mono text-sm font-semibold shrink-0 ${text}`}>{item.atsScore}</span>
                <span className="text-sm text-ink truncate">{item.jobRole}</span>
                <span className="text-xs text-ink-soft shrink-0 ml-auto">{formatDate(item.savedAt)}</span>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-bad transition-opacity shrink-0"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
