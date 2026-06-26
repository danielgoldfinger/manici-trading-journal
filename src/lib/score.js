export const CHECKLIST = [
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

export const GATES  = CHECKLIST.filter(c => c.weight === 'gate');
export const BONUSES = CHECKLIST.filter(c => c.weight === 'bonus');

export function computeScore(checks = {}) {
  const gatesMet  = GATES.filter(c => checks[c.id]).length;
  const bonusMet  = BONUSES.filter(c => checks[c.id]).length;
  return Math.round((gatesMet / GATES.length) * 60 + (bonusMet / BONUSES.length) * 40);
}

export function getVerdict(checks = {}, depth = 'shallow') {
  const p1done = ['c_p1_1','c_p1_2','c_p1_3','c_p1_4'].every(id => checks[id]);
  const p2done = p1done && ['c_p2_1','c_p2_2'].every(id => checks[id]);
  const p3done = p2done && checks['c_p3_5'];
  const score  = computeScore(checks);

  if (!p1done) return { label: 'No setup',              state: 'idle',    score };
  if (!p2done) return { label: 'Low not yet reclaimed', state: 'warning', score };
  if (!p3done) return {
    label: depth === 'deep'
      ? 'Waiting for acceptance — deep flush, be patient (30-60+ min)'
      : 'Waiting for acceptance',
    state: 'warning', score
  };
  if (score < 70) return { label: 'Marginal setup — reduce size or pass', state: 'warning', score };
  if (score < 85) return { label: 'Valid setup',                           state: 'success', score };
  return               { label: 'High conviction (A+)',                    state: 'success', score };
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
