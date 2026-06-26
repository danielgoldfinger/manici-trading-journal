// Each setup type's checklist reuses the same 14 DB column slots
// (c_p1_1..c_p4_3) positionally — meanings differ per setup type, but no
// schema migration is needed since setup_score is stored at save time.
// Source: Mancini's "My Trade Methodology - Fundamentals" writeup.

const FB_CHECKLIST = [
  { id: 'c_p1_1', phase: 1, weight: 'gate',
    label: 'Significant low present',
    sub: "Prior day's low is gold standard. Clear V-pivot that ran multiple levels and defended for hours. Should jump out on 15m chart." },
  { id: 'c_p1_2', phase: 1, weight: 'gate',
    label: 'Low at technically significant spot',
    sub: 'Trendline, horizontal support, or prior breakout zone being back-tested. Clear left-side context — not floating in the middle of nowhere.' },
  { id: 'c_p1_3', phase: 1, weight: 'gate',
    label: 'Bounce defended for hours / ran several levels',
    sub: 'The bounce off the low should have run enough levels that you would have wanted to trade it on its own.' },
  { id: 'c_p1_4', phase: 1, weight: 'gate',
    label: 'Convincing elevator down flush',
    sub: 'Dramatic in real time — fast vertical drop. You can see traders being trapped. Slow grind does not count.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Low reclaimed on a close (not just a wick)',
    sub: 'Candle bodies closing above the significant level. A single spike wick above then immediate return below = not reclaimed.' },
  { id: 'c_p2_2', phase: 2, weight: 'gate',
    label: 'Price holding above the level',
    sub: 'Sustained hold above the level — not one wick through then collapse.' },
  { id: 'c_p3_1', phase: 3, weight: 'bonus',
    label: 'Form 1 — back-test held',
    sub: 'Price sold off back toward or below the level after initial recovery, then returned above it. Supply exhausted. Safest entry signal.' },
  { id: 'c_p3_2', phase: 3, weight: 'bonus',
    label: 'Form 2 — double recovery',
    sub: 'First recovery attempt trapped premature longs (failed back below level), then a clean second recovery. Market got the trap out of its system.' },
  { id: 'c_p3_3', phase: 3, weight: 'bonus',
    label: 'Form 3 — non-acceptance rip',
    sub: 'Price ripped 5+ pts above level instantly with no pause. Waited 2-3 min; still holding above. High volatility setups only.' },
  { id: 'c_p3_4', phase: 3, weight: 'bonus',
    label: 'Danger zone cleared (5+ pts above low with time)',
    sub: 'The 0-5pt band above the reclaimed low is the trap zone. Clearing it with sustained hold is key confirmation.' },
  { id: 'c_p3_5', phase: 3, weight: 'gate',
    label: 'Waited appropriate time for acceptance',
    sub: 'Shallow (<20pt): 2-5 min min. Deep (>20pt): 30-60+ min. If unsure, wait longer.' },
  { id: 'c_p4_1', phase: 4, weight: 'bonus',
    label: 'Stop placed below flush low (~5pt buffer)',
    sub: 'Stop must make technical sense. Setup is valid until the flush low fails. Never arbitrary.' },
  { id: 'c_p4_2', phase: 4, weight: 'bonus',
    label: 'T1 (first target) identified before entry',
    sub: 'Know where 75% of profits come off before entering. Next significant resistance level.' },
  { id: 'c_p4_3', phase: 4, weight: 'bonus',
    label: 'Within trading window (8-11am or post-2pm ET)',
    sub: '11am-2pm is chop territory per Mancini — lower follow-through. Extra caution or skip.' },
];

