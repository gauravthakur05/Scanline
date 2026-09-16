# Scanline — AI-Powered ATS Resume Analyzer

A full-stack web application that analyzes a resume against a target job role/description, produces a real,
explainable ATS score (0–100), and gives prioritized, actionable feedback. No sign-up required.

## Overview

Scanline uses a **hybrid scoring approach**:

1. A deterministic, rules-based engine (backend) computes real scores for keyword matching, skills matching,
   section structure, formatting, content quality, and completeness. These scores are consistent and explainable —
   the same resume + job info always produces the same score.
2. An AI layer (Anthropic API) adds qualitative feedback — recommendations, rewrite suggestions, and a final
   verdict — grounded strictly in the deterministic facts. It never invents skills or experience.
3. If no AI API key is configured, the app automatically runs in **Demo Mode**: qualitative feedback is generated
   from templates built on the same real deterministic facts, and clearly labeled "Demo Analysis" in the UI.

Nothing is stored server-side. Uploaded resumes are parsed in memory and discarded after the response is sent.
An optional analysis history (last 8 analyses) is stored only in the browser's `localStorage`.

## Features

- Upload (PDF / DOCX / TXT) or paste your resume
- Target job role, job description (optional), experience level, and industry
- 0–100 ATS score with category (Excellent / Strong / Good / Needs Improvement / Poor)
- Six-category weighted score breakdown (ATS Compatibility, Keyword Match, Skills Match, Experience Relevance,
  Content Quality, Section Completeness)
- Section-by-section scores (Summary, Skills, Experience, Projects, Education, Formatting)
- Keyword match analysis (matched / missing / recommended, with copy-to-clipboard)
- Job match analysis (skills / experience / keyword / project relevance percentages)
- Detected resume issues (missing sections, weak phrasing, missing metrics, formatting problems, etc.)
- Prioritized recommendations (high / medium / low) with problem, why, how-to-fix, and example
- AI rewrite suggestions for weak bullet points, with copy button
- "Improve My Score" simulator — estimate score impact of specific changes (clearly labeled as an estimate)
- Resume strengths and a final verdict with top-3 fixes
- Downloadable PDF report (generated client-side)
- Analysis history in the browser (view, re-open, delete, clear)
- Demo Mode fallback when no AI key is configured — the app is fully functional either way

## Tech Stack

**Frontend:** React 18, Vite, React Router, Tailwind CSS, lucide-react icons, jsPDF
**Backend:** Node.js, Express, Multer (file uploads), pdf-parse, mammoth (DOCX), Anthropic SDK, Helmet, CORS,
express-rate-limit

## Architecture

```
ats-resume-analyzer/
├── backend/
│   ├── server.js                  # Express app entrypoint
│   ├── src/
│   │   ├── routes/resume.routes.js
│   │   ├── controllers/resume.controller.js
│   │   ├── services/
│   │   │   ├── parser.service.js      # PDF/DOCX/TXT text extraction
│   │   │   ├── keyword.service.js     # keyword extraction & matching
│   │   │   ├── scoring.service.js     # deterministic ATS scoring engine
│   │   │   ├── ai.service.js          # Anthropic API integration + demo fallback
│   │   │   └── simulator.service.js   # "Improve My Score" estimator
│   │   ├── middleware/ (upload, rate limiting, error handling)
│   │   └── utils/ (validators, skill/keyword dictionaries)
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/ (Landing, Analyzer, Results, About)
    │   ├── components/ (score ring, breakdown panels, keyword panel, recommendations, etc.)
    │   ├── services/api.js
    │   ├── hooks/useAnalysisHistory.js
    │   └── utils/ (formatting, PDF report generation)
    └── vite.config.js
```

## Environment Variables

Backend `.env` (copy from `backend/.env.example`):

```
PORT=5000
FRONTEND_URL=http://localhost:5173

# Optional — without this, the app runs in Demo Mode automatically.
AI_API_KEY=
```

