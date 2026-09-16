import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import ResumeInput from "../components/ResumeInput.jsx";
import JobForm from "../components/JobForm.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import LoadingAnalysis from "../components/LoadingAnalysis.jsx";
import { analyzeResume } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import { useAnalysisHistory } from "../hooks/useAnalysisHistory.js";

export default function Analyzer() {
  const [resumeText, setResumeText] = useState("");
  const [fileMeta, setFileMeta] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { history, addToHistory, deleteEntry, clearHistory } = useAnalysisHistory();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      showToast("Please upload or paste your resume first.", "error");
      return;
    }
    if (!jobRole.trim()) {
      showToast("Please enter the job role you're targeting.", "error");
      return;
    }

    const payload = { resumeText, jobRole, jobDescription, experienceLevel, industry };
    setLoading(true);
    try {
      const analysis = await analyzeResume(payload);
      addToHistory({ jobRole, atsScore: analysis.atsScore, analysis, payload });
      navigate("/results", { state: { analysis, payload } });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (item) => {
    navigate("/results", { state: { analysis: item.analysis, payload: item.payload } });
  };

  return (
    <div className="container-page py-14 sm:py-16">
      {loading && <LoadingAnalysis />}

      <div className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Analyze your resume</h1>
        <p className="mt-3 text-ink-soft leading-relaxed">
          Add your resume and the role you're targeting. A job description is optional but sharpens the analysis.
        </p>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          <section className="rounded-xl border border-line bg-paper p-6 sm:p-7">
            <h2 className="font-display font-semibold text-lg text-ink mb-4">Your resume</h2>
            <ResumeInput
              resumeText={resumeText}
              setResumeText={setResumeText}
              fileMeta={fileMeta}
              setFileMeta={setFileMeta}
            />
          </section>

          <section className="rounded-xl border border-line bg-paper p-6 sm:p-7">
            <h2 className="font-display font-semibold text-lg text-ink mb-4">Target job</h2>
            <JobForm
              jobRole={jobRole} setJobRole={setJobRole}
              jobDescription={jobDescription} setJobDescription={setJobDescription}
              experienceLevel={experienceLevel} setExperienceLevel={setExperienceLevel}
              industry={industry} setIndustry={setIndustry}
            />
          </section>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-ink px-7 py-3.5 text-base font-medium text-paper hover:bg-signal-dark transition-colors disabled:opacity-60"
          >
            <Sparkles size={17} />
            Analyze my resume
            <ArrowRight size={17} />
          </button>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-line bg-panel/50 p-5">
            <p className="text-sm font-medium text-ink mb-2">What happens next</p>
            <ul className="space-y-1.5 text-sm text-ink-soft">
              <li>1. We extract and parse your resume text</li>
              <li>2. A deterministic engine scores structure, keywords, and content</li>
              <li>3. AI (or demo mode) adds feedback and rewrite suggestions</li>
              <li>4. You get a full dashboard with fixes, ranked by priority</li>
            </ul>
          </div>
          <HistoryPanel history={history} onSelect={handleSelectHistory} onDelete={deleteEntry} onClear={clearHistory} />
        </aside>
      </div>
    </div>
  );
}
