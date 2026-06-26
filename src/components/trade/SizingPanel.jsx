import { useMemo } from 'react';
import { getRecommendedContracts, getSizingTier, DOWNSIZE_RULES } from '../../lib/sizing';

export default function SizingPanel({ score, accountBalance, adjustments, onToggleAdjustment, actualContracts }) {
  const tier = getSizingTier(score);
  const baseRecommended = getRecommendedContracts(accountBalance, score);

  const finalRecommended = useMemo(() => {
    if (baseRecommended === 0) return 0;
    const totalAdjustment = DOWNSIZE_RULES.reduce(
      (sum, rule) => sum + (adjustments[rule.id] ? rule.adjustment : 0),
      0
    );
    return Math.max(1, baseRecommended + totalAdjustment);
  }, [baseRecommended, adjustments]);

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{tier.label}</span>
        <span className="text-sm text-gray-500">Score {score}%</span>
      </div>

      <div className="mt-3 space-y-1">
        {DOWNSIZE_RULES.map((rule) => (
          <label key={rule.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={!!adjustments[rule.id]}
              onChange={() => onToggleAdjustment(rule.id)}
              className="h-4 w-4 accent-purple-600"
            />
            {rule.label}
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-800">
        <div>
          <p className="text-xs text-gray-500">Recommended</p>
          <p className="text-xl font-bold">{finalRecommended === 0 && baseRecommended === 0 ? 'Pass' : finalRecommended}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Actual traded</p>
          <p className="text-xl font-bold">{actualContracts ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