`AI_API_KEY` should be an Anthropic API key (`sk-ant-...`) if you want live AI-generated feedback. Get one at
https://console.anthropic.com/. **Never commit your real key** — `.env` is gitignored.

## Installation & Running Locally

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# (optional) edit .env and add your AI_API_KEY
npm run dev
```

The API starts on `http://localhost:5000`. Without `AI_API_KEY` set, it automatically runs in Demo Mode — fully
functional, just using template-based qualitative feedback instead of live AI calls.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173` and proxies `/api/*` requests to the backend automatically (see
`vite.config.js`).

Open `http://localhost:5173` in your browser.

### Production build

```bash
cd frontend
npm run build   # outputs static files to frontend/dist
npm run preview # preview the production build locally
```

Serve `frontend/dist` with any static host, and run the backend with `npm start`. Update `FRONTEND_URL` in the
backend `.env` to match your deployed frontend origin (for CORS).

## API Endpoints

| Method | Endpoint              | Description                                                        |
|--------|-----------------------|----------------------------------------------------------------------|
| GET    | `/api/health`         | Health check + current AI mode (`live` or `demo`)                   |
| POST   | `/api/resume/parse`   | Upload a PDF/DOCX/TXT file (`multipart/form-data`, field `resume`) and get back extracted text |
| POST   | `/api/resume/analyze` | Full analysis: `{ resumeText, jobRole, jobDescription?, experienceLevel?, industry? }` |
| POST   | `/api/resume/score`   | Deterministic score only (faster, no AI/demo qualitative layer)     |
| POST   | `/api/resume/improve` | Simulate score impact: adds `selectedImprovements: string[]` to the analyze payload |

All endpoints return JSON. Errors return `{ "error": "human-readable message" }` with an appropriate HTTP status
code (400 for validation, 422 for unparseable files, 429 for rate limiting, 500 for unexpected errors).

### Improvement keys for `/api/resume/improve`

`addMissingKeywords`, `improveSummary`, `addMeasurableAchievements`, `improveProjectDescriptions`,
`addRelevantSkills`, `fixFormattingIssues`

## PDF / DOCX Parsing Notes

- **PDF:** Extracted via `pdf-parse`. Scanned/image-only PDFs (no embedded text layer) cannot be parsed — the app
  returns a friendly error suggesting the user paste their resume text instead.
- **DOCX:** Extracted via `mammoth` (raw text extraction).
- **TXT:** Read directly as UTF-8.
- File uploads are limited to 5MB and validated by extension; content is never written to disk (in-memory buffer
  only) and is discarded once the response is sent.

## Security Considerations

- `helmet` for standard HTTP security headers
- `cors` restricted to the configured `FRONTEND_URL`
- `express-rate-limit` on the general API and specifically on the analyze/score/improve endpoints
- File type allowlist (pdf/docx/txt) and 5MB size limit enforced by Multer
- Request body size limited to 1MB for JSON payloads
- No resumes or personal data persisted server-side; no database
- AI API key is only ever used server-side and is never exposed to the frontend

## Deployment Notes

- Deploy the backend (e.g. Render, Railway, Fly.io, a VM) with `AI_API_KEY` and `FRONTEND_URL` set as environment
  variables.
- Deploy the frontend static build (e.g. Vercel, Netlify, Cloudflare Pages) and point it at your backend's public
  URL — either via a reverse proxy/rewrite rule matching `vite.config.js`'s `/api` proxy, or by updating
  `frontend/src/services/api.js`'s `API_BASE` to your backend's full URL.
- Ensure `FRONTEND_URL` on the backend matches your deployed frontend's exact origin for CORS to work.

## Demo Mode

If `AI_API_KEY` is missing or the Anthropic API call fails for any reason, the backend automatically falls back to
a deterministic, template-based qualitative analysis built from the same real scoring facts (no fabricated AI
output). The frontend always reflects this via a `mode: "demo"` field and a visible "Demo Analysis" badge on the
results page and PDF report — it's never presented as if it were live AI output.
