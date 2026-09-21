import { useMemo } from 'react';
import { getHabitsForDay } from '../../data/habitDefinitions';

const WEEKS = 14;
const DAYS  = 7;

function toDateStr(d) { return d.toISOString().slice(0,10); }

export default function HabitHeatmap({ logs }) {
  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Start from WEEKS*7 days ago, aligned to Sunday
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - WEEKS * 7 + 1);

    const grid = []; // [week][day]
    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < DAYS; d++) {
        const cell = new Date(startDay);
        cell.setDate(startDay.getDate() + w * 7 + d);
        const dateStr = toDateStr(cell);
        const isFuture = cell > today;
        const jsDay = cell.getDay();
        const habits = getHabitsForDay(jsDay);
        const total = habits.length;
        const done = total === 0 ? 0 : habits.filter(h => logs[`${dateStr}|${h.id}`]).length;

        week.push({ dateStr, isFuture, total, done, isToday: dateStr === toDateStr(today) });
      }
      grid.push(week);
    }
    return grid;
  }, [logs]);

  function cellColor({ isFuture, total, done, isToday }) {
    if (isFuture) return 'bg-white/[0.03]';
    if (total === 0) return 'bg-white/[0.04]';
    if (done === 0) return 'bg-white/[0.06]';
    if (done === total) return 'bg-emerald-500/70';
    const pct = done / total;
    if (pct >= 0.7) return 'bg-emerald-500/35';
    if (pct >= 0.4) return 'bg-amber-500/45';
    return 'bg-red-500/30';
  }

  const DAY_LABELS = ['S','M','T','W','T','F','S'];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">14-Week Heatmap</h3>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 flex-shrink-0 mr-0.5">
          {DAY_LABELS.map((l, i) => (
            <div key={i} className="h-4 w-4 flex items-center justify-center text-[9px] text-gray-600">{l}</div>
          ))}
        </div>
        {/* Week columns */}
        {cells.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
            {week.map((cell, di) => (
              <div
                key={di}
                title={`${cell.dateStr}: ${cell.done}/${cell.total}`}
                className={`h-4 w-4 rounded-sm transition-all ${cellColor(cell)} ${cell.isToday ? 'ring-1 ring-white/40' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-gray-600">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-emerald-500/70 inline-block"/><span>All done</span></span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-amber-500/45 inline-block"/><span>Partial</span></span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-white/[0.06] inline-block"/><span>None logged</span></span>
      </div>
    </div>
  );
}
