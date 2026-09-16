import mammoth from "mammoth";
import { getExtension } from "../utils/validators.js";

// pdf-parse ships a debug harness in its index.js entrypoint that tries to
// read a local test file when required directly under certain conditions.
// Importing the internal lib file avoids that entirely and is the documented
// workaround for using pdf-parse inside bundlers/servers.
import pdfParseLib from "pdf-parse/lib/pdf-parse.js";

class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "ParseError";
    this.isParseError = true;
  }
}

export async function extractTextFromFile(file) {
  const ext = getExtension(file.originalname);

  if (!file.buffer || file.buffer.length === 0) {
    throw new ParseError("The uploaded file appears to be empty.");
  }

  try {
    if (ext === "pdf") {
      const data = await pdfParseLib(file.buffer);
      const text = (data.text || "").trim();
      if (!text) {
        throw new ParseError(
          "We couldn't extract text from this PDF. It may be a scanned image rather than a text-based PDF. Try pasting your resume text instead."
        );
      }
      return normalizeText(text);
    }

    if (ext === "docx") {
      const { value } = await mammoth.extractRawText({ buffer: file.buffer });
      const text = (value || "").trim();
      if (!text) {
        throw new ParseError("We couldn't extract text from this DOCX file. Try pasting your resume text instead.");
      }
      return normalizeText(text);
    }

    if (ext === "txt") {
      const text = file.buffer.toString("utf-8").trim();
      if (!text) {
        throw new ParseError("This text file appears to be empty.");
      }
      return normalizeText(text);
    }

    throw new ParseError("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
  } catch (err) {
    if (err.isParseError) throw err;
    throw new ParseError(
      "We ran into a problem reading this file. It may be corrupted, password-protected, or in an unsupported format. Try pasting your resume text instead."
    );
  }
}

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export { ParseError };