// Level Reclaim: same acceptance/execution requirements as a Failed
// Breakdown, but phase 1 is about reclaiming a horizontal S/R shelf
// (multiple touches as both support and resistance) rather than a single
// significant low with a dramatic flush. Slower-forming — price can lose
// the line one day and return to it the next.
const LR_CHECKLIST = [
  { id: 'c_p1_1', phase: 1, weight: 'gate',
    label: 'Clear horizontal S/R shelf identified',
    sub: 'A horizontal line with touches both above and below it — acted as support, then resistance (or vice versa). Not just one touch.' },
  { id: 'c_p1_2', phase: 1, weight: 'gate',
    label: 'Shelf at a technically significant spot',
    sub: 'Clear left-side context — the shelf should jump out on the chart, not be an arbitrary line.' },
  { id: 'c_p1_3', phase: 1, weight: 'gate',
    label: 'Price recently lost the shelf',
    sub: 'Price broke below (or above, for a short) the shelf — this is the level reclaim is recovering. Unlike a Failed Breakdown, no dramatic flush is required.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Shelf reclaimed on a close (not just a wick)',
    sub: 'Candle bodies closing back above the shelf. A single spike wick then immediate return below = not reclaimed.' },
  { id: 'c_p2_2', phase: 2, weight: 'gate',
    label: 'Price holding above the shelf',
    sub: 'Sustained hold above the shelf — not one wick through then collapse.' },
  { id: 'c_p3_1', phase: 3, weight: 'bonus',
    label: 'Form 1 — back-test held',
    sub: 'Price sold off back toward or below the shelf after initial recovery, then returned above it. Safest entry signal.' },
  { id: 'c_p3_2', phase: 3, weight: 'bonus',
    label: 'Form 2 — double recovery',
    sub: 'First recovery attempt trapped premature longs, then a clean second recovery.' },
  { id: 'c_p3_3', phase: 3, weight: 'bonus',
    label: 'Form 3 — non-acceptance rip',
    sub: 'Price ripped 5+ pts above the shelf instantly with no pause and held. High volatility only.' },
  { id: 'c_p3_4', phase: 3, weight: 'bonus',
    label: 'Danger zone cleared (5+ pts above shelf with time)',
    sub: 'Same trap-zone logic as a Failed Breakdown — clearing it with a sustained hold confirms.' },
  { id: 'c_p3_5', phase: 3, weight: 'gate',
    label: 'Waited appropriate time for acceptance',
    sub: 'Same acceptance rules as a Failed Breakdown apply once the shelf is reclaimed.' },
  { id: 'c_p4_1', phase: 4, weight: 'bonus',
    label: 'Stop placed below the shelf (~5pt buffer)',
    sub: 'Stop must make technical sense — setup is valid until the shelf fails.' },
  { id: 'c_p4_2', phase: 4, weight: 'bonus',
    label: 'T1 (first target) identified before entry',
    sub: 'Know where 75% of profits come off before entering.' },
  { id: 'c_p4_3', phase: 4, weight: 'bonus',
    label: 'Within trading window (8-11am or post-2pm ET)',
    sub: '11am-2pm is chop territory — extra caution or skip.' },
];

// Back-test: breakout-backtest-rally (or breakdown-backtest-sell) cycle.
// First test of a clean breakout zone is statistically the best entry —
// odds drop on each subsequent test.
const BT_CHECKLIST = [
  { id: 'c_p1_1', phase: 1, weight: 'gate',
    label: 'High-momentum, strong, obvious breakout occurred',
    sub: 'Price moved out of a previously strong level with aggressive speed, momentum, and conviction — not a slow grind.' },
  { id: 'c_p1_2', phase: 1, weight: 'gate',
    label: 'Clearly defined zone the breakout came from',
    sub: 'A pattern, trendline, channel, or zone of messy highs/lows — must be obvious, not arbitrary.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Price has returned to retest that exact zone',
    sub: 'The backtest must be at the same level the breakout originated from.' },
  { id: 'c_p2_2', phase: 2, weight: 'gate',
    label: 'This is the 1st test of the zone since the breakout',
    sub: 'First test is statistically the best long/short. Odds drop successively on the 2nd, 3rd test, etc.' },
  { id: 'c_p3_1', phase: 3, weight: 'bonus',
    label: 'Rejection/reversal candle at the retest',
    sub: 'A wick or reversal bar at the zone showing the level is holding, not just price arriving there.' },
  { id: 'c_p3_5', phase: 3, weight: 'gate',
    label: "Didn't chase — let the retest actually happen",
    sub: 'Entering before price reaches the zone is not a back-test trade. Wait for the level to actually be tested.' },
  { id: 'c_p4_1', phase: 4, weight: 'bonus',
    label: 'Stop placed beyond the zone',
    sub: 'Stop should make the trade invalid only if the zone genuinely fails, not an arbitrary distance.' },
  { id: 'c_p4_2', phase: 4, weight: 'bonus',
    label: 'T1 (first target) identified before entry',
    sub: 'Know where 75% of profits come off before entering.' },
  { id: 'c_p4_3', phase: 4, weight: 'bonus',
    label: 'Within trading window (8-11am or post-2pm ET)',
    sub: '11am-2pm is chop territory — extra caution or skip.' },
];

