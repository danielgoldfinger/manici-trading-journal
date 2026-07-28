import { getChecklist } from '../../lib/score';
import CheckItem from './CheckItem';
import PhaseHeader from './PhaseHeader';

const RIPSTER_PHASES = { 1: 'Regime gate', 2: 'Structure', 3: 'Trigger', 4: 'Confirmation', 5: 'Entry parameters' };

const PHASE_LABELS = {
  FB:    { 1: 'Identify the setup', 2: 'Reclaim', 3: 'Confirmation', 4: 'Execution plan' },
  LR:    { 1: 'Identify the shelf', 2: 'Reclaim', 3: 'Confirmation', 4: 'Execution plan' },
  BT:    { 1: 'Identify the breakout', 2: 'Retest', 3: 'Confirmation', 4: 'Execution plan' },
  BD:    { 1: 'Identify the level', 2: 'Pre-short confirmation', 3: 'Trigger & context', 4: 'Execution plan' },
  R_BRK: RIPSTER_PHASES,
  R_FLU: RIPSTER_PHASES,
  R_MAG: RIPSTER_PHASES,
  R_REJ: RIPSTER_PHASES,
  R_BNC: RIPSTER_PHASES,
  R_CRL: RIPSTER_PHASES,
  R_CON: RIPSTER_PHASES,
  R_512B: RIPSTER_PHASES,
  R_512R: RIPSTER_PHASES,
  R_3450B: RIPSTER_PHASES,
  R_3450R: RIPSTER_PHASES,
};

function isPhaseGateMet(phase, checks, checklist) {
  const priorGateIds = checklist
    .filter((c) => c.phase < phase && c.weight === 'gate')
    .map((c) => c.id);
  return priorGateIds.every((id) => checks[id]);
}

export default function Checklist({ checks, onToggle, setupType = 'FB', readOnly = false }) {
  const checklist = getChecklist(setupType);
  const phases = [...new Set(checklist.map((c) => c.phase))].sort();
  const phaseLabels = PHASE_LABELS[setupType] ?? PHASE_LABELS.FB;

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const items = checklist.filter((c) => c.phase === phase);
        const checkedCount = items.filter((c) => checks[c.id]).length;
        const dimmed = !readOnly && !isPhaseGateMet(phase, checks, checklist);

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
                  onToggle={readOnly ? () => {} : onToggle}
                  disabled={readOnly}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
