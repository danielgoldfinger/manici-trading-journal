const POINT_VALUE   = 5;
const STOP_POINTS   = 15;
const WIN_RATE      = 0.65;
const T1_CONTRACTS  = 2;       // contracts off at T1
const RUNNER_CONTRACTS = 1;    // runner contract
const T1_POINTS     = 10;      // points at T1
const RUNNER_POINTS = 30;      // average runner points
const RUNNER_FREQ   = 0.5;     // runner fires on 50% of wins
const RISK_PCT      = 0.019;
const TRADING_DAYS  = 20;      // per month

export function projectMonthlyGain(accountBalance) {
  const maxRisk = accountBalance * RISK_PCT;
  const baseContracts = Math.floor(maxRisk / (STOP_POINTS * POINT_VALUE));
  const t1Contracts = Math.min(T1_CONTRACTS, baseContracts - 1);
  const runnerContracts = baseContracts - t1Contracts;

  const winWithRunner    = (t1Contracts * T1_POINTS * POINT_VALUE) + (runnerContracts * RUNNER_POINTS * POINT_VALUE);
  const winWithoutRunner = (t1Contracts * T1_POINTS * POINT_VALUE);
  const loss             = -(baseContracts * STOP_POINTS * POINT_VALUE);

  const dailyExpectancy =
    (WIN_RATE * RUNNER_FREQ      * winWithRunner) +
    (WIN_RATE * (1 - RUNNER_FREQ) * winWithoutRunner) +
    ((1 - WIN_RATE)               * loss);

  return {
    contracts: baseContracts,
    dailyExpectancy: Math.round(dailyExpectancy * 100) / 100,
    monthlyGain: Math.round(dailyExpectancy * TRADING_DAYS * 100) / 100,
    annualGain: Math.round(dailyExpectancy * TRADING_DAYS * 12 * 100) / 100,
  };
}

export function projectEquityCurve(startBalance, months = 24) {
  const curve = [];
  let balance = startBalance;
  for (let m = 0; m < months; m++) {
    const { contracts, monthlyGain } = projectMonthlyGain(balance);
    const endBalance = balance + monthlyGain;
    curve.push({
      month: m + 1,
      startBalance: Math.round(balance),
      endBalance: Math.round(endBalance),
      contracts,
      monthlyGain: Math.round(monthlyGain),
    });
    balance = endBalance;
  }
  return curve;
}
