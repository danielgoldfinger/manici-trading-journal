export default function PhaseHeader({ phase, label, checkedCount, totalCount }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Phase {phase} — {label}
      </h3>
      <span className="text-xs text-gray-400">
        {checkedCount}/{totalCount}
      </span>
    </div>
  );
}
