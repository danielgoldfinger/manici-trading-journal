import { useRef, useState } from 'react';
import RatingSlider from './RatingSlider';
import JournalImageUpload from './JournalImageUpload';
import { useDailyJournal } from '../../hooks/useDailyJournal';

const RISK_POSTURES = [
  { value: 'normal',            label: 'Normal' },
  { value: 'profit_protection', label: 'Profit protection' },
  { value: 'recovering_loss',   label: 'Recovering loss' },
  { value: 'cautious',          label: 'Cautious' },
  { value: 'sit_out',           label: 'Sitting out' },
];

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

export default function PreSessionForm({ journalDate, entry, onSaved }) {
  const { completePreSession, upsertEntry } = useDailyJournal();
  const [form, setForm] = useState({
    pre_mental_state:    entry?.pre_mental_state    ?? null,
    pre_focus_level:     entry?.pre_focus_level     ?? null,
    pre_fomo_intensity:  entry?.pre_fomo_intensity  ?? null,
    pre_loss_aversion:   entry?.pre_loss_aversion   ?? null,
    pre_patience_level:  entry?.pre_patience_level  ?? null,
    pre_market_theme:    entry?.pre_market_theme    ?? '',
    pre_bias:            entry?.pre_bias            ?? null,
    pre_bias_reason:     entry?.pre_bias_reason     ?? '',
    pre_planned_levels:  entry?.pre_planned_levels  ?? '',
    pre_trigger_conditions: entry?.pre_trigger_conditions ?? '',
    pre_risk_posture:    entry?.pre_risk_posture    ?? 'normal',
    pre_external_factors: entry?.pre_external_factors ?? '',
    pre_session_goal:    entry?.pre_session_goal    ?? '',
  });
  const [preImages, setPreImages] = useState(entry?.pre_images ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [autoSavedAt, setAutoSavedAt] = useState(null);
  const autoSaveTimer = useRef(null);
  const latestForm = useRef(form);
  const latestImages = useRef(preImages);
  latestForm.current = form;
  latestImages.current = preImages;
  const completed = entry?.pre_session_completed;

  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await upsertEntry(journalDate, { ...latestForm.current, pre_images: latestImages.current });
        setAutoSavedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      } catch { /* silent */ }
    }, 1500);
  }

  function set(key, val) {
    setForm(p => ({ ...p, [key]: val }));
    scheduleAutoSave();
  }

  function setImages(paths) {
    setPreImages(paths);
    scheduleAutoSave();
  }

  async function save(markComplete = false) {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, pre_images: preImages };
      if (markComplete) {
        await completePreSession(journalDate, payload, entry?.pre_session_time);
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
          <span>Completed {entry.pre_session_time ? new Date(entry.pre_session_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
        </div>
      )}

      {/* Ratings */}
      <section className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <RatingSlider label="Mental state" name="pre_mental_state" value={form.pre_mental_state} onChange={v => set('pre_mental_state', v)} />
        <RatingSlider label="Focus level" name="pre_focus_level" value={form.pre_focus_level} onChange={v => set('pre_focus_level', v)} />
        <RatingSlider label="FOMO intensity ↑ = risk" name="pre_fomo_intensity" value={form.pre_fomo_intensity} onChange={v => set('pre_fomo_intensity', v)} danger />
        <RatingSlider label="Loss aversion ↑ = risk" name="pre_loss_aversion" value={form.pre_loss_aversion} onChange={v => set('pre_loss_aversion', v)} danger />
        <RatingSlider label="Patience level" name="pre_patience_level" value={form.pre_patience_level} onChange={v => set('pre_patience_level', v)} />
      </section>

      {/* Context */}
      <section className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <Field label="Market theme this week">
          <textarea rows={2} value={form.pre_market_theme} onChange={e => set('pre_market_theme', e.target.value)} className={inputClass} placeholder="Brief — what's the broader context?" />
        </Field>

        <div>
          <span className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">Session bias</span>
          <div className="flex gap-2">
            {['bullish','neutral','bearish'].map(b => (
              <button
                key={b}
                type="button"
                onClick={() => set('pre_bias', form.pre_bias === b ? null : b)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                  form.pre_bias === b
                    ? b === 'bullish' ? 'bg-green-100 text-green-800 ring-1 ring-green-400 dark:bg-green-900/40 dark:text-green-300'
                    : b === 'bearish' ? 'bg-red-100 text-red-800 ring-1 ring-red-400 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-gray-200 text-gray-700 ring-1 ring-gray-400 dark:bg-gray-700 dark:text-gray-200'
                    : 'border border-gray-300 text-gray-500 dark:border-gray-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <Field label="Why this bias?">
          <textarea rows={2} value={form.pre_bias_reason} onChange={e => set('pre_bias_reason', e.target.value)} className={inputClass} placeholder="What price structure or plan context drives it?" />
        </Field>

        <Field label="Pre-planned levels and triggers">
          <textarea rows={3} value={form.pre_planned_levels} onChange={e => set('pre_planned_levels', e.target.value)} className={inputClass} placeholder={'If [level] flushes by [X pts] and recovers with acceptance in the 8-11am window, I enter.'} />
        </Field>

        <Field label="If/then entry conditions">
          <textarea rows={2} value={form.pre_trigger_conditions} onChange={e => set('pre_trigger_conditions', e.target.value)} className={inputClass} placeholder="Specific conditions required before pulling the trigger" />
        </Field>

        <Field label="Risk posture today">
          <select value={form.pre_risk_posture} onChange={e => set('pre_risk_posture', e.target.value)} className={inputClass}>
            {RISK_POSTURES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>

        <Field label="External factors (sleep, stress, life events)">
          <textarea rows={2} value={form.pre_external_factors} onChange={e => set('pre_external_factors', e.target.value)} className={inputClass} placeholder="Optional" />
        </Field>

        <Field label="Today's process goal">
          <textarea rows={2} value={form.pre_session_goal} onChange={e => set('pre_session_goal', e.target.value)} className={inputClass} placeholder="One specific process goal — not P&L related" />
        </Field>

        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Images (charts, screenshots)</span>
          <JournalImageUpload journalDate={journalDate} section="pre" paths={preImages} onPathsChange={setImages} />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => save(true)} disabled={saving} className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
          {completed ? 'Update' : 'Mark complete'}
        </button>
        {autoSavedAt && !saving && (
          <span className="text-xs text-gray-400">Auto-saved {autoSavedAt}</span>
        )}
        {saving && <span className="text-xs text-gray-400">Saving…</span>}
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
