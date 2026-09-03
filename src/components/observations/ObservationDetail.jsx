import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SETUP_TYPE_LABELS } from '../../lib/score';
import { PASS_REASON_LABELS, FREEZE_CAUSE_LABELS, OUTCOME_LABELS, OUTCOME_COLORS } from '../../lib/observations';
import { useObservations } from '../../hooks/useObservations';
import Checklist from '../checklist/Checklist';

const BUCKET = 'observation-screenshots';

export default function ObservationDetail({ obs, onClose, onUpdated }) {
  const { updateOutcome } = useObservations();
  const [outcome, setOutcome] = useState(obs.outcome ?? '');
  const [outcomePts, setOutcomePts] = useState(obs.outcome_pts ?? '');
  const [outcomeNotes, setOutcomeNotes] = useState(obs.outcome_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState(null);

  useEffect(() => {
    if (obs.screenshot_url) {
      supabase.storage.from(BUCKET).createSignedUrl(obs.screenshot_url, 3600)
        .then(({ data }) => setScreenshotUrl(data?.signedUrl ?? null));
    }
  }, [obs.screenshot_url]);

  const allCheckIds = Object.keys(obs).filter(k => k.startsWith('c_'));
  const checks = Object.fromEntries(allCheckIds.map(id => [id, obs[id]]));

  async function saveOutcome(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateOutcome(obs.id, {
        outcome:       outcome || null,
        outcome_pts:   outcomePts !== '' ? parseFloat(outcomePts) : null,
        outcome_notes: outcomeNotes || null,
      });
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold">
            {SETUP_TYPE_LABELS[obs.setup_type] ?? obs.setup_type}
            {obs.fb_level ? <span className="ml-2 font-normal text-gray-500">@ {obs.fb_level}</span> : null}
          </h2>
          <p className="text-sm text-gray-500">
            {obs.obs_date} {obs.obs_time?.slice(0, 5) ?? ''} &middot; Score: <strong>{obs.setup_score ?? 0}%</strong>
          </p>
        </div>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">✕ Close</button>
      </div>

      {/* Meta */}
      <section className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
        <MetaRow label="Pass reason" value={PASS_REASON_LABELS[obs.pass_reason] ?? obs.pass_reason} />
        {obs.freeze_cause && <MetaRow label="Freeze cause" value={FREEZE_CAUSE_LABELS[obs.freeze_cause] ?? obs.freeze_cause} />}
        {obs.flush_low && <MetaRow label="Flush low" value={obs.flush_low} />}
        {obs.flush_depth != null && <MetaRow label="Flush depth" value={`${obs.flush_depth} pts (${obs.flush_depth_cat})`} />}
        <MetaRow label="Pre-planned" value={obs.was_pre_planned ? 'Yes' : 'No'} />
        {obs.had_confirmation_but_froze && (
          <MetaRow label="Froze w/ criteria met" value="Yes" valueClass="text-amber-600 dark:text-amber-400" />
        )}
      </section>

      {obs.real_time_notes && (
        <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <p className="mb-1 text-xs font-medium text-gray-500">Real-time notes</p>
          <p className="text-sm">{obs.real_time_notes}</p>
        </section>
      )}

      {screenshotUrl && (
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Screenshot</p>
          <a href={screenshotUrl} target="_blank" rel="noopener noreferrer">
            <img src={screenshotUrl} alt="Observation screenshot" className="max-h-96 w-full rounded border border-gray-200 object-contain dark:border-gray-800" />
          </a>
        </section>
      )}

      {/* Checklist replay (read-only) */}
      <section>
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Checklist at time of observation</p>
        <Checklist checks={checks} onToggle={() => {}} setupType={obs.setup_type} readOnly />
      </section>

      {/* Outcome capture */}
      <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <p className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Outcome (update after the fact)</p>
        <form onSubmit={saveOutcome} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Result</span>
            <select value={outcome} onChange={e => setOutcome(e.target.value)} className={inputClass}>
              <option value="">Not yet set</option>
              {Object.entries(OUTCOME_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Points move (if resolved)</span>
            <input type="number" step="0.25" value={outcomePts} onChange={e => setOutcomePts(e.target.value)} className={inputClass} placeholder="e.g. 12" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Outcome notes</span>
            <textarea rows={2} value={outcomeNotes} onChange={e => setOutcomeNotes(e.target.value)} className={inputClass} />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save outcome'}
          </button>
        </form>
      </section>
    </div>
  );
}

function MetaRow({ label, value, valueClass = '' }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}
