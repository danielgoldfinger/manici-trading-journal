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
    label: 'The initial bounce off the low was strong enough to trade on its own',
    sub: "This proves real demand existed at that price. If the bounce off the low was weak or immediately faded, the market wasn't interested in defending it — the low isn't significant. A good FB low should have produced a bounce you'd have wanted to long even before the flush happened." },
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

// ─── Ripster MTF Cloud setups ──────────────────────────────────────────────
// Phase 1 = shared Regime Gate (hard veto, gate items).
// Phases 2-5 = setup-specific criteria.
// All 7 setups fit within the existing 14 boolean column slots.
// Column allocation per setup:
//   Phase 1 (regime):      c_p1_1, c_p1_2, c_p1_3
//   Phase 2 (structure):   c_p1_4, c_p2_1[, c_p2_2]
//   Phase 3 (trigger):     c_p2_2[or c_p3_1], c_p3_1, c_p3_2[, c_p3_3]
//   Phase 4 (confirm):     c_p3_3[or c_p3_4], c_p3_4[or c_p3_5]
//   Phase 5 (entry):       c_p3_5[or c_p4_1], c_p4_1[or c_p4_2], c_p4_2[or c_p4_3]
// Exact mapping varies by setup to stay sequential in the pool of 14 IDs.

const REGIME_GATE = [
  { id: 'c_p1_1', phase: 1, weight: 'gate',
    label: 'Not inside the Amateur Move window (first 3 min)',
    sub: 'The opening amateur move typically gets faded. Let the first 3 minutes print before considering any entry.' },
  { id: 'c_p1_2', phase: 1, weight: 'gate',
    label: 'Not inside dead chop window',
    sub: 'Avoid the 11am–2pm grind unless the session already established a strong directional trend before 11am.' },
  { id: 'c_p1_3', phase: 1, weight: 'gate',
    label: 'At least one trend signal present',
    sub: 'New HOD/LOD by 10–10:30 AM, extended beyond PMH/PML, prior day high/low broken, price riding the 5/12 cloud directionally, or OR flag break into 10–10:30.' },
];

// Setup R_BRK — MTF Breakout (Bullish Continuation): 14 items
const R_BRK_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'Higher-timeframe MTF cloud identified on 10m chart',
    sub: '1H 34/50 or Daily 20/21 & 50/55 cloud visible and clearly positioned relative to price.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Price was already trending up before reaching this cloud',
    sub: 'Not a first test from chop — the uptrend should be established before the cloud comes into play.' },
  { id: 'c_p2_2', phase: 2, weight: 'gate',
    label: '5/12 (10-min) cloud already bullish',
    sub: 'The fast cloud is green and price is trading above it — trend alignment across timeframes.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Price closes above the MTF cloud (not just a wick)',
    sub: 'Candle bodies closing above the cloud edge. A wick through then immediate return = not a breakout.' },
  { id: 'c_p3_2', phase: 3, weight: 'gate',
    label: 'RVOL confirms on the break',
    sub: 'Elevated relative volume on the breakout candle — conviction behind the move.' },
  { id: 'c_p3_3', phase: 3, weight: 'gate',
    label: 'No immediate rejection wick back into the cloud',
    sub: 'Price accepted above the cloud — not instantly reversing back through it after the break.' },
  { id: 'c_p3_4', phase: 4, weight: 'bonus',
    label: 'Follow-through candle holds above cloud',
    sub: 'The next candle after the break also closes above the MTF cloud, confirming the move.' },
  { id: 'c_p3_5', phase: 4, weight: 'bonus',
    label: '5/12 cloud width expanding (momentum proxy)',
    sub: 'The fast cloud is widening in the direction of the trade — signals strengthening momentum.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Stop placed at/just inside the broken MTF cloud edge',
    sub: 'Stop makes the trade invalid if price re-enters the cloud — technically sound, not arbitrary.' },
  { id: 'c_p4_2', phase: 5, weight: 'bonus',
    label: 'Target = next MTF cloud/resistance zone identified',
    sub: 'Know where 75% comes off before entering. Next significant Ripster level above.' },
  { id: 'c_p4_3', phase: 5, weight: 'bonus',
    label: 'Invalidation defined (close back below MTF cloud)',
    sub: 'Clear exit rule if the breakout fails — a close back below the cloud cancels the setup.' },
];

