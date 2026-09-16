import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, Loader2, ClipboardPaste } from "lucide-react";
import { parseResumeFile } from "../services/api.js";
import { useToast } from "./Toast.jsx";

export default function ResumeInput({ resumeText, setResumeText, fileMeta, setFileMeta }) {
  const [mode, setMode] = useState("upload"); // "upload" | "paste"
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const { showToast } = useToast();

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "docx", "txt"].includes(ext)) {
        showToast("Please upload a PDF, DOCX, or TXT file.", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("File is too large. Please upload a file under 5MB.", "error");
        return;
      }
      setUploading(true);
      try {
        const data = await parseResumeFile(file);
        setResumeText(data.resumeText);
        setFileMeta({ name: data.filename, wordCount: data.wordCount, preview: data.preview });
        showToast(`${data.filename} parsed successfully (${data.wordCount} words).`, "success");
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setUploading(false);
      }
    },
    [setResumeText, setFileMeta, showToast]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const clearFile = () => {
    setResumeText("");
    setFileMeta(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div className="flex items-center gap-1 rounded-lg bg-panel p-1 w-fit mb-4">
        <TabButton active={mode === "upload"} onClick={() => setMode("upload")} icon={Upload} label="Upload resume" />
        <TabButton active={mode === "paste"} onClick={() => setMode("paste")} icon={ClipboardPaste} label="Paste resume" />
      </div>

      {mode === "upload" ? (
        <div>
          {fileMeta ? (
            <div className="rounded-lg border border-line bg-panel/60 p-4 flex items-start gap-3">
              <FileText size={20} className="text-signal mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{fileMeta.name}</p>
                <p className="text-xs text-ink-soft mt-0.5">{fileMeta.wordCount} words extracted</p>
                <p className="text-xs text-ink-soft mt-2 line-clamp-2">{fileMeta.preview}</p>
              </div>
              <button onClick={clearFile} className="text-ink-soft hover:text-bad shrink-0" aria-label="Remove file">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
                dragActive ? "border-signal bg-signal-soft" : "border-line hover:border-ink-soft"
              }`}
            >
              {uploading ? (
                <Loader2 size={22} className="animate-spin text-signal" />
              ) : (
                <Upload size={22} className="text-ink-soft" />
              )}
              <p className="text-sm font-medium text-ink">
                {uploading ? "Extracting text…" : "Drop your resume here, or click to browse"}
              </p>
              <p className="text-xs text-ink-soft">PDF, DOCX, or TXT — up to 5MB</p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      ) : (
        <textarea
          value={resumeText}
          onChange={(e) => { setResumeText(e.target.value); if (fileMeta) setFileMeta(null); }}
          placeholder="Paste your full resume text here…"
          rows={12}
          className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm leading-relaxed placeholder:text-ink-soft/60 focus:border-signal focus:ring-1 focus:ring-signal outline-none resize-y"
        />
      )}

      {resumeText && (
        <p className="mt-2 text-xs text-ink-soft">{resumeText.trim().split(/\s+/).filter(Boolean).length} words · {resumeText.length} characters</p>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? "bg-paper text-ink shadow-panel" : "text-ink-soft hover:text-ink"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
