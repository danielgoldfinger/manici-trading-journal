import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDayBlocks, DAY_NAMES, DAY_NAMES_FULL,
  SLOT_H, TOTAL_SLOTS, START_HOUR, slotToLabel,
  FOMC_WEDNESDAYS,
} from '../data/scheduleTemplate';
import { useSchedule } from '../hooks/useSchedule';
import DayColumn from '../components/schedule/DayColumn';
import BlockDetailModal from '../components/schedule/BlockDetailModal';

// Return Mon of the week containing `date` (JS Date), offset by weekOffset
function getWeekStart(weekOffset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + weekOffset * 7);
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  mon.setHours(0,0,0,0);
  return mon;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

function fmtWeekLabel(mon) {
  const sun = addDays(mon, 6);
  const opts = { month: 'short', day: 'numeric' };
  return `${mon.toLocaleDateString('en-US', opts)} – ${sun.toLocaleDateString('en-US', opts)}`;
}

// Sunday=0, Mon=1…Sat=6 → column order: Mon Tue Wed Thu Fri Sat Sun
const COL_ORDER = [1, 2, 3, 4, 5, 6, 0];
const TIME_LABELS = Array.from({ length: TOTAL_SLOTS }, (_, i) => slotToLabel(i));

export default function Schedule() {
  const [view, setView]           = useState('template'); // 'template' | 'actual'
  const [weekOffset, setWeekOffset] = useState(0);
  const [logs, setLogs]           = useState({});
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0-6 index into COL_ORDER
  });
  const [modalData, setModalData] = useState(null); // { block, date }
  const { fetchLogs } = useSchedule();
  const scrollRef = useRef(null);

  const weekStart = getWeekStart(weekOffset); // Monday
  // dates[i] corresponds to COL_ORDER[i]
  const dates = COL_ORDER.map((dayNum, i) => {
    const offset = dayNum === 0 ? 6 : dayNum - 1; // days from Mon
    return toDateStr(addDays(weekStart, offset));
  });

  const loadLogs = useCallback(async () => {
    if (view !== 'actual') return;
    try {
      const sun = addDays(weekStart, -1); // Mon - 1 = Sun... wait
      // weekStart is Mon; Sun of same week is Mon + 6 (next Sun) or Mon - 1 (prev Sun)
      // COL_ORDER has Sun at the end (index 6), which is Mon + 6 days
      const weekEnd = addDays(weekStart, 6);
      const data = await fetchLogs(toDateStr(weekStart), toDateStr(weekEnd));
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
  }, [view, weekOffset]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // Scroll to ~6am on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (1 * 2) * SLOT_H; // 1 hour in = slot 2
    }
  }, []);

  // FOMC banner: check if any Wednesday in this week is an FOMC Wednesday
  const wednesdayDate = dates[2]; // COL_ORDER[2] = 3 = Wed
  const isFomcWeek = FOMC_WEDNESDAYS.has(wednesdayDate);

  function openModal(block, colIndex) {
    const date = view === 'actual' ? dates[colIndex] : null;
    setModalData({ block, date, colIndex });
  }

  const totalH = TOTAL_SLOTS * SLOT_H;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-white/10 space-y-3">
        {isFomcWeek && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <span className="text-amber-400 font-bold">⚠ FOMC week</span>
            <span className="text-amber-400/70">· Consider shifting Wednesday hike to Tuesday</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white text-lg leading-none">‹</button>
            <span className="text-sm font-medium text-white tabular-nums">{fmtWeekLabel(weekStart)}</span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white text-lg leading-none">›</button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="ml-1 text-xs text-gray-500 hover:text-gray-300 underline">Today</button>
            )}
          </div>

          {/* Template / Actual toggle */}
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs">
            <button
              onClick={() => setView('template')}
              className={`px-3 py-1 rounded-md transition-colors ${view === 'template' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Template
            </button>
            <button
              onClick={() => setView('actual')}
              className={`px-3 py-1 rounded-md transition-colors ${view === 'actual' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Actual
            </button>
          </div>
        </div>

        {/* Mobile day selector */}
        <div className="flex gap-1 md:hidden overflow-x-auto pb-1 scrollbar-hide">
          {COL_ORDER.map((dayNum, i) => {
            const isToday = view === 'actual' && dates[i] === toDateStr(new Date());
            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedDay === i
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {DAY_NAMES[dayNum]}
                {isToday && <span className="ml-1 h-1 w-1 inline-block rounded-full bg-blue-400 align-middle" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-auto">
        <div className="flex min-w-[680px] md:min-w-0">
          {/* Time gutter */}
          <div className="flex-shrink-0 w-12 relative" style={{ height: totalH }}>
            {TIME_LABELS.map((label, i) => (
              i % 2 === 0 && (
                <div
                  key={i}
                  className="absolute right-1 text-[10px] text-gray-600 leading-none"
                  style={{ top: i * SLOT_H - 5 }}
                >
                  {label}
                </div>
              )
            ))}
          </div>

          {/* Day columns */}
          {COL_ORDER.map((dayNum, colIdx) => {
            const isTodayCol = view === 'actual' && dates[colIdx] === toDateStr(new Date());
            const isMobileHidden = colIdx !== selectedDay;
            const blocks = getDayBlocks(dayNum);

            return (
              <div
                key={dayNum}
                className={`flex-1 min-w-0 flex flex-col ${isMobileHidden ? 'hidden md:flex' : 'flex'}`}
              >
                {/* Day header */}
                <div className={`sticky top-0 z-10 bg-[#0f1117] border-b border-white/10 text-center py-1.5 ${isTodayCol ? 'text-blue-400' : 'text-gray-500'}`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    {DAY_NAMES[dayNum]}
                  </span>
                  {view === 'actual' && (
                    <div className="text-[10px] text-gray-600">
                      {new Date(dates[colIdx] + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </div>
                  )}
                </div>

                {/* Blocks */}
                <div className="relative flex-1 border-l border-white/[0.05]" style={{ height: totalH }}>
                  {/* Hour grid lines */}
                  {Array.from({ length: 16 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-white/[0.04]"
                      style={{ top: i * SLOT_H * 2 }}
                    />
                  ))}
                  <DayColumn
                    blocks={blocks}
                    logs={view === 'actual' ? logs : {}}
                    date={view === 'actual' ? dates[colIdx] : null}
                    onBlockClick={(blk) => openModal(blk, colIdx)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modalData && (
        <BlockDetailModal
          block={modalData.block}
          date={modalData.date}
          logEntry={modalData.date ? logs[`${modalData.date}|${modalData.block.id}`] : null}
          isActual={view === 'actual'}
          onClose={() => setModalData(null)}
          onRefresh={loadLogs}
        />
      )}
    </div>
  );
}
