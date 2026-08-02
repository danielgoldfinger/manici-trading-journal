import { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CHECKLISTS, computeScore } from '../../lib/score';
import { PASS_REASON_LABELS, FREEZE_CAUSE_LABELS, FREEZE_REASONS } from '../../lib/observations';
import Checklist from '../checklist/Checklist';
import VerdictBar from '../checklist/VerdictBar';

const ALL_CHECK_IDS = [...new Set(Object.values(CHECKLISTS).flatMap(l => l.map(c => c.id)))];
const emptyChecks = ALL_CHECK_IDS.reduce((acc, id) => ({ ...acc, [id]: false }), {});

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

const emptyForm = {
  obs_date:       new Date().toISOString().slice(0, 10),
  obs_time:       nowTime(),
  setup_type:     'FB',
  fb_level:       '',
  flush_low:      '',
  pass_reason:    '',
  was_pre_planned: false,
  freeze_cause:   '',
  real_time_notes: '',
};

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

export default function ObservationForm({ onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [checks, setChecks] = useState(emptyChecks);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    if (field === 'setup_type') setChecks(emptyChecks);
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleCheck(id) {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const flushDepth = useMemo(() => {
    const fb = parseFloat(form.fb_level);
    const fl = parseFloat(form.flush_low);
    if (!isNaN(fb) && !isNaN(fl)) return (fb - fl).toFixed(2);
    return null;
  }, [form.fb_level, form.flush_low]);

  const score = useMemo(() => computeScore(checks, form.setup_type), [checks, form.setup_type]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.pass_reason) { setError('Pass reason is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const fdNum = (v) => v === '' ? null : parseFloat(v);
      const fd = flushDepth != null ? parseFloat(flushDepth) : null;

      const payload = {
        user_id:        user.id,
        obs_date:       form.obs_date,
        obs_time:       form.obs_time || null,
        setup_type:     form.setup_type,
        fb_level:       fdNum(form.fb_level),
        flush_low:      fdNum(form.flush_low),
        flush_depth:    fd,
        flush_depth_cat: fd != null && fd >= 20 ? 'deep' : 'shallow',
        pass_reason:    form.pass_reason,
        was_pre_planned: form.was_pre_planned,
        freeze_cause:   FREEZE_REASONS.has(form.pass_reason) ? (form.freeze_cause || null) : null,
        real_time_notes: form.real_time_notes || null,
        setup_score:    score,
        had_confirmation_but_froze:
          score >= 70 && FREEZE_REASONS.has(form.pass_reason),
        ...Object.fromEntries(ALL_CHECK_IDS.map(id => [id, !!checks[id]])),
      };

      const { error: err } = await supabase.from('setup_observations').insert(payload);
      if (err) throw err;

      setForm({ ...emptyForm, obs_time: nowTime() });
      setChecks(emptyChecks);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <VerdictBar checks={checks} setupType={form.setup_type} depth="shallow" />

      {/* Fast-entry fields */}
      <section className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-800">
        <Field label="Date">
          <input type="date" value={form.obs_date} onChange={e => update('obs_date', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Time (ET)">
          <input type="time" value={form.obs_time} onChange={e => update('obs_time', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Setup type">
          <select value={form.setup_type} onChange={e => update('setup_type', e.target.value)} className={inputClass}>
            <optgroup label="Mancini">
              <option value="FB">Failed Breakdown</option>
              <option value="LR">Level Reclaim</option>
              <option value="BT">Back-test</option>
              <option value="BD">Breakdown Short</option>
            </optgroup>
            <optgroup label="Ripster — MTF Cloud">
              <option value="R_BRK">MTF Breakout</option>
              <option value="R_FLU">MTF Flush</option>
              <option value="R_MAG">MTF Magnet</option>
              <option value="R_REJ">MTF Rejection</option>
              <option value="R_BNC">MTF Bounce</option>
              <option value="R_CRL">5/12 Curl</option>
              <option value="R_CON">MTF Confluence</option>
            </optgroup>
            <optgroup label="Ripster — EMA Cloud (intraday)">
              <option value="R_512B">5/12 Bounce (long)</option>
              <option value="R_512R">5/12 Reject (short)</option>
              <option value="R_3450B">34-50 Bounce (long)</option>
              <option value="R_3450R">34-50 Reject (short)</option>
            </optgroup>
          </select>
        </Field>
        <Field label="Why not trading (required)">
          <select value={form.pass_reason} onChange={e => update('pass_reason', e.target.value)} className={inputClass} required>
            <option value="">Select reason…</option>
            {Object.entries(PASS_REASON_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Key level (FB level / cloud level)">
          <input type="number" step="0.25" value={form.fb_level} onChange={e => update('fb_level', e.target.value)} className={inputClass} placeholder="e.g. 5500" />
        </Field>
        <Field label="Flush low (leave blank for non-flush setups)">
          <input type="number" step="0.25" value={form.flush_low} onChange={e => update('flush_low', e.target.value)} className={inputClass} placeholder="e.g. 5488" />
          {flushDepth != null && (
            <p className="mt-1 text-xs text-gray-500">Flush depth: {flushDepth} pts ({parseFloat(flushDepth) >= 20 ? 'deep' : 'shallow'})</p>
          )}
        </Field>

        {FREEZE_REASONS.has(form.pass_reason) && (
          <Field label="What specifically stopped you?">
            <select value={form.freeze_cause} onChange={e => update('freeze_cause', e.target.value)} className={inputClass}>
              <option value="">Select…</option>
              {Object.entries(FREEZE_CAUSE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        )}

        <label className="flex items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.was_pre_planned}
            onChange={e => update('was_pre_planned', e.target.checked)}
            className="h-4 w-4 accent-purple-600"
          />
          <span className="text-sm">This level was pre-planned last night</span>
        </label>
      </section>

      {/* Checklist */}
      <section>
        <div className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Score this as you see it <strong>RIGHT NOW</strong> — not as it looks in hindsight. The data is only useful if it reflects your real-time read.
        </div>
        <Checklist checks={checks} onToggle={toggleCheck} setupType={form.setup_type} />
      </section>

      {/* Notes */}
      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <Field label="Real-time notes (optional — what are you thinking right now?)">
          <textarea rows={3} value={form.real_time_notes} onChange={e => update('real_time_notes', e.target.value)} className={inputClass} />
        </Field>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving || !form.pass_reason}
        className="w-full rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Log observation'}
      </button>
    </form>
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
