const POINT_VALUE = 5;      // MES = $5 per point
const STOP_POINTS = 15;     // average stop distance
const RISK_PCT    = 0.019;  // 1.9% per trade

export function getRecommendedContracts(accountBalance, score) {
  // Base contracts from account size and risk %
  const maxRisk     = accountBalance * RISK_PCT;
  const riskPerContract = STOP_POINTS * POINT_VALUE;
  const baseContracts = Math.floor(maxRisk / riskPerContract);

  // Tier multiplier from score
  if (score < 60)  return 0;                                    // Don't trade
  if (score < 70)  return Math.max(1, Math.floor(baseContracts * 0.5));  // Marginal: half
  if (score < 85)  return baseContracts;                        // Valid: full (base)
  return Math.min(Math.ceil(baseContracts * 1.5), baseContracts + 2);   // A+: 1.5x, cap at base+2
}

export function getSizingTier(score) {
  if (score < 60)  return { tier: 'pass',    label: 'Do not trade',      color: 'danger'  };
  if (score < 70)  return { tier: 'marginal',label: 'Marginal — half size', color: 'warning' };
  if (score < 85)  return { tier: 'valid',   label: 'Valid — full size',  color: 'success' };
  return                   { tier: 'aplus',  label: 'A+ — size up',      color: 'success' };
}

// Adjustment rules — call after getRecommendedContracts, reduce as needed
export const DOWNSIZE_RULES = [
  { id: 'post_2pm',    label: 'Post-2pm session',              adjustment: -1 },
  { id: 'after_loss',  label: 'First trade after a stop-out',  adjustment: -1 },
  { id: 'rushed',      label: 'Acceptance felt borderline',    adjustment: -1 },
  { id: 'chop_mode',   label: 'Market in Mode 2 chop',         adjustment: -1 },
];
// Floor is always 1 contract (never 0 unless score < 60)

// Contract step-up schedule for reference display
export function getContractStepSchedule(startBalance = 11600) {
  const steps = [];
  let balance = startBalance;
  for (let i = 0; i < 12; i++) {
    const contracts = Math.floor((balance * RISK_PCT) / (STOP_POINTS * POINT_VALUE));
    steps.push({ balance: Math.round(balance), contracts });
    balance += balance * 0.08; // approx 8% monthly growth at this sizing
  }
  return steps;
}
