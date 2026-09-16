const EXPERIENCE_LEVELS = ["Fresher", "Entry Level", "Mid Level", "Senior"];
const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Marketing", "Education", "Retail", "Manufacturing", "Other"];

export default function JobForm({ jobRole, setJobRole, jobDescription, setJobDescription, experienceLevel, setExperienceLevel, industry, setIndustry }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="jobRole">
          Job role / position <span className="text-bad">*</span>
        </label>
        <input
          id="jobRole"
          type="text"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="e.g. Frontend Developer, Data Analyst, Cloud Engineer"
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm placeholder:text-ink-soft/60 focus:border-signal focus:ring-1 focus:ring-signal outline-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="experienceLevel">Experience level</label>
          <select
            id="experienceLevel"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none"
          >
            <option value="">Select level</option>
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="industry">Industry</label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="jobDescription">
          Job description <span className="text-ink-soft font-normal">(optional, but improves accuracy)</span>
        </label>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here for keyword and skill matching…"
          rows={7}
          className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm leading-relaxed placeholder:text-ink-soft/60 focus:border-signal focus:ring-1 focus:ring-signal outline-none resize-y"
        />
        {!jobDescription && (
          <p className="mt-1.5 text-xs text-ink-soft">
            Without a job description, we'll still run a general ATS analysis for this role.
          </p>
        )}
      </div>
    </div>
  );
}
