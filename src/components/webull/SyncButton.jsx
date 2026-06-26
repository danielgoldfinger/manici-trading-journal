export default function SyncButton({ onSync, syncing, lastSynced, unmatched }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSync}
        disabled={syncing}
        className="rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {syncing ? 'Syncing…' : 'Sync now'}
      </button>
      {lastSynced && (
        <span className="text-xs text-gray-400">
          Last synced {new Date(lastSynced).toLocaleString()}
        </span>
      )}
      {unmatched?.length > 0 && (
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          {unmatched.length} unmatched order{unmatched.length === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );
}
