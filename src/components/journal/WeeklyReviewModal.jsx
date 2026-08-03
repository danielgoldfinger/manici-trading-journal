import { useState } from 'react';
import { useDailyJournal } from '../../hooks/useDailyJournal';

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

export default function WeeklyReviewModal({ journalDate, entry, onClose, onSaved }) {
  const { upsertEntry } = useDailyJournal();
  const [form, setForm] = useState({
    is_weekly_review:        true,
    weekly_win_rate:         entry?.weekly_win_rate         ?? '',
    weekly_execution_avg:    entry?.weekly_execution_avg    ?? '',
    weekly_most_common_flag: entry?.weekly_most_common_flag ?? '',
    weekly_best_trade_why:   entry?.weekly_best_trade_why   ?? '',
    weekly_worst_trade_why:  entry?.weekly_worst_trade_why  ?? '',
    weekly_focus_next_week:  entry?.weekly_focus_next_week  ?? '',
    weekly_mental_trend:     entry?.weekly_mental_trend     ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function save() {
    setSaving(true);
    try {
      await upsertEntry(journalDate, form);
      // Remember we showed it this week
      localStorage.setItem('lastWeeklyReview', journalDate);
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold">Weekly review</h2>
            <p className="mt-0.5 text-sm text-gray-500">5 minutes to close the week with intention.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">✕</button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Win rate this week (%)">
              <input type="number" min={0} max={100} step={1} value={form.weekly_win_rate} onChange={e => set('weekly_win_rate', e.target.value)} className={inputClass} placeholder="e.g. 67" />
            </Field>
            <Field label="Avg execution quality">
              <input type="number" min={1} max={10} step={0.1} value={form.weekly_execution_avg} onChange={e => set('weekly_execution_avg', e.target.value)} className={inputClass} placeholder="auto-filled above" />
            </Field>
          </div>

          <Field label="Most common discipline flag this week">
            <input type="text" value={form.weekly_most_common_flag} onChange={e => set('weekly_most_common_flag', e.target.value)} className={inputClass} placeholder="e.g. Held runner too long" />
          </Field>

          <Field label="Best trade — why was the process good?">
            <textarea rows={2} value={form.weekly_best_trade_why} onChange={e => set('weekly_best_trade_why', e.target.value)} className={inputClass} />
          </Field>

          <Field label="Worst trade — what specifically went wrong in the process?">
            <textarea rows={2} value={form.weekly_worst_trade_why} onChange={e => set('weekly_worst_trade_why', e.target.value)} className={inputClass} />
          </Field>

          <Field label="ONE thing to focus on next week">
            <textarea rows={2} value={form.weekly_focus_next_week} onChange={e => set('weekly_focus_next_week', e.target.value)} className={inputClass} placeholder="Single focus only — not a list" />
          </Field>

          <div>
            <span className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">Mental state trend this week</span>
            <div className="flex gap-2">
              {['improving','stable','declining'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('weekly_mental_trend', form.weekly_mental_trend === t ? null : t)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                    form.weekly_mental_trend === t
                      ? t === 'improving' ? 'bg-green-100 text-green-800 ring-1 ring-green-400 dark:bg-green-900/40 dark:text-green-300'
                      : t === 'declining' ? 'bg-red-100 text-red-800 ring-1 ring-red-400 dark:bg-red-900/40 dark:text-red-300'
                      : 'bg-gray-200 text-gray-700 ring-1 ring-gray-400 dark:bg-gray-700 dark:text-gray-200'
                      : 'border border-gray-300 text-gray-500 dark:border-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Skip</button>
          <button onClick={save} disabled={saving} className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save review'}
          </button>
        </div>
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

export function shouldShowWeeklyReview(journalDate) {
  const day = new Date(journalDate + 'T12:00:00').getDay(); // 5 = Friday
  if (day !== 5) return false;
  const last = localStorage.getItem('lastWeeklyReview');
  return last !== journalDate;
}
