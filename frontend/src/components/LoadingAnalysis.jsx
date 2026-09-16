import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";

const MESSAGES = [
  "Analyzing your resume…",
  "Checking ATS compatibility…",
  "Matching keywords…",
  "Evaluating resume structure…",
  "Scoring content quality…",
];

export default function LoadingAnalysis() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-paper/90 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="relative mx-auto h-16 w-16 rounded-xl border border-line bg-panel flex items-center justify-center overflow-hidden">
          <ScanLine size={26} className="text-signal" />
          <div className="absolute inset-x-0 h-6 bg-gradient-to-b from-signal/25 to-transparent animate-scan-line" />
        </div>
        <p className="mt-6 font-display font-semibold text-lg text-ink transition-all">{MESSAGES[index]}</p>
        <p className="mt-2 text-sm text-ink-soft">This usually takes a few seconds.</p>
        <div className="mt-6 h-1 w-full rounded-full bg-panel overflow-hidden">
          <div className="h-full w-1/3 bg-signal rounded-full animate-[loadbar_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
      <style>{`
        @keyframes loadbar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
