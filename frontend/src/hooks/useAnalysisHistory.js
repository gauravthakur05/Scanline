import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "scanline_analysis_history_v1";
const MAX_HISTORY = 8;

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage may be unavailable (private browsing, quota) -- fail silently.
  }
}

export function useAnalysisHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const addToHistory = useCallback((entry) => {
    setHistory((prev) => {
      const next = [
        {
          id: `${Date.now()}`,
          savedAt: new Date().toISOString(),
          ...entry,
        },
        ...prev,
      ].slice(0, MAX_HISTORY);
      writeHistory(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeHistory([]);
  }, []);

  return { history, addToHistory, deleteEntry, clearHistory };
}
