import { getChecklist } from '../../lib/score';
import CheckItem from './CheckItem';
import PhaseHeader from './PhaseHeader';

const PHASE_LABELS = {
  FB: { 1: 'Identify the setup', 2: 'Reclaim', 3: 'Confirmation', 4: 'Execution plan' },
  LR: { 1: 'Identify the shelf', 2: 'Reclaim', 3: 'Confirmation', 4: 'Execution plan' },
  BT: { 1: 'Identify the breakout', 2: 'Retest', 3: 'Confirmation', 4: 'Execution plan' },
  BD: { 1: 'Identify the level', 2: 'Pre-short confirmation', 3: 'Trigger & context', 4: 'Execution plan' },
};

function isPhaseGateMet(phase, checks, checklist) {
  const priorGateIds = checklist
    .filter((c) => c.phase < phase && c.weight === 'gate')
    .map((c) => c.id);
  return priorGateIds.every((id) => checks[id]);
}

export default function Checklist({ checks, onToggle, setupType = 'FB' }) {
  const checklist = getChecklist(setupType);
  const phases = [...new Set(checklist.map((c) => c.phase))].sort();
  const phaseLabels = PHASE_LABELS[setupType] ?? PHASE_LABELS.FB;

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const items = checklist.filter((c) => c.phase === phase);
        const checkedCount = items.filter((c) => checks[c.id]).length;
        const dimmed = !isPhaseGateMet(phase, checks, checklist);

        return (
          <div key={phase} className={dimmed ? 'opacity-50' : ''}>
            <PhaseHeader
              phase={phase}
              label={phaseLabels[phase]}
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
