export default function BullBearCase({ bullCase, bearCase }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
        <h3 className="mb-1 text-sm font-semibold text-green-800 dark:text-green-300">Bull case</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{bullCase || '—'}</p>
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <h3 className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">Bear case</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{bearCase || '—'}</p>
      </div>
    </div>
  );
}
