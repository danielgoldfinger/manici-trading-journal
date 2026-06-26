const TIER_STYLES = {
  1: 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
  2: 'border-gray-200 dark:border-gray-800',
  3: 'border-gray-100 dark:border-gray-900',
};

export function DirectBidLevels({ levels }) {
  if (levels.length === 0) return <p className="text-sm text-gray-400">No direct bid levels extracted.</p>;
  return (
    <div className="space-y-2">
      {levels.map((level, i) => (
        <div key={i} className={`rounded border p-3 ${TIER_STYLES[level.priority] ?? TIER_STYLES[2]}`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{level.price}</span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {level.type}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{level.condition}</p>
          {level.conditional_on && (
            <p className="mt-1 text-xs text-gray-400">Conditional on {level.conditional_on} breaking first</p>
          )}
          {level.bonus_level && <p className="mt-1 text-xs text-gray-400">Bonus target: {level.bonus_level}</p>}
          {level.notes && <p className="mt-1 text-xs italic text-gray-400">{level.notes}</p>}
        </div>
      ))}
    </div>
  );
}

export function ReferenceLevels({ supports, resistances }) {
  return (
    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
      <div>
        <p className="mb-1 font-medium text-gray-700 dark:text-gray-300">Supports</p>
        <ul className="space-y-0.5">
          {supports.map((s, i) => (
            <li key={i} className={s.major ? 'font-semibold' : 'text-gray-500'}>
              {s.price}{s.major ? ' (major)' : ''}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 font-medium text-gray-700 dark:text-gray-300">Resistances</p>
        <ul className="space-y-0.5">
          {resistances.map((r, i) => (
            <li key={i} className={r.major ? 'font-semibold' : 'text-gray-500'}>
              {r.price}{r.major ? ' (major)' : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
