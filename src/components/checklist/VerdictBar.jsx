import { getVerdict } from '../../lib/score';
import { getRecommendedContracts, getSizingTier } from '../../lib/sizing';

const STATE_STYLES = {
  idle: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

export default function VerdictBar({ checks, setupType = 'FB', depth = 'shallow', accountBalance = 11600 }) {
  const verdict = getVerdict(checks, setupType, depth);
  const tier = getSizingTier(verdict.score);
  const recommended = getRecommendedContracts(accountBalance, verdict.score);

  return (
    <div className={`sticky top-0 z-10 flex items-center justify-between rounded-lg p-4 ${STATE_STYLES[verdict.state]}`}>
      <div>
        <p className="text-sm font-semibold">{verdict.label}</p>
        <p className="text-xs opacity-80">{tier.label}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold">{verdict.score}%</p>
        <p className="text-xs opacity-80">
          {recommended === 0 ? 'No size recommended' : `${recommended} contract${recommended === 1 ? '' : 's'} rec.`}
        </p>
      </div>
    </div>
  );
}
