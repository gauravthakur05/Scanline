import { useLocation, useNavigate, Link } from "react-router-dom";
import { Download, RefreshCw, AlertTriangle } from "lucide-react";
import ScoreRing from "../components/ScoreRing.jsx";
import BreakdownPanel from "../components/BreakdownPanel.jsx";
import SectionScoreCards from "../components/SectionScoreCards.jsx";
import KeywordPanel from "../components/KeywordPanel.jsx";
import JobMatchPanel from "../components/JobMatchPanel.jsx";
import IssuesPanel from "../components/IssuesPanel.jsx";
import RecommendationsPanel from "../components/RecommendationsPanel.jsx";
import RewritesPanel from "../components/RewritesPanel.jsx";
import ImprovementSimulator from "../components/ImprovementSimulator.jsx";
import StrengthsPanel from "../components/StrengthsPanel.jsx";
import FinalVerdictPanel from "../components/FinalVerdictPanel.jsx";
import DetailPanel from "../components/DetailPanel.jsx";
import { downloadAtsReport } from "../utils/report.js";
import { useToast } from "../components/Toast.jsx";

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (!state?.analysis) {
    return (
      <div className="container-page py-24 text-center">
        <AlertTriangle size={28} className="mx-auto text-ink-soft" />
        <h1 className="mt-4 font-display text-2xl font-semibold">No analysis to show</h1>
        <p className="mt-2 text-ink-soft">Run an analysis first to see your results here.</p>
        <Link to="/analyze" className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-signal-dark transition-colors">
          Go to analyzer
        </Link>
      </div>
    );
  }

  const { analysis, payload } = state;

  const handleDownload = () => {
    try {
      downloadAtsReport(analysis, { jobRole: payload.jobRole });
      showToast("Report downloaded.", "success");
    } catch {
      showToast("Couldn't generate the report. Please try again.", "error");
    }
  };

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Your ATS results</h1>
          <p className="mt-2 text-ink-soft">
            For <span className="text-ink font-medium">{payload.jobRole}</span>
            {analysis.mode === "demo" && (
              <span className="ml-2 rounded-full bg-warn-soft text-warn px-2 py-0.5 text-xs font-medium">Demo Analysis</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/analyze")} className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink hover:border-ink-soft transition-colors">
            <RefreshCw size={14} />
            Re-analyze
          </button>
          <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-signal-dark transition-colors">
            <Download size={14} />
            Download report
          </button>
        </div>
      </div>

      {/* Score hero */}
      <div className="mt-10 rounded-xl border border-line bg-panel/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
        <ScoreRing score={analysis.atsScore} category={analysis.scoreCategory} />
        <div className="flex-1">
          <p className="text-sm text-ink-soft">ATS Score</p>
          <p className="mt-1 text-ink leading-relaxed">
            {analysis.qualitative.finalVerdict.split(".")[0]}.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="text-ink-soft">Resume words: <span className="text-ink font-medium">{analysis.meta.resumeWordCount}</span></span>
            <span className="text-ink-soft">Job match: <span className="text-ink font-medium">{Math.round(analysis.jobMatch.overall)}%</span></span>
            <span className="text-ink-soft">Keyword match: <span className="text-ink font-medium">{analysis.keywords.percentage ?? "—"}%</span></span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-8">
        <BreakdownPanel breakdown={analysis.breakdown} />
        <JobMatchPanel
          jobMatch={analysis.jobMatch}
          whyYouMatch={analysis.qualitative.whyYouMatch}
          whatYouAreMissing={analysis.qualitative.whatYouAreMissing}
          whatToImproveFirst={analysis.qualitative.whatToImproveFirst}
          hasJobDescription={analysis.hasJobDescription}
        />
      </div>

      <div className="mt-8">
        <SectionScoreCards sectionScores={analysis.sectionScores} />
      </div>

      <div className="mt-8">
        <DetailPanel contact={analysis.contact} skills={analysis.skills} />
      </div>

      <div className="mt-8">
        <KeywordPanel keywords={analysis.keywords} />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-8">
        <IssuesPanel issues={analysis.issues} />
        <StrengthsPanel strengths={analysis.strengths} />
      </div>

      <div className="mt-8">
        <RecommendationsPanel recommendations={analysis.qualitative.recommendations} />
      </div>

      <div className="mt-8">
        <RewritesPanel rewrites={analysis.qualitative.rewrites} />
      </div>

      <div className="mt-8">
        <ImprovementSimulator formPayload={payload} />
      </div>

      <div className="mt-8">
        <FinalVerdictPanel
          verdict={analysis.qualitative.finalVerdict}
          topThreeToFix={analysis.qualitative.topThreeToFix}
          mode={analysis.mode}
        />
      </div>
    </div>
  );
}
