import { useRef, useState } from 'react';
import { extractPdfText } from '../../lib/pdf';

export default function NewsletterUpload({ date, onDateChange, onParse, parsing }) {
  const [text, setText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtractError(null);
    setExtracting(true);
    try {
      const extracted = await extractPdfText(file);
      setText(extracted);
    } catch (err) {
      setExtractError(`Could not read PDF: ${err.message}`);
    } finally {
      setExtracting(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={extracting}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 disabled:opacity-50"
        >
          {extracting ? 'Reading PDF…' : 'Upload PDF…'}
        </button>
        <span className="text-xs text-gray-400">or paste the raw text below</span>
      </div>
      {extractError && <p className="text-xs text-red-600">{extractError}</p>}

      <textarea
        rows={10}
        placeholder="Paste the raw newsletter text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      <button
        onClick={() => onParse(text)}
        disabled={parsing || !text.trim()}
        className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {parsing ? 'Parsing…' : 'Parse newsletter'}
      </button>
    </div>
  );
}
