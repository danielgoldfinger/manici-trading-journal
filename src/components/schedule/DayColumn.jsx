import { CATEGORIES, SLOT_H, TOTAL_SLOTS, timeToSlot } from '../../data/scheduleTemplate';

export default function DayColumn({ blocks, logs = {}, date, onBlockClick }) {
  const totalH = TOTAL_SLOTS * SLOT_H;

  return (
    <div className="relative flex-1 min-w-0" style={{ height: totalH }}>
      {blocks.map((blk) => {
        const topSlot = timeToSlot(blk.start);
        const btmSlot = timeToSlot(blk.end);
        const height  = (btmSlot - topSlot) * SLOT_H;
        const top     = topSlot * SLOT_H;
        const cat     = CATEGORIES[blk.category] ?? CATEGORIES.free;
        const logKey  = date ? `${date}|${blk.id}` : null;
        const done    = logKey ? !!logs[logKey] : false;
        const tooShort = height <= SLOT_H; // 30px or less → hide sub-text

        return (
          <button
            key={blk.id}
            onClick={() => onBlockClick(blk)}
            className="absolute left-0.5 right-0.5 rounded overflow-hidden text-left group transition-all hover:brightness-125 focus:outline-none"
            style={{ top: top + 1, height: height - 2, background: cat.bg, borderLeft: `2.5px solid ${cat.color}` }}
          >
            {done && (
              <div className="absolute inset-0 bg-emerald-500/10 flex items-start justify-end p-1 pointer-events-none">
                <span className="text-emerald-400 text-[9px] font-bold">✓</span>
              </div>
            )}
            <div className="px-1.5 py-1 overflow-hidden h-full flex flex-col justify-center">
              <p
                className="text-[10px] font-semibold leading-tight truncate"
                style={{ color: cat.color }}
              >
                {blk.label}
              </p>
              {!tooShort && blk.sub && (
                <p className="text-[9px] text-gray-500 leading-tight mt-0.5 line-clamp-2">
                  {blk.sub}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
