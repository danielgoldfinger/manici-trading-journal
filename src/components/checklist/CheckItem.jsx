export default function CheckItem({ item, checked, onToggle, disabled = false }) {
  return (
    <label
      className={`flex items-start gap-3 rounded border border-gray-200 p-3 dark:border-gray-800 ${
        disabled ? 'opacity-40' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900'
      }`}
    >
      <input
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        onChange={() => onToggle(item.id)}
        className="mt-1 h-4 w-4 accent-purple-600"
      />
      <div>
        <div className="flex items-center gap-2 text-sm font-medium">
          {item.label}
          {item.weight === 'gate' && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700 dark:bg-red-900/40 dark:text-red-300">
              gate
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
      </div>
    </label>
  );
}
