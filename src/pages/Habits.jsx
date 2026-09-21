import { useState, useEffect, useCallback, useRef } from 'react';
import { getHabitsForDay } from '../data/habitDefinitions';
import { useHabits } from '../hooks/useHabits';
import HabitHeatmap from '../components/habits/HabitHeatmap';

function toDateStr(d) { return d.toISOString().slice(0, 10); }

function offsetDate(base, offset) {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d;
}

const DAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(d) {
  return `${DAY_FULL[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Compute current streak (perfect days in a row going back from yesterday)
function computeStreak(logs, referenceDate) {
  let streak = 0;
  const d = new Date(referenceDate);
  d.setDate(d.getDate() - 1); // start from yesterday
  for (let i = 0; i < 90; i++) {
    const ds = toDateStr(d);
    const habits = getHabitsForDay(d.getDay());
    if (habits.length === 0) { d.setDate(d.getDate() - 1); continue; }
    const done = habits.filter(h => logs[`${ds}|${h.id}`]).length;
    if (done === habits.length) { streak++; } else { break; }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function Habits() {
  const today = new Date();
  today.setHours(0,0,0,0);

  const [dateOffset, setDateOffset] = useState(0); // 0 = today
  const [logs, setLogs]             = useState({});
  const [noteOpen, setNoteOpen]     = useState({}); // habitId → bool
  const [noteDraft, setNoteDraft]   = useState({}); // habitId → string
  const [saving, setSaving]         = useState(null);
  const { fetchLogs, toggleHabit, saveNote } = useHabits();

  const viewDate    = offsetDate(today, dateOffset);
  const viewDateStr = toDateStr(viewDate);
  const isToday     = dateOffset === 0;

  const habits = getHabitsForDay(viewDate.getDay());
  const doneCount = habits.filter(h => logs[`${viewDateStr}|${h.id}`]).length;
  const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  const load = useCallback(async () => {
    // Fetch 14 weeks back for heatmap + today
    const start = new Date(today);
    start.setDate(today.getDate() - 98);
    try {
      const data = await fetchLogs(toDateStr(start), viewDateStr);
      setLogs(data);
    } catch(e) { console.error(e); }
  }, [viewDateStr]);

  useEffect(() => { load(); }, [load]);

  // Pre-populate note drafts from logs
  useEffect(() => {
    const drafts = {};
    for (const key of Object.keys(logs)) {
      const [date, hid] = key.split('|');
      if (date === viewDateStr && logs[key]?.note) {
        drafts[hid] = logs[key].note;
      }
    }
    setNoteDraft(prev => ({ ...prev, ...drafts }));
  }, [logs, viewDateStr]);

  async function handleToggle(habit) {
    const done = !!logs[`${viewDateStr}|${habit.id}`];
    setSaving(habit.id);
    await toggleHabit(viewDateStr, habit.id, done);
    // If checking off a habit with alwaysNote, open note automatically
    if (!done && habit.alwaysNote) setNoteOpen(prev => ({ ...prev, [habit.id]: true }));
    await load();
    setSaving(null);
  }

  async function handleSaveNote(habit) {
    setSaving(habit.id + '_note');
    await saveNote(viewDateStr, habit.id, noteDraft[habit.id] ?? '');
    await load();
    setSaving(null);
    setNoteOpen(prev => ({ ...prev, [habit.id]: false }));
  }

  const streak = computeStreak(logs, today);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

      {/* Date nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setDateOffset(o => o - 1)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-lg"
        >‹</button>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{fmtDate(viewDate)}</p>
          {!isToday && (
            <button onClick={() => setDateOffset(0)} className="text-xs text-gray-500 hover:text-gray-300 underline">
              Back to today
            </button>
          )}
        </div>
        <button
          onClick={() => setDateOffset(o => Math.min(o + 1, 0))}
          disabled={isToday}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-lg disabled:opacity-20"
        >›</button>
      </div>

      {/* Score card */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-4">
        {/* Ring */}
        <div className="relative flex-shrink-0 h-16 w-16">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ffffff10" strokeWidth="3.5"/>
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={pct === 100 ? '#4caf50' : pct >= 50 ? '#e0b954' : '#6b7280'}
              strokeWidth="3.5"
              strokeDasharray={`${(pct / 100) * 100} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{pct}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-white">{doneCount} / {habits.length} done</p>
          <p className="text-sm text-gray-500">
            {pct === 100 ? '🔥 Perfect day!' : pct === 0 ? 'Nothing logged yet' : `${habits.length - doneCount} remaining`}
          </p>
          {streak > 0 && (
            <p className="text-xs text-amber-400 mt-1">🔥 {streak}-day streak</p>
          )}
        </div>
      </div>

      {/* Habit list */}
      <div className="space-y-2">
        {habits.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">No habits scheduled for this day.</p>
        ) : habits.map(habit => {
          const done    = !!logs[`${viewDateStr}|${habit.id}`];
          const isNoteOpen = habit.alwaysNote || noteOpen[habit.id];
          const draft   = noteDraft[habit.id] ?? '';
          const saved   = logs[`${viewDateStr}|${habit.id}`]?.note ?? '';
          const isSaving = saving === habit.id;

          return (
            <div
              key={habit.id}
              className={`rounded-xl border transition-all ${
                done ? 'border-white/10 bg-white/[0.04]' : 'border-white/[0.07] bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(habit)}
                  disabled={!!saving}
                  className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    done
                      ? 'border-transparent text-white'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={done ? { background: habit.color } : {}}
                >
                  {done && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${done ? 'text-gray-400' : 'text-white'}`}>
                    {habit.label}
                    {habit.alwaysNote && (
                      <span className="ml-1.5 text-[10px] font-normal text-red-400/70 uppercase tracking-wider">note required</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{habit.sub}</p>
                </div>

                {/* Note toggle (for non-alwaysNote habits) */}
                {!habit.alwaysNote && (
                  <button
                    onClick={() => setNoteOpen(prev => ({ ...prev, [habit.id]: !prev[habit.id] }))}
                    className={`flex-shrink-0 text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      saved ? 'border-amber-500/40 text-amber-400' : 'border-white/10 text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {saved ? 'note ✓' : '+ note'}
                  </button>
                )}
              </div>

              {/* Note area */}
              {isNoteOpen && (
                <div className="px-3 pb-3 pt-0">
                  <div className="h-px bg-white/[0.06] mb-3"/>
                  {habit.alwaysNote && (
                    <p className="text-[11px] text-gray-600 mb-1.5">
                      What happened with the lockdown today? (required — builds self-awareness)
                    </p>
                  )}
                  <textarea
                    value={draft}
                    onChange={e => setNoteDraft(prev => ({ ...prev, [habit.id]: e.target.value }))}
                    placeholder={habit.alwaysNote ? 'e.g. "Maintained — kept phone in other room" or "Broke at 8:45 — client texted and I responded"' : 'Add a note…'}
                    rows={2}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/20"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleSaveNote(habit)}
                      disabled={saving === habit.id + '_note'}
                      className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 transition-colors"
                    >
                      Save note
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div className="pt-2">
        <HabitHeatmap logs={logs} />
      </div>

      {/* Monthly % per habit */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">30-Day Completion</h3>
        {getHabitsForDay(1).map(habit => { // show weekday habits only for monthly %
          const days = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            return { ds: toDateStr(d), jsDay: d.getDay() };
          });
          const relevant = days.filter(({ jsDay }) => habit.active_days.includes(jsDay));
          const done = relevant.filter(({ ds }) => logs[`${ds}|${habit.id}`]).length;
          const pct = relevant.length ? Math.round((done / relevant.length) * 100) : 0;

          return (
            <div key={habit.id} className="flex items-center gap-3">
              <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: habit.color }}/>
              <p className="text-xs text-gray-400 flex-1 min-w-0 truncate">{habit.label}</p>
              <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: pct === 100 ? '#4caf50' : pct >= 70 ? '#e0b954' : '#e05555' }}
                />
              </div>
              <p className="text-xs tabular-nums text-gray-500 w-8 text-right flex-shrink-0">{pct}%</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
