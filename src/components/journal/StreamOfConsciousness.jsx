import { useCallback, useEffect, useRef, useState } from 'react';
import { useDailyJournal } from '../../hooks/useDailyJournal';
import JournalImageUpload from './JournalImageUpload';

export default function StreamOfConsciousness({ journalDate, initialValue = '', initialImages = [] }) {
  const [text, setText] = useState(initialValue);
  const [streamImages, setStreamImages] = useState(initialImages);
  const [savedAt, setSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const { updateStream, upsertEntry } = useDailyJournal();
  const timerRef = useRef(null);
  const latestText = useRef(text);
  latestText.current = text;

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await updateStream(journalDate, latestText.current);
      setSavedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [journalDate, updateStream]);

  async function handleImagesChange(paths) {
    setStreamImages(paths);
    await upsertEntry(journalDate, { stream_images: paths });
  }

  useEffect(() => { setText(initialValue); }, [initialValue]);
  useEffect(() => { setStreamImages(initialImages); }, [initialImages]);

  function handleChange(e) {
    setText(e.target.value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, 30_000);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          onBlur={save}
          rows={10}
          placeholder="Unfiltered thoughts — no structure, no prompts, no word limits."
          className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800 focus:border-purple-300 focus:outline-none dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-200"
          style={{ minHeight: '200px' }}
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {saving ? 'Saving…' : savedAt ? `Saved ${savedAt}` : ''}
          <span className="ml-2">{text.length.toLocaleString()} chars</span>
        </div>
      </div>
      <JournalImageUpload journalDate={journalDate} section="stream" paths={streamImages} onPathsChange={handleImagesChange} />
    </div>
  );
}