// Setup R_FLU — MTF Flush (Bearish Continuation): 14 items, mirror of R_BRK
const R_FLU_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'Higher-timeframe MTF cloud identified on 10m chart',
    sub: '1H 34/50 or Daily 20/21 & 50/55 cloud visible and clearly positioned relative to price.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Price was already trending down before reaching this cloud',
    sub: 'Not a first test from chop — the downtrend should be established before the cloud comes into play.' },
  { id: 'c_p2_2', phase: 2, weight: 'gate',
    label: '5/12 (10-min) cloud already bearish',
    sub: 'The fast cloud is red and price is trading below it — trend alignment across timeframes.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Price closes below the MTF cloud (not just a wick)',
    sub: 'Candle bodies closing below the cloud edge. A wick through then immediate reclaim = not a breakdown.' },
  { id: 'c_p3_2', phase: 3, weight: 'gate',
    label: 'RVOL confirms on the break',
    sub: 'Elevated relative volume on the breakdown candle — conviction behind the move.' },
  { id: 'c_p3_3', phase: 3, weight: 'gate',
    label: 'No immediate reclaim wick back above the cloud',
    sub: 'Price accepted below the cloud — not instantly reversing back through it after the break.' },
  { id: 'c_p3_4', phase: 4, weight: 'bonus',
    label: 'Follow-through candle holds below cloud',
    sub: 'The next candle after the break also closes below the MTF cloud, confirming the move.' },
  { id: 'c_p3_5', phase: 4, weight: 'bonus',
    label: '5/12 cloud width expanding to the downside (momentum proxy)',
    sub: 'The fast cloud is widening downward — signals strengthening bearish momentum.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Stop placed at/just above the broken MTF cloud edge',
    sub: 'Stop makes the trade invalid if price re-enters the cloud from below.' },
  { id: 'c_p4_2', phase: 5, weight: 'bonus',
    label: 'Target = next lower MTF cloud/support zone identified',
    sub: 'Know where 75% comes off before entering. Next significant Ripster level below.' },
  { id: 'c_p4_3', phase: 5, weight: 'bonus',
    label: 'Invalidation defined (close back above MTF cloud)',
    sub: 'Clear exit rule if the breakdown fails — a close back above the cloud cancels the setup.' },
];

// Setup R_MAG — MTF Magnet (Continuation to next cloud): 12 items
const R_MAG_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'At least 2 distinct MTF clouds stacked/visible on the chart',
    sub: 'e.g. 1H 34/50 + Daily 20/21, or triple with Daily 50/55. Both must be clearly identifiable.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'First cloud already broken and confirmed (not in progress)',
    sub: 'The first cloud was broken cleanly — the setup is about the continuation move toward the second cloud, not the initial break.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: 'Price moving directionally toward the second (untested) MTF cloud',
    sub: 'Price is in motion toward the magnet cloud — not stalling or chopping between the two clouds.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'No major structure between price and target cloud that would stall it',
    sub: 'Prior swing highs/lows or key levels between price and the magnet reduce odds. Clean air between = higher confidence.' },
  { id: 'c_p3_2', phase: 4, weight: 'bonus',
    label: 'Momentum/RVOL still supportive of the move continuing',
    sub: 'Volume and momentum are not fading — the move hasn\'t exhausted itself before reaching the magnet.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: '5/12 (10-min) cloud aligned with direction of travel',
    sub: 'Fast cloud is pointing the same direction as the magnet move — trend alignment.' },
  { id: 'c_p3_4', phase: 5, weight: 'bonus',
    label: 'Target = second MTF cloud clearly defined (measured-move trade)',
    sub: 'This is NOT an open-ended trade — the target IS the magnet cloud. Sized for that R/R.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Stop at the first (already-broken) MTF cloud',
    sub: 'A close back through the first cloud invalidates the continuation thesis.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Sized appropriately for a measured-move, not open-ended',
    sub: 'Exit at the magnet — don\'t hold expecting more. The whole thesis is the pull to the second cloud.' },
];

