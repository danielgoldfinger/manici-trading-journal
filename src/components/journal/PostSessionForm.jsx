import { useState } from 'react';
import RatingSlider from './RatingSlider';
import AdherenceChecklist from './AdherenceChecklist';
import EmotionalEventLogger from './EmotionalEventLogger';
import JournalImageUpload from './JournalImageUpload';
import { useDailyJournal } from '../../hooks/useDailyJournal';

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

const ADHERENCE_KEYS = [
  'adhered_to_levels','adhered_to_window','adhered_to_one_trade',
  'adhered_to_stop','adhered_to_t1','adhered_to_runner',
  'avoided_impulse_trades','followed_preplan',
];

export default function PostSessionForm({ journalDate, entry, onSaved }) {
  const { completePostSession, upsertEntry, addEmotionalEvent, removeEmotionalEvent, updateEmotionalEvent } = useDailyJournal();

  const [form, setForm] = useState({
    traded_today:           entry?.traded_today           ?? null,
    post_execution_quality: entry?.post_execution_quality ?? null,
    post_mental_state:      entry?.post_mental_state      ?? null,
    post_energy_level:      entry?.post_energy_level      ?? null,
    post_session_summary:   entry?.post_session_summary   ?? '',
    post_what_learned:      entry?.post_what_learned      ?? '',
    post_do_differently:    entry?.post_do_differently    ?? '',
    ...ADHERENCE_KEYS.reduce((acc, k) => ({ ...acc, [k]: entry?.[k] ?? null }), {}),
  });
  const [events, setEvents] = useState(entry?.emotional_events ?? []);
  const [postImages, setPostImages] = useState(entry?.post_images ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const completed = entry?.post_session_completed;

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function handleAddEvent(event) {
    const updated = await addEmotionalEvent(journalDate, event, events);
    setEvents(updated.emotional_events ?? []);
  }

  async function handleRemoveEvent(id) {
    const updated = await removeEmotionalEvent(journalDate, id, events);
    setEvents(updated.emotional_events ?? []);
  }

  async function handleEditEvent(id, updates) {
    const updated = await updateEmotionalEvent(journalDate, id, updates, events);
    setEvents(updated.emotional_events ?? []);
  }

  async function handleEventImagesUpdate(eventId, removedPath) {
    const updated = await updateEmotionalEvent(
      journalDate, eventId,
      { images: (events.find(e => e.id === eventId)?.images ?? []).filter(p => p !== removedPath) },
      events
    );
    setEvents(updated.emotional_events ?? []);
  }

  async function save(markComplete = false) {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, post_images: postImages };
      if (markComplete) {
        await completePostSession(journalDate, payload);
      } else {
        await upsertEntry(journalDate, payload);
      }
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {completed && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <span className="text-base">✓</span>
          <span>Completed {entry.post_session_time ? new Date(entry.post_session_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
        </div>
      )}

      {/* Traded today */}
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <input
          type="checkbox"
          checked={form.traded_today === true}
          onChange={e => set('traded_today', e.target.checked ? true : false)}
          className="h-4 w-4 accent-purple-600"
        />
        <span className="text-sm font-medium">I traded today</span>
        {form.traded_today === false && (
          <span className="text-xs text-gray-400">No-trade day</span>
        )}
      </label>

      {/* Ratings */}
      <section className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <div>
          <RatingSlider label="Execution quality" name="post_execution_quality" value={form.post_execution_quality} onChange={v => set('post_execution_quality', v)} />
          <p className="mt-1.5 pl-36 text-xs text-gray-400">Rate your process, not your P&L. Following every rule on a losing day = 10.</p>
        </div>
        <RatingSlider label="Mental state (end)" name="post_mental_state" value={form.post_mental_state} onChange={v => set('post_mental_state', v)} />
        <RatingSlider label="Energy level (end)" name="post_energy_level" value={form.post_energy_level} onChange={v => set('post_energy_level', v)} />
      </section>

      {/* Adherence */}
      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Adherence — tap to toggle yes / no</p>
        <AdherenceChecklist
          values={form}
          onChange={(key, val) => set(key, val)}
        />
      </section>

      {/* Narrative */}
      <section className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <Field label="Session summary — what did ES do today?">
          <textarea rows={3} value={form.post_session_summary} onChange={e => set('post_session_summary', e.target.value)} className={inputClass} />
        </Field>
        <Field label="What I learned today">
          <textarea rows={2} value={form.post_what_learned} onChange={e => set('post_what_learned', e.target.value)} className={inputClass} placeholder="Single most important lesson or observation" />
        </Field>
        <Field label="What I would do differently">
          <textarea rows={2} value={form.post_do_differently} onChange={e => set('post_do_differently', e.target.value)} className={inputClass} placeholder="Specific and actionable — not self-criticism" />
        </Field>
      </section>

      {/* Emotional events */}
      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Emotional events</p>
        <EmotionalEventLogger
          events={events}
          onAdd={handleAddEvent}
          onRemove={handleRemoveEvent}
          onEdit={handleEditEvent}
          onUpdateImages={handleEventImagesUpdate}
          journalDate={journalDate}
        />
      </section>

      {/* Post-session images */}
      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Images</p>
        <JournalImageUpload journalDate={journalDate} section="post" paths={postImages} onPathsChange={setPostImages} />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => save(false)} disabled={saving} className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400">
          Save draft
        </button>
        <button type="button" onClick={() => save(true)} disabled={saving} className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
          {completed ? 'Update' : 'Mark complete'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {children}
    </label>
  );
}
