// pdfExtractor.js — extracts MCQ questions from a PDF using pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';

// Point to the pdf.js worker bundled with the package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extract all text from a PDF file (File object).
 * Returns a single string with all pages concatenated.
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

/**
 * Parse raw text into MCQ question objects.
 * Handles common formats:
 *   Q1. Question text?     or    1. Question text?
 *   (A) option / A) option / A. option
 *   Answer: A  /  Ans: B  /  Correct Answer: C
 */
export function parseQuestionsFromText(rawText) {
  const lines = rawText.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
  const questions = [];
  let current = null;

  const questionRegex = /^(?:Q\.?\s*)?(\d+)[.)]\s+(.+)/i;
  const optionRegex   = /^\(?([A-Da-d])\)?[.)]\s+(.+)/i;
  const answerRegex   = /(?:ans(?:wer)?|correct\s*(?:answer)?|key)\s*[:\-]?\s*([A-Da-d])/i;

  for (const line of lines) {
    const qMatch = questionRegex.exec(line);
    const oMatch = optionRegex.exec(line);
    const aMatch = answerRegex.exec(line);

    if (qMatch) {
      // Save previous question
      if (current && current.question) questions.push(finalize(current));
      current = { question: qMatch[2].trim(), options: {}, answer: '' };
    } else if (oMatch && current) {
      current.options[oMatch[1].toUpperCase()] = oMatch[2].trim();
    } else if (aMatch && current) {
      current.answer = aMatch[1].toUpperCase();
    } else if (current && !current.question.endsWith('?') && qMatch === null && oMatch === null) {
      // continuation of question text
      current.question += ' ' + line;
    }
  }

  // Last question
  if (current && current.question) questions.push(finalize(current));

  return questions;
}

function finalize(q) {
  // Ensure 4 options even if some are missing
  const opts = ['A', 'B', 'C', 'D'].map(k => q.options[k] || '');
  return {
    id: Date.now() + Math.random(),
    question: q.question.trim(),
    options: opts,   // [A, B, C, D]
    answer: q.answer || 'A',
    type: 'mcq',
    difficulty: 'Medium',
  };
}