// Setup R_REJ — MTF Rejection (Reversal at resistance cloud): 13 items
const R_REJ_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'Price approaching MTF cloud from below (testing as resistance) after an extended move',
    sub: 'The move into the cloud should be extended — a fresh, tired run into overhead MTF supply.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'This is the 1st or 2nd test of this cloud level',
    sub: 'Reversal odds drop significantly on the 3rd+ test as the level gets eaten through. 1st test is best.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: 'Price tags the MTF cloud and fails to close through it',
    sub: 'Price reached the cloud but no candle body closed above it — supply is holding.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Rejection candle on the 10-min chart (wick through, close back below)',
    sub: 'A clear rejection bar — the wick tested the cloud, the body closed away from it.' },
  { id: 'c_p3_2', phase: 3, weight: 'gate',
    label: '10-min 5/12 cloud confirms rejection (turns red or price fails to reclaim it)',
    sub: 'The fast cloud flipped bearish or price failed to reclaim it — trend timeframe is now aligned short.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: 'RVOL present on the rejection candle (not a low-volume drift-back)',
    sub: 'Elevated volume on the rejection bar means sellers showed up with conviction at the MTF cloud.' },
  { id: 'c_p3_4', phase: 4, weight: 'bonus',
    label: 'Follow-through candle continues away from the cloud',
    sub: 'The candle after the rejection bar also moves away — momentum confirmed.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Stop placed just above the MTF cloud high (the level being rejected)',
    sub: 'A close above the cloud invalidates the rejection — stop must sit above that level.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Target = prior support / next lower MTF cloud identified',
    sub: 'Know where 75% comes off. Next significant Ripster level below.' },
  { id: 'c_p4_2', phase: 5, weight: 'bonus',
    label: 'Invalidation defined (close back above MTF cloud)',
    sub: 'Clear exit rule if the rejection fails — a close back above the cloud cancels the setup.' },
];

// Setup R_BNC — MTF Bounce (Reversal at support cloud): 13 items, mirror of R_REJ
const R_BNC_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'Price approaching MTF cloud from above (testing as support) after an extended move',
    sub: 'The sell-off into the cloud should be extended — a tired move into major MTF demand.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'This is the 1st or 2nd test of this cloud level',
    sub: 'Bounce odds drop significantly on the 3rd+ test. 1st touch of a cloud is the highest-quality reversal.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: 'Price tags the MTF cloud and holds (does not close through)',
    sub: 'Price reached the cloud but no candle body closed below it — demand is holding.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Bounce candle on the 10-min chart (wick through, close back above)',
    sub: 'A clear reversal bar — the wick tested into the cloud, the body closed above it.' },
  { id: 'c_p3_2', phase: 3, weight: 'gate',
    label: '10-min 5/12 cloud confirms bounce (turns green or price reclaims it)',
    sub: 'The fast cloud flipped bullish or price reclaimed it — trend timeframe is now aligned long.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: 'RVOL present on the bounce candle (not a low-volume drift-up)',
    sub: 'Elevated volume on the bounce bar — buyers showed up with conviction at the MTF cloud.' },
  { id: 'c_p3_4', phase: 4, weight: 'bonus',
    label: 'Follow-through candle continues away from the cloud upward',
    sub: 'The candle after the bounce bar also moves up — momentum confirmed.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Stop placed just below the MTF cloud low (the level being defended)',
    sub: 'A close below the cloud invalidates the bounce — stop must sit below that level.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Target = prior resistance / next higher MTF cloud identified',
    sub: 'Know where 75% comes off. Next significant Ripster level above.' },
  { id: 'c_p4_2', phase: 5, weight: 'bonus',
    label: 'Invalidation defined (close back below MTF cloud)',
    sub: 'Clear exit rule if the bounce fails — a close back below the cloud cancels the setup.' },
];