// Breakdown Short: the rarer, harder, lower-win-rate setup. Requires
// "acceptance" at the level (repeated tests suggesting the level will
// break in a sustained manner) before shorting below it — without that,
// you're just trading a random breakdown, most of which fail (Failed
// Breakdowns are Mancini's top setup precisely because most breakdowns
// don't sustain).
const BD_CHECKLIST = [
  { id: 'c_p1_1', phase: 1, weight: 'gate',
    label: 'Clear, well-defined horizontal level or cluster of lows',
    sub: 'Must be obvious — multi-touch horizontal support (or resistance, for the breakout-trade mirror). The Breakdown Short requires "something" obvious to break.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Bounce and/or Failed Breakdown occurred at the zone immediately before shorting',
    sub: "You cannot just rush into a breakdown short. Having a failed breakdown (or at minimum a bounce) happen at the level right before you short is what protects you from being the one who gets trapped." },
  { id: 'c_p2_2', phase: 2, weight: 'gate',
    label: 'Level shows "acceptance" — multiple tests, increasing odds of a sustained break',
    sub: 'Price hitting the support, bouncing, retesting, maybe failing a breakdown, then returning again. Acceptance is price magnetizing to the level and eating up demand there — more art than science, takes screen time.' },
  { id: 'c_p3_5', phase: 3, weight: 'gate',
    label: 'Short trigger placed a few points below all the noise, in a fresh untested area',
    sub: "Don't place the trigger inside the chop at the level — place it below all the structure, away from the noise to its left." },
  { id: 'c_p3_1', phase: 3, weight: 'bonus',
    label: 'Market context favors the short',
    sub: 'These work best in very strongly up-trending or very strongly down-trending markets — not chop.' },
  { id: 'c_p3_2', phase: 3, weight: 'bonus',
    label: 'Sized appropriately for a low-win-rate, high-R/R setup',
    sub: 'Breakdown Shorts represent under 10% of trades and have the lowest win rate of any setup type. When they work they pay out big, but expect over 60% to fail.' },
  { id: 'c_p4_1', phase: 4, weight: 'bonus',
    label: 'Stop placed correctly above the trigger/recent swing high',
    sub: 'Stop must make technical sense relative to the structure being shorted.' },
  { id: 'c_p4_2', phase: 4, weight: 'bonus',
    label: 'T1 (first target) identified before entry',
    sub: 'Know where 75% of profits come off before entering.' },
  { id: 'c_p4_3', phase: 4, weight: 'bonus',
    label: 'Within trading window (8-11am or post-2pm ET)',
    sub: '11am-2pm is chop territory — extra caution or skip.' },
];

export const CHECKLISTS = {
  FB: FB_CHECKLIST,
  LR: LR_CHECKLIST,
  BT: BT_CHECKLIST,
  BD: BD_CHECKLIST,
};

export const SETUP_TYPE_LABELS = {
  FB: 'Failed Breakdown',
  LR: 'Level Reclaim',
  BT: 'Back-test',
  BD: 'Breakdown Short',
};

// Backwards-compatible default export — most call sites pass setupType
// explicitly now, but existing code/tests referencing CHECKLIST directly
// (e.g. trade-detail replay before a setup_type is known) gets FB's list.
export const CHECKLIST = FB_CHECKLIST;

export function getChecklist(setupType) {
  return CHECKLISTS[setupType] ?? FB_CHECKLIST;
}

export function getGates(setupType) {
  return getChecklist(setupType).filter((c) => c.weight === 'gate');
}

export function getBonuses(setupType) {
  return getChecklist(setupType).filter((c) => c.weight === 'bonus');
}

export const GATES = getGates('FB');
export const BONUSES = getBonuses('FB');

export function computeScore(checks = {}, setupType = 'FB') {
  const gates = getGates(setupType);
  const bonuses = getBonuses(setupType);
  const gatesMet = gates.filter((c) => checks[c.id]).length;
  const bonusMet = bonuses.filter((c) => checks[c.id]).length;
  if (bonuses.length === 0) return Math.round((gatesMet / gates.length) * 100);
  return Math.round((gatesMet / gates.length) * 60 + (bonusMet / bonuses.length) * 40);
}

export function getVerdict(checks = {}, setupType = 'FB', depth = 'shallow') {
  const checklist = getChecklist(setupType);
  const phases = [...new Set(checklist.map((c) => c.phase))].sort();
  const score = computeScore(checks, setupType);

  // A phase is "done" once every gate item in that phase (and all prior
  // phases) is checked. Bonus items don't gate phase progression.
  let donePhase = 0;
  for (const phase of phases) {
    const gatesInPhase = checklist.filter((c) => c.phase === phase && c.weight === 'gate');
    const allMet = gatesInPhase.every((c) => checks[c.id]);
    if (allMet) donePhase = phase;
    else break;
  }

  const lastPhase = phases[phases.length - 1];

  if (donePhase === 0) return { label: 'No setup', state: 'idle', score };
  if (donePhase < lastPhase) {
    const label = setupType === 'FB' || setupType === 'LR'
      ? (donePhase === 1
        ? (setupType === 'FB' ? 'Low not yet reclaimed' : 'Shelf not yet reclaimed')
        : depth === 'deep'
          ? 'Waiting for acceptance — deep flush, be patient (30-60+ min)'
          : 'Waiting for acceptance')
      : 'Building setup — criteria incomplete';
    return { label, state: 'warning', score };
  }

  if (score < 60) return { label: 'Below minimum — do not trade', state: 'warning', score };
  if (score < 70) return { label: 'Marginal setup — reduce size or pass', state: 'warning', score };
  if (score < 85) return { label: 'Valid setup', state: 'success', score };
  return { label: 'High conviction (A+)', state: 'success', score };
}

export const MISTAKE_FLAGS = [
  'Impulse trade (not pre-planned)',
  'Rushed acceptance — entered too early',
  'Chased entry above ideal level',
  'FOMO — entered without conviction',
  'Over-traded (more than 1 trade today)',
  'Moved stop against rules',
  'Skipped T1 — went for home run',
  'Traded outside 8-11am / 2pm+ window ET',
  'Flipped long/short repeatedly',
  'Sized up beyond tier rules',
  'Held loser past stop',
];
