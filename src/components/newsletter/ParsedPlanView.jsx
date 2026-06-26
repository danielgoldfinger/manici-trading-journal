import { useState } from 'react';
import PlanSummary from './PlanSummary';
import BullBearCase from './BullBearCase';
import { DirectBidLevels, ReferenceLevels } from './LevelList';

export default function ParsedPlanView({ plan }) {
  const [showReference, setShowReference] = useState(false);

  const tier1 = (plan.direct_bid_levels ?? []).filter((l) => l.priority === 1);
  const tier2 = (plan.direct_bid_levels ?? []).filter((l) => l.priority !== 1);

  return (
    <div className="space-y-6">
      <PlanSummary
        summary={plan.summary}
        bias={plan.bias}
        currentPosition={plan.current_position}
        parseStatus={plan.parse_status}
        parseNotes={plan.parse_notes}
      />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Tier 1 — Direct bid levels</h3>
        <DirectBidLevels levels={tier1} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Tier 2 — FB candidates</h3>
        <DirectBidLevels levels={tier2} />
      </div>

      <BullBearCase bullCase={plan.bull_case} bearCase={plan.bear_case} />

      <div>
        <button
          onClick={() => setShowReference((v) => !v)}
          className="text-sm font-medium text-purple-600 dark:text-purple-400"
        >
          {showReference ? 'Hide' : 'Show'} Tier 3 — Reference levels
        </button>
        {showReference && (
          <div className="mt-3">
            <ReferenceLevels supports={plan.supports ?? []} resistances={plan.resistances ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
