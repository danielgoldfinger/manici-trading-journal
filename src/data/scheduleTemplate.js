// day: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
// start/end: "HH:MM" 24-hour

export const CATEGORIES = {
  sauna:    { label: 'Sauna',            color: '#f08030', bg: 'rgba(240,128,48,0.15)' },
  morning:  { label: 'Morning Routine',  color: '#6fa3e0', bg: 'rgba(111,163,224,0.12)' },
  news:     { label: 'News / Reports',   color: '#f0a050', bg: 'rgba(240,160,80,0.14)' },
  focus:    { label: 'Trading Lockdown', color: '#e05555', bg: 'rgba(224,85,85,0.14)' },
  fitness:  { label: 'Gym',             color: '#4caf50', bg: 'rgba(76,175,80,0.13)' },
  wilder:   { label: 'Wilder',           color: '#9c6fd6', bg: 'rgba(156,111,214,0.14)' },
  lunch:    { label: 'Lunch',            color: '#68b068', bg: 'rgba(104,176,104,0.12)' },
  market:   { label: 'Market Watch',     color: '#4f8ef7', bg: 'rgba(79,142,247,0.14)' },
  meditate: { label: 'Meditation',       color: '#c084fc', bg: 'rgba(192,132,252,0.14)' },
  golf:     { label: 'Golf Sim',         color: '#7ec850', bg: 'rgba(126,200,80,0.12)' },
  run:      { label: 'Run',              color: '#2dd4bf', bg: 'rgba(45,212,191,0.12)' },
  read:     { label: 'Reading',          color: '#5bc4f5', bg: 'rgba(91,196,245,0.12)' },
  admin:    { label: 'Admin / Strategy', color: '#e0b954', bg: 'rgba(224,185,84,0.12)' },
  personal: { label: 'Personal / Maggie',color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  sleep:    { label: 'Sleep / Wind Down',color: '#3a3d50', bg: 'rgba(58,61,80,0.25)' },
  free:     { label: 'Unstructured',     color: '#555570', bg: 'rgba(85,85,112,0.18)' },
  dinner:   { label: 'Dinner',           color: '#e07070', bg: 'rgba(224,112,112,0.12)' },
};

// 2026 FOMC Wednesdays (hard-coded, update annually)
export const FOMC_WEDNESDAYS = new Set([
  '2026-01-28', '2026-03-18', '2026-04-29', '2026-06-17',
  '2026-07-29', '2026-09-16', '2026-10-28', '2026-12-09',
]);

function b(id, day, start, end, label, sub, category) {
  return { id, day, start, end, label, sub, category };
}

// Helpers
const WKDAY_SAUNA    = [1,2,3,4,5];
const WKDAY_ALL      = [0,1,2,3,4,5,6];

// Build flat array grouped by day so getDayBlocks is O(1) via filter
const RAW = [
  // ── MONDAY ──────────────────────────────────────────────
  b('1_0500_sauna',    1,'05:00','05:30','Sauna + Meditation','20 min · stretch · meditate · breathe','sauna'),
  b('1_0530_morning',  1,'05:30','06:00','Shower + Market Scan','Overnight check · anything crazy?','morning'),
  b('1_0600_news',     1,'06:00','06:30','Breakfast + Morning Agent','FT · WSJ · NYT · futures prices','news'),
  b('1_0630_focus',    1,'06:30','10:00','Trading Lockdown','Charts → active trading → final push · one screen','focus'),
  b('1_1000_fitness',  1,'10:00','12:00','Gym','2 hrs · market chop window','fitness'),
  b('1_1200_wilder',   1,'12:00','12:30','Maya Walk','15 min · bathroom break','wilder'),
  b('1_1230_lunch',    1,'12:30','13:00','Lunch at Desk','Light market watch','lunch'),
  b('1_1300_market',   1,'13:00','14:00','Market Watch — Close','Cash session final hour · into the bell','market'),
  b('1_1400_news',     1,'14:00','14:30','Afternoon Report','News agent · day recap','news'),
  b('1_1430_meditate', 1,'14:30','15:00','Afternoon Meditation','15–20 min · reset','meditate'),
  b('1_1500_golf',     1,'15:00','16:00','Golf Sim','Unplugged · futures closed','golf'),
  b('1_1600_read',     1,'16:00','17:00','Read','One book · focused','read'),
  b('1_1700_dinner',   1,'17:00','17:30','Dinner Prep','Wind down · casual market glance','dinner'),
  b('1_1730_admin',    1,'17:30','18:30','Wilder Lead Gen','DMs · Nextdoor · Instagram outreach','admin'),
  b('1_1830_personal', 1,'18:30','19:30','Time with Maggie','Dinner · hang · decompress · 🚫 screens off 7:30','personal'),
  b('1_1930_sleep',    1,'19:30','21:00','Wind Down','No work · no screens · in bed by 8 · lights out 9','sleep'),

  // ── TUESDAY ─────────────────────────────────────────────
  b('2_0500_sauna',    2,'05:00','05:30','Sauna + Meditation','20 min · stretch · meditate · breathe','sauna'),
  b('2_0530_morning',  2,'05:30','06:00','Shower + Market Scan','Overnight check · anything crazy?','morning'),
  b('2_0600_news',     2,'06:00','06:30','Breakfast + Morning Agent','FT · WSJ · NYT · futures prices','news'),
  b('2_0630_focus',    2,'06:30','10:00','Trading Lockdown','Charts → active trading → final push · one screen','focus'),
  b('2_1000_fitness',  2,'10:00','12:00','Gym','2 hrs · market chop window','fitness'),
  b('2_1200_wilder',   2,'12:00','12:30','Maya Walk','15 min · bathroom break','wilder'),
  b('2_1230_lunch',    2,'12:30','13:00','Lunch at Desk','Light market watch','lunch'),
  b('2_1300_market',   2,'13:00','14:00','Market Watch — Close','Cash session final hour · into the bell','market'),
  b('2_1400_news',     2,'14:00','14:30','Afternoon Report','News agent · day recap','news'),
  b('2_1430_meditate', 2,'14:30','15:00','Afternoon Meditation','15–20 min · reset','meditate'),
  b('2_1500_run',      2,'15:00','16:00','Run','~60 min · tempo or intervals','run'),
  b('2_1600_read',     2,'16:00','17:00','Read','One book · focused','read'),
  b('2_1700_dinner',   2,'17:00','17:30','Dinner Prep','Wind down · casual market glance','dinner'),
  b('2_1730_admin',    2,'17:30','18:30','Wilder Content','Photos · captions · posting · reviews','admin'),
  b('2_1830_personal', 2,'18:30','19:30','Time with Maggie','Dinner · hang · decompress · 🚫 screens off 7:30','personal'),
  b('2_1930_sleep',    2,'19:30','21:00','Wind Down','No work · no screens · in bed by 8 · lights out 9','sleep'),

  // ── WEDNESDAY ───────────────────────────────────────────
  b('3_0500_sauna',    3,'05:00','05:30','Sauna + Meditation','20 min · stretch · meditate · breathe','sauna'),
  b('3_0530_morning',  3,'05:30','06:00','Shower + Market Scan','Overnight check · anything crazy?','morning'),
  b('3_0600_news',     3,'06:00','06:30','Breakfast + Morning Agent','FT · WSJ · NYT · futures prices','news'),
  b('3_0630_focus',    3,'06:30','10:00','Trading Lockdown','Charts → active trading → final push · one screen','focus'),
  b('3_1000_wilder',   3,'10:00','12:00','Wilder — Hike','Pickup · on trail · return + drop off','wilder'),
  b('3_1200_wilder2',  3,'12:00','12:30','Wilder Admin','Invoices · client comms','wilder'),
  b('3_1230_wilder3',  3,'12:30','13:00','Wilder Lead Gen','Find new weekly clients','wilder'),
  b('3_1300_market',   3,'13:00','14:00','Market Watch — Close','Cash session final hour · into the bell','market'),
  b('3_1400_news',     3,'14:00','14:30','Afternoon Report','News agent · day recap','news'),
  b('3_1430_meditate', 3,'14:30','15:00','Afternoon Meditation','15–20 min · only if hike is done','meditate'),
  b('3_1500_free',     3,'15:00','16:00','Wed Buffer','Walk · decompress · no agenda','free'),
  b('3_1600_read',     3,'16:00','17:00','Read','One book · focused','read'),
  b('3_1700_dinner',   3,'17:00','17:30','Dinner Prep','Wind down · casual market glance','dinner'),
  b('3_1730_admin',    3,'17:30','18:30','Light Admin','Invoices · client notes · quick emails','admin'),
  b('3_1830_personal', 3,'18:30','19:30','Time with Maggie','Dinner · hang · decompress · 🚫 screens off 7:30','personal'),
  b('3_1930_sleep',    3,'19:30','21:00','Wind Down','No work · no screens · in bed by 8 · lights out 9','sleep'),

  // ── THURSDAY ────────────────────────────────────────────
  b('4_0500_sauna',    4,'05:00','05:30','Sauna + Meditation','20 min · stretch · meditate · breathe','sauna'),
  b('4_0530_morning',  4,'05:30','06:00','Shower + Market Scan','Overnight check · anything crazy?','morning'),
  b('4_0600_news',     4,'06:00','06:30','Breakfast + Morning Agent','FT · WSJ · NYT · futures prices','news'),
  b('4_0630_focus',    4,'06:30','10:00','Trading Lockdown','Charts → active trading → final push · one screen','focus'),
  b('4_1000_fitness',  4,'10:00','12:00','Gym','2 hrs · market chop window','fitness'),
  b('4_1200_lunch',    4,'12:00','13:00','Lunch at Desk','Light market watch','lunch'),
  b('4_1300_market',   4,'13:00','14:00','Market Watch — Close','Cash session final hour · into the bell','market'),
  b('4_1400_news',     4,'14:00','14:30','Afternoon Report','News agent · day recap','news'),
  b('4_1430_meditate', 4,'14:30','15:00','Afternoon Meditation','15–20 min · reset','meditate'),
  b('4_1500_run',      4,'15:00','16:00','Run','~60 min · easy or intervals','run'),
  b('4_1600_read',     4,'16:00','17:00','Read','One book · focused','read'),
  b('4_1700_dinner',   4,'17:00','17:30','Dinner Prep','Wind down · casual market glance','dinner'),
  b('4_1730_admin',    4,'17:30','18:30','Strategy','Pricing · partnerships · expansion','admin'),
  b('4_1830_personal', 4,'18:30','19:30','Time with Maggie','Dinner · hang · decompress · 🚫 screens off 7:30','personal'),
  b('4_1930_sleep',    4,'19:30','21:00','Wind Down','No work · no screens · in bed by 8 · lights out 9','sleep'),

  // ── FRIDAY ──────────────────────────────────────────────
  b('5_0500_sauna',    5,'05:00','05:30','Sauna + Meditation','20 min · stretch · meditate · breathe','sauna'),
  b('5_0530_morning',  5,'05:30','06:00','Shower + Market Scan','Overnight check · anything crazy?','morning'),
  b('5_0600_news',     5,'06:00','06:30','Breakfast + Morning Agent','FT · WSJ · NYT · futures prices','news'),
  b('5_0630_focus',    5,'06:30','10:00','Trading Lockdown','Charts → active trading → final push · one screen','focus'),
  b('5_1000_fitness',  5,'10:00','12:00','Gym','2 hrs · market chop window','fitness'),
  b('5_1200_wilder',   5,'12:00','12:30','Maya Walk','15 min · bathroom break','wilder'),
  b('5_1230_lunch',    5,'12:30','13:00','Lunch at Desk','Light market watch','lunch'),
  b('5_1300_market',   5,'13:00','14:00','Market Watch — Close','Cash session final hour · into the bell','market'),
  b('5_1400_news',     5,'14:00','14:30','Afternoon Report','News agent · day recap','news'),
  b('5_1430_meditate', 5,'14:30','15:00','Afternoon Meditation','15–20 min · reset','meditate'),
  b('5_1500_golf',     5,'15:00','16:00','Golf Sim','Unplugged · futures closed','golf'),
  b('5_1600_read',     5,'16:00','17:00','Read','One book · focused','read'),
  b('5_1700_dinner',   5,'17:00','17:30','Dinner Prep','Wind down · casual market glance','dinner'),
  b('5_1730_admin',    5,'17:30','18:30','Cleanup + Prep','Inbox · next week ready','admin'),
  b('5_1830_personal', 5,'18:30','19:30','Time with Maggie','Dinner · hang · decompress · 🚫 screens off 7:30','personal'),
  b('5_1930_sleep',    5,'19:30','21:00','Wind Down','No work · no screens · in bed by 8 · lights out 9','sleep'),

  // ── SATURDAY ────────────────────────────────────────────
  b('6_0500_sleep',    6,'05:00','06:30','Sleep In','Wake naturally','sleep'),
  b('6_0630_morning',  6,'06:30','07:30','Weekend Wake Up','Coffee · ease in · no rush','morning'),
  b('6_0730_meditate', 6,'07:30','08:00','Morning Meditation','15–20 min · breath focus','meditate'),
  b('6_0800_run',      6,'08:00','09:30','Run','~60 min · easy or tempo','run'),
  b('6_0930_free',     6,'09:30','14:30','Unstructured','Golf · outdoors · errands · read','free'),
  b('6_1430_meditate', 6,'14:30','15:00','Afternoon Meditation','15–20 min · reset','meditate'),
  b('6_1500_admin',    6,'15:00','16:00','Week Review + Planning','Reflect · set next week\'s intentions · prep calendar','admin'),
  b('6_1600_read',     6,'16:00','17:00','Read','One book · relax','read'),
  b('6_1700_dinner',   6,'17:00','17:30','Dinner','Relax · enjoy','dinner'),
  b('6_1730_personal', 6,'17:30','19:30','Time with Maggie','Evening together · 🚫 screens off 7:30','personal'),
  b('6_1930_sleep',    6,'19:30','21:00','Wind Down','No work · no screens · in bed by 8 · lights out 9','sleep'),

  // ── SUNDAY ──────────────────────────────────────────────
  b('0_0500_sleep',    0,'05:00','06:30','Sleep In','Wake naturally','sleep'),
  b('0_0630_morning',  0,'06:30','07:30','Weekend Wake Up','Coffee · ease in · no rush','morning'),
  b('0_0730_meditate', 0,'07:30','08:00','Morning Meditation','15–20 min · breath focus','meditate'),
  b('0_0800_run',      0,'08:00','09:30','Run — Long Run','~60–90 min · easy pace','run'),
  b('0_0930_free',     0,'09:30','14:30','Unstructured','Golf · outdoors · errands · read','free'),
  b('0_1430_meditate', 0,'14:30','15:00','Afternoon Meditation','15–20 min · reset','meditate'),
  b('0_1500_personal', 0,'15:00','17:00','Rest / Personal','Low key · recharge · prep mindset for week','personal'),
  b('0_1700_dinner',   0,'17:00','17:30','Dinner','Relax · enjoy','dinner'),
  b('0_1730_personal', 0,'17:30','19:30','Time with Maggie','Evening together · 🚫 screens off 7:30','personal'),
  b('0_1930_sleep',    0,'19:30','21:00','Wind Down','No work · no screens · in bed by 8 · lights out 9','sleep'),
];

// Build day index for O(1) lookup
const BY_DAY = {};
for (const blk of RAW) {
  if (!BY_DAY[blk.day]) BY_DAY[blk.day] = [];
  BY_DAY[blk.day].push(blk);
}

export function getDayBlocks(dayNum) {
  return BY_DAY[dayNum] ?? [];
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Slot math
export const START_HOUR = 5;   // 5am
export const END_HOUR   = 21;  // 9pm
export const SLOT_H     = 30;  // px per 30-min slot
export const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 2; // 32

export function timeToSlot(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return (h - START_HOUR) * 2 + m / 30;
}

export function slotToLabel(slot) {
  const totalMins = START_HOUR * 60 + slot * 30;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2,'0')}${ampm}`;
}
