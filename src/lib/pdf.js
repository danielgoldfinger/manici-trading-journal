import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// PDFs with subsetted/custom fonts can yield glyphs with incomplete Unicode
// mappings, producing unpaired UTF-16 surrogates. Postgres's JSON input
// rejects these outright ("unsupported Unicode escape sequence"), so strip
// any surrogate code unit that isn't part of a valid high/low pair.
export function stripLoneSurrogates(str) {
  return str.replace(
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
    (match) => match.slice(0, -1)
  );
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
