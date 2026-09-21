import { useState, useEffect, useCallback } from 'react';
import { useFitness } from '../hooks/useFitness';
import GymForm from '../components/fitness/GymForm';
import RunForm from '../components/fitness/RunForm';

// ── helpers ────────────────────────────────────────────────────────────────

function toDateStr(d) { return d.toISOString().slice(0,10); }

function weekStart(d) {
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  mon.setHours(0,0,0,0);
  return mon;
}

function weekOf(dateStr) { return weekStart(new Date(dateStr + 'T12:00:00')); }

function calcPace(dist, mins) {
  if (!dist || !mins) return '';
  const mpm = mins / dist;
  const m = Math.floor(mpm), s = Math.round((mpm - m) * 60);
  return `${m}:${String(s).padStart(2,'0')}/mi`;
}

function fmtDate(ds) {
  const d = new Date(ds + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const RUN_TYPE_COLOR = { easy: '#2dd4bf', tempo: '#f0a050', intervals: '#e05555', long: '#a78bfa' };
const WORKOUT_TYPE_COLOR = { strength: '#4caf50', conditioning: '#f08030', mixed: '#6fa3e0' };

// ── sub-components ─────────────────────────────────────────────────────────

function MileageBar({ weeks }) {
  if (!weeks.length) return null;
  const max = Math.max(...weeks.map(w => w.miles), 1);
  return (
    <div className="space-y-1.5">
      {weeks.map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 w-14 text-right flex-shrink-0">{w.label}</span>
          <div className="flex-1 h-4 rounded bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{ width: `${(w.miles / max) * 100}%`, background: w.isCurrentWeek ? '#2dd4bf' : '#2dd4bf60' }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-gray-400 w-12 flex-shrink-0">{w.miles.toFixed(1)} mi</span>
          {w.rampWarning && <span className="text-[10px] text-amber-400">⚠</span>}
        </div>
      ))}
    </div>
  );
}

