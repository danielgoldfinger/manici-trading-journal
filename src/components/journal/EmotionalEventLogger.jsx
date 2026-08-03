import { useState } from 'react';

const EMOTIONS = ['FOMO', 'Fear', 'Frustration', 'Greed', 'Hesitation', 'Overconfidence', 'Relief', 'Other'];

function etNow() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/New_York',
  });
}

export default function EmotionalEventLogger({ events = [], onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ time: etNow(), emotion: 'FOMO', trigger: '' });

  function handleAdd() {
    if (!form.trigger.trim()) return;
    onAdd(form);
    setForm({ time: etNow(), emotion: 'FOMO', trigger: '' });
    setOpen(false);
  }

  const inputClass = 'w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';

  return (
    <div className="space-y-2">
      {events.map(e => (
        <div key={e.id} className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800">
          <div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{e.emotion}</span>
            <span className="mx-1.5 text-xs text-gray-400">{e.time} ET</span>
            <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{e.trigger}</p>
          </div>
          <button onClick={() => onRemove(e.id)} className="shrink-0 text-xs text-gray-400 hover:text-red-500">✕</button>
        </div>
      ))}

      {open ? (
        <div className="space-y-2 rounded-lg border border-purple-200 p-3 dark:border-purple-800">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-gray-500">Time (ET)</span>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-gray-500">Emotion</span>
              <select value={form.emotion} onChange={e => setForm(p => ({ ...p, emotion: e.target.value }))} className={inputClass}>
                {EMOTIONS.map(em => <option key={em} value={em}>{em}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-500">What triggered it?</span>
            <textarea
              rows={2}
              value={form.trigger}
              onChange={e => setForm(p => ({ ...p, trigger: e.target.value }))}
              className={inputClass}
              placeholder="Price ran without me, missed the entry, revenge trade urge..."
            />
          </label>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.trigger.trim()} className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Add</button>
            <button onClick={() => setOpen(false)} className="rounded border border-gray-300 px-3 py-1.5 text-xs dark:border-gray-700">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { setForm(p => ({ ...p, time: etNow() })); setOpen(true); }}
          className="rounded border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 dark:border-gray-700 dark:hover:border-purple-600"
        >
          + Add emotional event
        </button>
      )}
    </div>
  );
}
