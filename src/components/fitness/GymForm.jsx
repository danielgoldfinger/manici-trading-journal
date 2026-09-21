import { useState } from 'react';
import { WORKOUT_TEMPLATES } from '../../data/workoutTemplates';

const TYPES = ['strength', 'conditioning', 'mixed'];

function emptyEx() { return { name: '', sets: '', reps: '', weight_lbs: '' }; }

export default function GymForm({ session, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: session?.date ?? today,
    type: session?.type ?? 'strength',
    duration_mins: session?.duration_mins ?? '',
    energy_level: session?.energy_level ?? '',
    notes: session?.notes ?? '',
  });
  const [exercises, setExercises] = useState(
    session?.workout_exercises?.length
      ? session.workout_exercises.map(e => ({ name: e.name, sets: e.sets ?? '', reps: e.reps ?? '', weight_lbs: e.weight_lbs ?? '' }))
      : [emptyEx()]
  );
  const [saving, setSaving] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function applyTemplate(t) {
    set('type', t.type);
    setExercises(t.exercises.map(e => ({ ...e })));
    setTemplateOpen(false);
  }

  function updateEx(i, k, v) {
    setExercises(ex => ex.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  }
  function addEx() { setExercises(ex => [...ex, emptyEx()]); }
  function removeEx(i) { setExercises(ex => ex.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: session?.id,
      ...form,
      duration_mins: form.duration_mins ? parseInt(form.duration_mins) : null,
      energy_level: form.energy_level ? parseInt(form.energy_level) : null,
      exercises: exercises.filter(e => e.name.trim()),
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-lg bg-[#1a1d27] border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1d27] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{session ? 'Edit Workout' : 'Log Gym Session'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date + type + duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25" required/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25">
                {TYPES.map(t => <option key={t} value={t} className="bg-[#1a1d27]">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
              <input type="number" value={form.duration_mins} onChange={e => set('duration_mins', e.target.value)}
                placeholder="60" min="1"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Energy (1–5)</label>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => set('energy_level', n)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${form.energy_level === n ? 'bg-green-500/30 text-green-400 border border-green-500/40' : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Exercises</label>
              <button type="button" onClick={() => setTemplateOpen(!templateOpen)}
                className="text-xs text-gray-500 hover:text-gray-300 border border-white/10 px-2 py-0.5 rounded">
                Templates ▾
              </button>
            </div>

            {templateOpen && (
              <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                {WORKOUT_TEMPLATES.map(t => (
                  <button key={t.name} type="button" onClick={() => applyTemplate(t)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 border-b border-white/[0.06] last:border-0 transition-colors">
                    {t.name} <span className="text-gray-600 text-xs">· {t.exercises.length} exercises</span>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_40px_40px_64px_24px] gap-1.5 px-1">
                {['Exercise','Sets','Reps','lbs',''].map((h,i) => (
                  <span key={i} className="text-[10px] text-gray-600 uppercase">{h}</span>
                ))}
              </div>
              {exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-[1fr_40px_40px_64px_24px] gap-1.5 items-center">
                  <input value={ex.name} onChange={e => updateEx(i,'name',e.target.value)} placeholder="Exercise"
                    className="rounded bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/20"/>
                  <input value={ex.sets} onChange={e => updateEx(i,'sets',e.target.value)} type="number" placeholder="4" min="1"
                    className="rounded bg-white/5 border border-white/10 px-1 py-1.5 text-xs text-white text-center focus:outline-none focus:border-white/20"/>
                  <input value={ex.reps} onChange={e => updateEx(i,'reps',e.target.value)} type="number" placeholder="8" min="1"
                    className="rounded bg-white/5 border border-white/10 px-1 py-1.5 text-xs text-white text-center focus:outline-none focus:border-white/20"/>
                  <input value={ex.weight_lbs} onChange={e => updateEx(i,'weight_lbs',e.target.value)} type="number" placeholder="135" step="2.5"
                    className="rounded bg-white/5 border border-white/10 px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-white/20"/>
                  <button type="button" onClick={() => removeEx(i)} className="text-gray-600 hover:text-red-400 text-sm">✕</button>
                </div>
              ))}
              <button type="button" onClick={addEx}
                className="w-full py-1.5 rounded border border-dashed border-white/10 text-xs text-gray-600 hover:text-gray-400 hover:border-white/20 transition-colors">
                + Add exercise
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="How did it go?"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/25"/>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-semibold text-white transition-colors">
            {saving ? 'Saving…' : session ? 'Update workout' : 'Save workout'}
          </button>
        </form>
      </div>
    </div>
  );
}