function PRCard({ workouts, runs }) {
  const fastestPace = runs.reduce((best, r) => {
    const mpm = r.duration_mins / r.distance_miles;
    return !best || mpm < best.mpm ? { mpm, pace: calcPace(r.distance_miles, r.duration_mins), date: r.date } : best;
  }, null);

  const longestRun = runs.reduce((best, r) =>
    !best || r.distance_miles > best.distance_miles ? r : best, null);

  // Heaviest lift per exercise across all workouts
  const liftMap = {};
  for (const w of workouts) {
    for (const ex of w.workout_exercises ?? []) {
      if (!ex.weight_lbs) continue;
      if (!liftMap[ex.name] || ex.weight_lbs > liftMap[ex.name].weight_lbs) {
        liftMap[ex.name] = { weight_lbs: ex.weight_lbs, date: w.date };
      }
    }
  }
  const topLifts = Object.entries(liftMap)
    .sort((a,b) => b[1].weight_lbs - a[1].weight_lbs)
    .slice(0, 5);

  if (!fastestPace && !longestRun && !topLifts.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal Records</h3>
      <div className="grid grid-cols-2 gap-3">
        {fastestPace && (
          <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3">
            <p className="text-[10px] text-teal-400/70 uppercase tracking-wider">Fastest pace</p>
            <p className="text-lg font-bold text-teal-400 font-mono">{fastestPace.pace}</p>
            <p className="text-[10px] text-gray-600">{fmtDate(fastestPace.date)}</p>
          </div>
        )}
        {longestRun && (
          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
            <p className="text-[10px] text-purple-400/70 uppercase tracking-wider">Longest run</p>
            <p className="text-lg font-bold text-purple-400">{longestRun.distance_miles.toFixed(1)} mi</p>
            <p className="text-[10px] text-gray-600">{fmtDate(longestRun.date)}</p>
          </div>
        )}
      </div>
      {topLifts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider">Top lifts</p>
          {topLifts.map(([name, { weight_lbs, date }]) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{name}</span>
              <span className="text-xs font-semibold text-green-400">{weight_lbs} lbs</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────

export default function Fitness() {
  const [tab, setTab]           = useState('all');   // 'all' | 'gym' | 'run'
  const [workouts, setWorkouts] = useState([]);
  const [runs, setRuns]         = useState([]);
  const [modal, setModal]       = useState(null);    // null | 'gym' | 'run'
  const [editing, setEditing]   = useState(null);
  const { fetchWorkouts, fetchRuns, saveWorkout, deleteWorkout, saveRun, deleteRun } = useFitness();

  const load = useCallback(async () => {
    const [w, r] = await Promise.all([fetchWorkouts(50), fetchRuns(50)]);
    setWorkouts(w);
    setRuns(r);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── weekly mileage data ──────────────────────────────────────────────────
  const weeklyMileage = (() => {
    const map = {};
    const today = new Date();
    // build 8 week buckets
    for (let i = 7; i >= 0; i--) {
      const mon = new Date(weekStart(today));
      mon.setDate(mon.getDate() - i * 7);
      const key = toDateStr(mon);
      map[key] = { miles: 0, label: mon.toLocaleDateString('en-US',{month:'short',day:'numeric'}), isCurrentWeek: i === 0 };
    }
    for (const r of runs) {
      const key = toDateStr(weekOf(r.date));
      if (map[key]) map[key].miles += r.distance_miles;
    }
    const weeks = Object.values(map);
    // 10% ramp-up flag
    for (let i = 1; i < weeks.length; i++) {
      if (weeks[i-1].miles > 0 && weeks[i].miles > weeks[i-1].miles * 1.1) {
        weeks[i].rampWarning = true;
      }
    }
    return weeks;
  })();

  const currentWeek = weeklyMileage[weeklyMileage.length - 1];
  const lastWeek    = weeklyMileage[weeklyMileage.length - 2];

  // ── this week counts ─────────────────────────────────────────────────────
  const todayMonday = toDateStr(weekStart(new Date()));
  const gymThisWeek = workouts.filter(w => toDateStr(weekOf(w.date)) === todayMonday).length;
  const runThisWeek = runs.filter(r => toDateStr(weekOf(r.date)) === todayMonday).length;

  // ── combined feed ────────────────────────────────────────────────────────
  const feed = [
    ...workouts.map(w => ({ ...w, _kind: 'gym' })),
    ...runs.map(r => ({ ...r, _kind: 'run' })),
  ].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 30);

  const filtered = tab === 'all' ? feed : feed.filter(s => s._kind === tab);

  async function handleSaveWorkout(data) { await saveWorkout(data); await load(); }
  async function handleSaveRun(data)     { await saveRun(data); await load(); }

  async function handleDelete(item) {
    if (!confirm('Delete this session?')) return;
    if (item._kind === 'gym') await deleteWorkout(item.id);
    else await deleteRun(item.id);
    await load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Weekly summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Gym sessions', value: gymThisWeek, color: '#4caf50' },
          { label: 'Runs', value: runThisWeek, color: '#2dd4bf' },
          { label: 'Miles this week', value: currentWeek.miles.toFixed(1), color: '#2dd4bf', unit: 'mi' },
        ].map(({ label, value, color, unit }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}{unit ? '' : ''}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* 10% ramp warning */}
      {currentWeek.rampWarning && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          <span className="font-bold">⚠ Injury risk</span>
          <span className="text-amber-400/70">· This week's mileage ({currentWeek.miles.toFixed(1)} mi) is &gt;10% higher than last week ({lastWeek.miles.toFixed(1)} mi). Consider scaling back.</span>
        </div>
      )}

      {/* Log buttons */}
      <div className="flex gap-2">
        <button onClick={() => { setEditing(null); setModal('gym'); }}
          className="flex-1 py-2.5 rounded-xl bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-sm font-medium text-green-400 transition-colors">
          + Log Gym
        </button>
        <button onClick={() => { setEditing(null); setModal('run'); }}
          className="flex-1 py-2.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-sm font-medium text-teal-400 transition-colors">
          + Log Run
        </button>
      </div>

      {/* Mileage chart */}
      {runs.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Weekly Mileage (8 weeks)</h3>
          <MileageBar weeks={weeklyMileage} />
        </div>
      )}

      {/* PRs */}
      <PRCard workouts={workouts} runs={runs} />

      {/* Session log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Session Log</h3>
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs">
            {['all','gym','run'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${tab === t ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">No sessions logged yet.</p>
        ) : filtered.map(item => (
          <div key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">{fmtDate(item.date)}</span>
                  {item._kind === 'gym' ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                      style={{ color: WORKOUT_TYPE_COLOR[item.type], borderColor: WORKOUT_TYPE_COLOR[item.type]+'44', background: WORKOUT_TYPE_COLOR[item.type]+'14' }}>
                      {item.type}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                      style={{ color: RUN_TYPE_COLOR[item.run_type], borderColor: RUN_TYPE_COLOR[item.run_type]+'44', background: RUN_TYPE_COLOR[item.run_type]+'14' }}>
                      {item.run_type} run
                    </span>
                  )}
                </div>

                {item._kind === 'gym' ? (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-sm text-white font-medium">
                      Gym{item.duration_mins ? ` · ${item.duration_mins} min` : ''}
                      {item.energy_level ? ` · Energy ${item.energy_level}/5` : ''}
                    </p>
                    {item.workout_exercises?.slice(0,3).map(ex => (
                      <p key={ex.id} className="text-xs text-gray-500">
                        {ex.name}{ex.sets ? ` ${ex.sets}×${ex.reps}` : ''}{ex.weight_lbs ? ` @ ${ex.weight_lbs} lbs` : ''}
                      </p>
                    ))}
                    {(item.workout_exercises?.length ?? 0) > 3 && (
                      <p className="text-xs text-gray-600">+{item.workout_exercises.length - 3} more</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-1">
                    <p className="text-sm text-white font-medium">
                      {item.distance_miles} mi · {item.duration_mins} min
                      {item.distance_miles && item.duration_mins ? ` · ${calcPace(item.distance_miles, item.duration_mins)}` : ''}
                    </p>
                    {item.route && <p className="text-xs text-gray-500">{item.route}</p>}
                  </div>
                )}
                {item.notes && <p className="text-xs text-gray-600 mt-1 italic">{item.notes}</p>}
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditing(item); setModal(item._kind); }}
                  className="text-xs text-gray-600 hover:text-gray-400 px-2 py-1 rounded hover:bg-white/10">
                  Edit
                </button>
                <button onClick={() => handleDelete(item)}
                  className="text-xs text-gray-600 hover:text-red-400 px-2 py-1 rounded hover:bg-white/10">
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms */}
      {modal === 'gym' && (
        <GymForm
          session={editing?._kind === 'gym' ? editing : null}
          onSave={handleSaveWorkout}
          onClose={() => { setModal(null); setEditing(null); }}
        />
      )}
      {modal === 'run' && (
        <RunForm
          run={editing?._kind === 'run' ? editing : null}
          onSave={handleSaveRun}
          onClose={() => { setModal(null); setEditing(null); }}
        />
      )}
    </div>
  );
}