// Setup R_CRL — 5/12 Cloud Curl (trend-riding curl signal): 12 items
const R_CRL_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'Prior trend/state clearly identified',
    sub: 'Was price below/riding a bearish 5/12 cloud, or above/riding a bullish one? The curl is meaningful only as a change from a defined prior state.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Relationship to 34/50 cloud noted',
    sub: 'Curls occurring above the 34/50 cloud (bullish curl) or below it (bearish curl) are higher quality. Curls cutting through the 34/50 cloud have lower follow-through odds.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: '5/12 EMA cloud curls and flips color',
    sub: 'The cloud changes from red-to-green (bullish) or green-to-red (bearish) — the actual trigger event.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Not an immediate "5/12 Fails" pattern',
    sub: 'A failed curl that reverts back through the 34/50 immediately is an invalidation, not an entry. Confirm the curl is holding before acting.' },
  { id: 'c_p3_2', phase: 4, weight: 'bonus',
    label: 'Price holds on the new side of the curling cloud for at least one full candle close',
    sub: 'One closed candle on the new side confirms the curl isn\'t a fake-out.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: 'Sub-pattern identified: Curl vs. 5/12 Reclaim',
    sub: '"5/12 Reclaim" = fake breakdown + immediate bullish reclaim of the cloud. Both are valid but Reclaims have a different risk profile (faster, more aggressive entry).' },
  { id: 'c_p3_4', phase: 5, weight: 'bonus',
    label: 'Stop on the opposite side of the 5/12 cloud',
    sub: 'If price crosses back through the curling cloud, the thesis is invalid. Stop must be on the other side.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Target identified (34/50 cloud or next MTF level)',
    sub: 'If curling toward the 34/50 cloud, that is T1. If already through it, target the next MTF level.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Invalidation defined (5/12 curls back / fails immediately)',
    sub: 'A re-curl back to the original color is your stop signal, not just price touching the cloud edge.' },
];

// Setup R_CON — MTF Confluence (stacked clouds = major S/R zone): 12 items
const R_CON_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'MTF clouds stacking identified (specify which: 1H 34/50 + Daily 20/21, etc.)',
    sub: 'Name the exact clouds in your notes. Knowing which timeframes are stacked is key to sizing the stop and target correctly.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Genuine overlap confirmed — not just two clouds loosely in the same area',
    sub: 'The clouds should be touching or within a few points of each other. "In the same area" is not Confluence.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: 'Price has reached the confluence zone',
    sub: 'Price is actually at the stacked cloud level, not approaching it from far away.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Reaction at the zone matches a known pattern (Rejection, Bounce, or Breakout)',
    sub: 'Confluence is a context multiplier — it amplifies one of the other Ripster setups. You still need an actual pattern firing at the zone.' },
  { id: 'c_p3_2', phase: 4, weight: 'bonus',
    label: 'Stronger RVOL than a single-cloud setup would require',
    sub: 'At major confluence, expect and require bigger volume on the reaction. Low-volume reactions at confluence are suspect.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: '10-min 5/12 cloud agrees with reaction direction',
    sub: 'Fast cloud aligned with the trade direction — multi-timeframe confluence including the fast cloud.' },
  { id: 'c_p3_4', phase: 5, weight: 'bonus',
    label: 'Stop sized for the full confluence zone width (may require reducing size)',
    sub: 'Stacked clouds = wider zone = wider stop. If this makes the stop too large for normal size, reduce contracts to keep risk the same.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Target = next major structure level beyond the zone',
    sub: 'Confluence zones are major pivots — the move away from them can be large. Target the next significant level.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Invalidation = full close through the entire confluence zone',
    sub: 'At stacked clouds, a single cloud being breached is not necessarily the stop. Wait for a close through the entire stacked zone.' },
];

