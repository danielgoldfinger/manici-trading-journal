import { adherenceScore } from './AdherenceChecklist';

export default function JournalHistoryRow({ entry, onClick }) {
  const { yes, total } = adherenceScore(entry);
  const adherencePct = total > 0 ? Math.round((yes / total) * 100) : null;

  return (
    <button
      onClick={() => onClick(entry)}
      className="w-full rounded-lg border border-gray-200 p-3 text-left transition hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{entry.journal_date}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
            {entry.pre_mental_state != null && (
              <span>Pre mental: <strong className="text-gray-700 dark:text-gray-300">{entry.pre_mental_state}/10</strong></span>
            )}
            {entry.post_execution_quality != null && (
              <span>Execution: <strong className="text-gray-700 dark:text-gray-300">{entry.post_execution_quality}/10</strong></span>
            )}
            {adherencePct != null && (
              <span>Adherence: <strong className="text-gray-700 dark:text-gray-300">{yes}/{total}</strong></span>
            )}
          </div>
          <div className="mt-1.5 flex gap-2">
            <CompletionPill done={entry.pre_session_completed} label="Pre" />
            <CompletionPill done={entry.post_session_completed} label="Post" />
            <CompletionPill done={!!entry.stream_of_consciousness} label="Stream" />
            {entry.is_weekly_review && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Weekly review</span>
            )}
          </div>
        </div>
        {entry.post_execution_quality != null && (
          <ExecutionBadge score={entry.post_execution_quality} />
        )}
      </div>
    </button>
  );
}

function CompletionPill({ done, label }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${done ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'}`}>
      {done ? '✓ ' : ''}{label}
    </span>
  );
}

function ExecutionBadge({ score }) {
  const color = score >= 8 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    : score >= 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  return <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${color}`}>{score}/10</span>;
}
