import { scoreTone, toneClasses } from "../utils/format.js";

export default function ScoreRing({ score, category, size = 168 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const tone = scoreTone(score);
  const { ring, text } = toneClasses(tone);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E4E7EB" strokeWidth="12" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={ring} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-semibold text-ink">{score}</span>
        <span className="text-xs text-ink-soft">out of 100</span>
        <span className={`mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${text} bg-panel`}>{category}</span>
      </div>
    </div>
  );
}