// ─── Ripster EMA Cloud intraday setups (from Cloud Bible) ─────────────────
// 34-50 cloud = overall trend direction. 5-12 cloud = trend-riding / pullback
// entry tool. These 4 setups are the core intraday trade entries: bounce off
// or rejection at the 5-12 or 34-50 cloud WITH the trend, not against it.

// R_512B — 5/12 Cloud Bounce (long pullback in uptrend): 13 items
const R_512B_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: '34-50 cloud is bullish (green) — overall trend is up',
    sub: 'Price is above the 34-50 EMA cloud on the 10-min chart. Over 50 EMA = bullish. This is not a counter-trend trade.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Higher highs and higher lows structure intact on 10-min',
    sub: 'The trend is confirmed by price structure, not just cloud color. An HH/HL sequence = valid uptrend to trade with.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: 'Price has pulled back to touch or enter the 5/12 cloud',
    sub: 'The 5/12 cloud acts as a fluid trendline. Price must actually reach the cloud — don\'t anticipate the touch.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Bounce candle forming: wick into cloud, body closes above',
    sub: 'A reversal bar at the cloud edge — the wick tested into it, but the candle body closed back above. Not just a touch.' },
  { id: 'c_p3_2', phase: 3, weight: 'gate',
    label: '5/12 cloud still green (trend intact, not flipping red)',
    sub: 'If the cloud has already flipped red, this is no longer a pullback bounce — it\'s a potential trend change. Skip it.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: 'Follow-through candle closes above 5/12 cloud',
    sub: 'The next 10-min candle also closes above the cloud — confirms the bounce held.' },
  { id: 'c_p3_4', phase: 4, weight: 'bonus',
    label: 'RVOL supporting the bounce',
    sub: 'Elevated relative volume on the bounce candle shows buyers showing up at the cloud with conviction.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Stop placed below the 5/12 cloud',
    sub: 'A 10-min candle close below the cloud is your exit signal per Ripster\'s rules. Stop must sit below.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Target = prior high or next resistance level identified',
    sub: 'Know where 75% comes off. The trend-ride continues as long as price holds the 5/12 cloud on closes.' },
  { id: 'c_p4_2', phase: 5, weight: 'bonus',
    label: 'Invalidation: 10-min candle closes below the 5/12 cloud',
    sub: 'This is the Ripster exit rule — ride it while price holds the cloud on closes, get out when it doesn\'t.' },
];

// R_512R — 5/12 Cloud Reject (short pop in downtrend): 13 items, mirror of R_512B
const R_512R_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: '34-50 cloud is bearish (red) — overall trend is down',
    sub: 'Price is below the 34-50 EMA cloud on the 10-min chart. Under 50 EMA = bearish. Only short when price is below the 34-50 cloud (per Ripster intraday rules).' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Lower highs and lower lows structure intact on 10-min',
    sub: 'Trend confirmed by price structure. An LH/LL sequence = valid downtrend to trade with.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: 'Price has popped up to touch or enter the 5/12 cloud',
    sub: 'The 5/12 cloud acts as overhead resistance in a downtrend. Price must actually reach it — don\'t anticipate.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Rejection candle forming: wick into cloud, body closes below',
    sub: 'A reversal bar at the cloud — wick tested into it, body closed back below. Supply showing up at the cloud.' },
  { id: 'c_p3_2', phase: 3, weight: 'gate',
    label: '5/12 cloud still red (trend intact, not flipping green)',
    sub: 'If the cloud has flipped green, the trend may be changing. This is no longer a simple rejection trade — skip.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: 'Follow-through candle closes below 5/12 cloud',
    sub: 'The next 10-min candle also closes below the cloud — confirms the rejection held.' },
  { id: 'c_p3_4', phase: 4, weight: 'bonus',
    label: 'RVOL on the rejection candle',
    sub: 'Elevated volume on the rejection bar — sellers showing up with conviction at the cloud.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Stop placed above the 5/12 cloud',
    sub: 'A 10-min candle close above the cloud is the exit signal. Stop must sit above the cloud edge.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Target = prior low or next support level identified',
    sub: 'Know where 75% comes off. Trend-ride continues as long as price stays below the 5/12 cloud on closes.' },
  { id: 'c_p4_2', phase: 5, weight: 'bonus',
    label: 'Invalidation: 10-min candle closes above the 5/12 cloud',
    sub: 'The Ripster exit rule — short becomes long when price crosses back above. No opinions, just the rule.' },
];

