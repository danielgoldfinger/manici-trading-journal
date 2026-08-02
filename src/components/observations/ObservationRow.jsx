import { SETUP_TYPE_LABELS } from '../../lib/score';
import { PASS_REASON_LABELS, OUTCOME_LABELS, OUTCOME_COLORS } from '../../lib/observations';

function ScoreBadge({ score }) {
  const color =
    score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
    score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>{score}%</span>;
}

export default function ObservationRow({ obs, onClick }) {
  const outcomeClass = OUTCOME_COLORS[obs.outcome] ?? 'text-gray-400';
  return (
    <button
      onClick={() => onClick(obs)}
      className="w-full rounded-lg border border-gray-200 p-3 text-left transition hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/10"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug">
            {SETUP_TYPE_LABELS[obs.setup_type] ?? obs.setup_type}
            {obs.fb_level ? <span className="ml-1 text-gray-500">@ {obs.fb_level}</span> : null}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {obs.obs_date} {obs.obs_time?.slice(0, 5) ?? ''} &middot; {PASS_REASON_LABELS[obs.pass_reason] ?? obs.pass_reason}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ScoreBadge score={obs.setup_score ?? 0} />
          {obs.outcome && (
            <span className={`text-xs font-medium ${outcomeClass}`}>
              {OUTCOME_LABELS[obs.outcome] ?? obs.outcome}
            </span>
          )}
        </div>
      </div>
      {obs.had_confirmation_but_froze && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Froze with criteria met</p>
      )}
    </button>
  );
}
