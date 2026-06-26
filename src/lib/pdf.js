import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const LONE_SURROGATE_RE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g;
const UNSAFE_CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;

// PDFs with subsetted/custom fonts can yield glyphs with incomplete Unicode
// mappings — producing unpaired UTF-16 surrogates and/or literal NUL/control
// characters. Postgres's JSON input rejects these outright ("unsupported
// Unicode escape sequence"), so strip them before this text reaches the DB.
export function stripLoneSurrogates(str) {
  const noSurrogates = str.replace(LONE_SURROGATE_RE, (match) => match.slice(0, -1));
  return noSurrogates.replace(UNSAFE_CONTROL_CHAR_RE, '');
}

export async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    pageTexts.push(pageText);
  }

  return stripLoneSurrogates(pageTexts.join('\n\n'));
}
