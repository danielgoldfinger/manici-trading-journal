import { CHECKLIST } from '../../lib/score';
import CheckItem from './CheckItem';
import PhaseHeader from './PhaseHeader';

const PHASE_LABELS = {
  1: 'Identify the setup',
  2: 'Reclaim',
  3: 'Confirmation',
  4: 'Execution plan',
};

function isPhaseGateMet(phase, checks) {
  if (phase === 1) return true;
  if (phase === 2) return ['c_p1_1', 'c_p1_2', 'c_p1_3', 'c_p1_4'].every((id) => checks[id]);
  if (phase === 3) return ['c_p1_1', 'c_p1_2', 'c_p1_3', 'c_p1_4', 'c_p2_1', 'c_p2_2'].every((id) => checks[id]);
  if (phase === 4) return ['c_p1_1', 'c_p1_2', 'c_p1_3', 'c_p1_4', 'c_p2_1', 'c_p2_2', 'c_p3_5'].every((id) => checks[id]);
  return true;
}

export default function Checklist({ checks, onToggle }) {
  const phases = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const items = CHECKLIST.filter((c) => c.phase === phase);
        const checkedCount = items.filter((c) => checks[c.id]).length;
        const dimmed = !isPhaseGateMet(phase, checks);

        return (
          <div key={phase} className={dimmed ? 'opacity-50' : ''}>
            <PhaseHeader
              phase={phase}
              label={PHASE_LABELS[phase]}
              checkedCount={checkedCount}
              totalCount={items.length}
            />
            <div className="space-y-2">
              {items.map((item) => (
                <CheckItem
                  key={item.id}
                  item={item}
                  checked={checks[item.id]}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