// R_3450B — 34-50 Cloud Bounce (deeper pullback long): 13 items
const R_3450B_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'Overall trend is bullish — prior context shows uptrend',
    sub: 'Higher highs and higher lows on 10-min, OR 34-50 cloud has been green/bullish before this pullback. The 34-50 bounce is only valid in an established uptrend.' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Price has pulled back deeply enough to reach the 34-50 cloud',
    sub: 'The 34-50 cloud is the major intraday S/R level (the "risk level" per Ripster). Price must actually reach it, not just approach the 5/12 cloud.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: 'Price tags or enters the 34-50 cloud from above — no full candle close below',
    sub: 'Price can wick through the cloud, but candle bodies should not be closing below it. A full close below = trend change, not a bounce.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Bounce candle at the 34-50 cloud (wick through, body closes above)',
    sub: 'Reversal bar at the 34-50 level — the major demand zone held. This is the primary position-sizing level per the system.' },
  { id: 'c_p3_2', phase: 3, weight: 'gate',
    label: '5/12 cloud confirms bounce (turns green or price reclaims it)',
    sub: 'The fast cloud agreeing with the bounce adds conviction. 34-50 bounce + 5/12 flip = strong long signal.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: 'RVOL present on the bounce candle (buyers showed up)',
    sub: 'Volume on the reversal bar at the 34-50 level. Low-volume touches of the 34-50 cloud can fail — volume confirms demand.' },
  { id: 'c_p3_4', phase: 4, weight: 'bonus',
    label: 'Follow-through candle confirms — closes above 34-50 cloud and 5/12',
    sub: 'Both clouds now below price = strong confirmation the pullback is over and trend is resuming.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Stop placed below the 34-50 cloud (your risk level)',
    sub: 'Per Ripster: "Whenever you long, the 34-50 EMA cloud is your risk level." A close below = exit, trend is now bearish.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Target = prior high or significant resistance above',
    sub: 'Know where 75% comes off before entering. This is a deeper pullback so the R/R should be better than a 5/12 bounce.' },
  { id: 'c_p4_2', phase: 5, weight: 'bonus',
    label: 'Invalidation: close below the 34-50 cloud = trend flips bearish',
    sub: 'Per Ripster system: discipline required — "long becomes short" when this happens. No arguing with the cloud.' },
];

