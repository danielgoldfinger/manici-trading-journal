import { useState, useEffect } from 'react';

const RUN_TYPES = ['easy','tempo','intervals','long'];

function calcPace(distMi, durationMins) {
  if (!distMi || !durationMins || distMi <= 0) return '';
  const minsPerMile = durationMins / distMi;
  const mins = Math.floor(minsPerMile);
  const secs = Math.round((minsPerMile - mins) * 60);
  return `${mins}:${String(secs).padStart(2,'0')}/mi`;
}

export default function RunForm({ run, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: run?.date ?? today,
    distance_miles: run?.distance_miles ?? '',
    duration_mins: run?.duration_mins ?? '',
    run_type: run?.run_type ?? 'easy',
    route: run?.route ?? '',
    felt_score: run?.felt_score ?? '',
    notes: run?.notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  const pace = calcPace(parseFloat(form.distance_miles), parseInt(form.duration_mins));

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: run?.id,
      ...form,
      distance_miles: parseFloat(form.distance_miles),
      duration_mins: parseInt(form.duration_mins),
      felt_score: form.felt_score ? parseInt(form.felt_score) : null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-md bg-[#1a1d27] border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1d27] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{run ? 'Edit Run' : 'Log Run'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25" required/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Run type</label>
              <select value={form.run_type} onChange={e => set('run_type', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25">
                {RUN_TYPES.map(t => <option key={t} value={t} className="bg-[#1a1d27]">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Distance + Duration + Pace */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Distance (mi)</label>
              <input type="number" value={form.distance_miles} onChange={e => set('distance_miles', e.target.value)}
                placeholder="4.2" step="0.1" min="0.1"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25" required/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
              <input type="number" value={form.duration_mins} onChange={e => set('duration_mins', e.target.value)}
                placeholder="38" min="1"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25" required/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Pace</label>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-sm font-mono text-teal-400">
                {pace || '—'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">How it felt (1–5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => set('felt_score', n)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${form.felt_score === n ? 'bg-teal-500/30 text-teal-400 border border-teal-500/40' : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Route</label>
            <input type="text" value={form.route} onChange={e => set('route', e.target.value)}
              placeholder="e.g. Cherry Creek Trail out-and-back"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"/>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="How did it go?"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/25"/>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-sm font-semibold text-white transition-colors">
            {saving ? 'Saving…' : run ? 'Update run' : 'Save run'}
          </button>
        </form>
      </div>
    </div>
  );
}
