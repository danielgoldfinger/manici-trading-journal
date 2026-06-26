import { useState } from 'react';

export default function NewsletterUpload({ date, onDateChange, onParse, parsing }) {
  const [text, setText] = useState('');

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
