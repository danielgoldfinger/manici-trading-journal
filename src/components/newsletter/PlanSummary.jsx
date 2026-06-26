const BIAS_STYLES = {
  bullish: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  bearish: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  none: 'bg-gray-100 text-gray-500 dark:bg-gray-800',
};

export default function PlanSummary({ summary, bias, currentPosition, parseStatus, parseNotes }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${BIAS_STYLES[bias] ?? BIAS_STYLES.none}`}>
          {bias}
        </span>
        {parseStatus !== 'clean' && (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {parseStatus === 'manual' ? 'Manual entry required' : 'Needs review'}
          </span>
        )}
      </div>
      {currentPosition && (
        <p className="mb-2 text-sm font-medium text-purple-700 dark:text-purple-300">{currentPosition}</p>
      )}
      <p className="text-sm text-gray-700 dark:text-gray-300">{summary || '—'}</p>
      {parseNotes && <p className="mt-2 text-xs text-gray-400">{parseNotes}</p>}
    </div>
  );
}
