const ITEMS = [
  { key: 'adhered_to_levels',      label: 'Traded pre-planned levels only' },
  { key: 'adhered_to_window',      label: 'Stayed within 8–11am / post-2pm ET window' },
  { key: 'adhered_to_one_trade',   label: 'Respected one-trade-per-day rule' },
  { key: 'adhered_to_stop',        label: 'Never moved stop against the trade' },
  { key: 'adhered_to_t1',          label: 'Took profits at T1' },
  { key: 'adhered_to_runner',      label: 'Held runner until a condition fired' },
  { key: 'avoided_impulse_trades', label: 'Avoided impulse trades' },
  { key: 'followed_preplan',       label: 'Executed what I wrote in pre-session' },
];

export function adherenceScore(values) {
  const filled = ITEMS.filter(i => values[i.key] !== null && values[i.key] !== undefined);
  const yes = filled.filter(i => values[i.key] === true);
  return { yes: yes.length, total: filled.length };
}

export { ITEMS as ADHERENCE_ITEMS };

export default function AdherenceChecklist({ values, onChange }) {
  const { yes, total } = adherenceScore(values);

  function toggle(key) {
    const cur = values[key];
    // cycle: null → true → false → null
    const next = cur === null || cur === undefined ? true : cur === true ? false : null;
    onChange(key, next);
  }

  return (
    <div className="space-y-2">
      {ITEMS.map(item => {
        const val = values[item.key];
        const isTrue = val === true;
        const isFalse = val === false;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => toggle(item.key)}
            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
              isTrue
                ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : isFalse
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-800'
            }`}
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${
              isTrue
                ? 'bg-green-500 text-white'
                : isFalse
                ? 'bg-red-400 text-white'
                : 'border border-gray-300 dark:border-gray-600'
            }`}>
              {isTrue ? '✓' : isFalse ? '✕' : ''}
            </span>
            <span className={
              isTrue ? 'text-green-800 dark:text-green-300' :
              isFalse ? 'text-red-700 dark:text-red-300' :
              'text-gray-600 dark:text-gray-400'
            }>{item.label}</span>
          </button>
        );
      })}
      {total > 0 && (
        <div className="flex items-center justify-between pt-1 text-sm">
          <span className="text-gray-500">Adherence score</span>
          <span className="font-semibold tabular-nums">
            {yes}/{total} <span className="text-gray-400">({Math.round((yes / total) * 100)}%)</span>
          </span>
        </div>
      )}
    </div>
  );
}
