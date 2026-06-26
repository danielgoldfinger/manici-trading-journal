export default function PnlCalendar({ dailyPnl }) {
  const dates = Object.keys(dailyPnl).sort();
  if (dates.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-400 dark:border-gray-800">
        No closed trades yet.
      </div>
    );
  }

  const max = Math.max(...dates.map((d) => Math.abs(dailyPnl[d])), 1);

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Daily P&L</h3>
      <div className="flex flex-wrap gap-1">
        {dates.map((date) => {
          const pnl = dailyPnl[date];
          const intensity = Math.min(Math.abs(pnl) / max, 1);
          const bg = pnl >= 0
            ? `rgba(34,197,94,${0.15 + intensity * 0.6})`
            : `rgba(239,68,68,${0.15 + intensity * 0.6})`;
          return (
            <div
              key={date}
              title={`${date}: ${pnl.toFixed(2)} pts`}
              style={{ backgroundColor: bg }}
              className="flex h-10 w-10 flex-col items-center justify-center rounded text-[10px] font-medium"
            >
              <span>{date.slice(8)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