// R_3450R — 34-50 Cloud Reject (deeper pop short): 13 items, mirror of R_3450B
const R_3450R_CHECKLIST = [
  ...REGIME_GATE,
  { id: 'c_p1_4', phase: 2, weight: 'gate',
    label: 'Overall trend is bearish — prior context shows downtrend',
    sub: 'Lower highs and lower lows on 10-min, OR 34-50 cloud has been red/bearish before this pop. Only short when price is below the 34-50 cloud (intraday rule).' },
  { id: 'c_p2_1', phase: 2, weight: 'gate',
    label: 'Price has popped up significantly enough to reach the 34-50 cloud',
    sub: 'The 34-50 cloud is the major overhead resistance in a downtrend. Price must reach the actual cloud, not just the 5/12.' },
  { id: 'c_p2_2', phase: 3, weight: 'gate',
    label: 'Price tags or enters the 34-50 cloud from below — no full candle close above',
    sub: 'Price can wick through, but candle bodies should not close above the 34-50 cloud. A full close above = potential trend change.' },
  { id: 'c_p3_1', phase: 3, weight: 'gate',
    label: 'Rejection candle at the 34-50 cloud (wick through, body closes below)',
    sub: 'Reversal bar at the 34-50 level — the major supply zone held. Strong rejection from the primary resistance cloud.' },
  { id: 'c_p3_2', phase: 3, weight: 'gate',
    label: '5/12 cloud confirms rejection (stays red or flips back red)',
    sub: 'The fast cloud agreeing with the rejection. 34-50 reject + 5/12 red = strong short signal.' },
  { id: 'c_p3_3', phase: 4, weight: 'bonus',
    label: 'RVOL present on the rejection candle (sellers showed up)',
    sub: 'Volume on the reversal bar at the 34-50 level confirms supply. Low-volume pops to the cloud can squeeze — volume protects you.' },
  { id: 'c_p3_4', phase: 4, weight: 'bonus',
    label: 'Follow-through candle confirms — closes below 34-50 cloud and 5/12',
    sub: 'Both clouds now above price = strong confirmation the pop failed and downtrend is resuming.' },
  { id: 'c_p3_5', phase: 5, weight: 'bonus',
    label: 'Stop placed above the 34-50 cloud (your risk level)',
    sub: 'A close above the 34-50 cloud = trend flips bullish. Exit short, consider going long per system rules.' },
  { id: 'c_p4_1', phase: 5, weight: 'bonus',
    label: 'Target = prior low or significant support below',
    sub: 'Know where 75% comes off. The R/R on a 34-50 rejection should be better than a 5/12 reject given the deeper move required.' },
  { id: 'c_p4_2', phase: 5, weight: 'bonus',
    label: 'Invalidation: close above the 34-50 cloud = trend flips bullish',
    sub: 'Per Ripster system: "short becomes long" when price crosses above. Discipline required — no arguing with the cloud.' },
];

export const CHECKLISTS = {
  FB: FB_CHECKLIST,
  LR: LR_CHECKLIST,
  BT: BT_CHECKLIST,
  BD: BD_CHECKLIST,
  R_BRK: R_BRK_CHECKLIST,
  R_FLU: R_FLU_CHECKLIST,
  R_MAG: R_MAG_CHECKLIST,
  R_REJ: R_REJ_CHECKLIST,
  R_BNC: R_BNC_CHECKLIST,
  R_CRL: R_CRL_CHECKLIST,
  R_CON: R_CON_CHECKLIST,
  R_512B: R_512B_CHECKLIST,
  R_512R: R_512R_CHECKLIST,
  R_3450B: R_3450B_CHECKLIST,
  R_3450R: R_3450R_CHECKLIST,
};

export const SETUP_TYPE_LABELS = {
  FB: 'Failed Breakdown',
  LR: 'Level Reclaim',
  BT: 'Back-test',
  BD: 'Breakdown Short',
  R_BRK: 'Ripster — MTF Breakout',
  R_FLU: 'Ripster — MTF Flush',
  R_MAG: 'Ripster — MTF Magnet',
  R_REJ: 'Ripster — MTF Rejection',
  R_BNC: 'Ripster — MTF Bounce',
  R_CRL: 'Ripster — 5/12 Curl',
  R_CON: 'Ripster — MTF Confluence',
  R_512B: 'Ripster — 5/12 Bounce',
  R_512R: 'Ripster — 5/12 Reject',
  R_3450B: 'Ripster — 34-50 Bounce',
  R_3450R: 'Ripster — 34-50 Reject',
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
    let label;
    if (setupType === 'FB' || setupType === 'LR') {
      label = donePhase === 1
        ? (setupType === 'FB' ? 'Low not yet reclaimed' : 'Shelf not yet reclaimed')
        : depth === 'deep'
          ? 'Waiting for acceptance — deep flush, be patient (30-60+ min)'
          : 'Waiting for acceptance';
    } else if (setupType.startsWith('R_')) {
      const RIPSTER_PHASE_NAMES = { 1: 'Regime gate', 2: 'Structure', 3: 'Trigger', 4: 'Confirmation' };
      label = donePhase === 1
        ? 'Regime gate passed — structure criteria not yet met'
        : `${RIPSTER_PHASE_NAMES[donePhase] ?? 'Phase ' + donePhase} complete — next phase incomplete`;
    } else {
      label = 'Building setup — criteria incomplete';
    }
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
