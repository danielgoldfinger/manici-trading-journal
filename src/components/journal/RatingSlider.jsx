const dangerFields = new Set(['pre_fomo_intensity', 'pre_loss_aversion']);

function colorForValue(value, isDanger) {
  if (value == null) return '';
  if (isDanger) {
    if (value >= 7) return 'text-red-500 dark:text-red-400';
    if (value >= 4) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  }
  return '';
}

export default function RatingSlider({ label, name, value, onChange, danger = false }) {
  const isDanger = danger || dangerFields.has(name);
  const colorClass = colorForValue(value, isDanger);

  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value ?? 5}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        className="flex-1 accent-purple-600"
      />
      <span className={`w-6 text-right text-sm font-semibold tabular-nums ${value == null ? 'text-gray-300 dark:text-gray-600' : colorClass || 'text-gray-800 dark:text-gray-200'}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}
