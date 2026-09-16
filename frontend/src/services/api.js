const API_BASE = "/api";

class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new ApiError("The server returned an unexpected response. Please try again.", res.status);
  }
  if (!res.ok) {
    throw new ApiError(data.error || "Something went wrong. Please try again.", res.status, data.fieldErrors);
  }
  return data;
}

export async function parseResumeFile(file) {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await fetch(`${API_BASE}/resume/parse`, { method: "POST", body: formData });
  return handleResponse(res);
}

export async function analyzeResume(payload) {
  const res = await fetch(`${API_BASE}/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function simulateImprovements(payload) {
  const res = await fetch(`${API_BASE}/resume/improve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse(res);
}

export { ApiError };
