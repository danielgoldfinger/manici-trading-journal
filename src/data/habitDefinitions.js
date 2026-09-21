// Stable IDs are used as foreign keys in habit_logs — never change them.
// active_days: 1=Mon…5=Fri, 6=Sat, 0=Sun

export const HABITS = [
  // ── Weekday anchors (Mon–Fri) ──────────────────────────
  {
    id: 'sauna',
    label: 'Sauna + Meditation',
    sub: '5am · 20 min · stretch · breathe',
    category: 'sauna',
    active_days: [1,2,3,4,5],
    color: '#f08030',
  },
  {
    id: 'morning_scan',
    label: 'Shower + Market Scan',
    sub: 'Done by 5:30am',
    category: 'morning',
    active_days: [1,2,3,4,5],
    color: '#6fa3e0',
  },
  {
    id: 'news_read',
    label: 'Morning News Agent',
    sub: 'Read by 6:30am',
    category: 'news',
    active_days: [1,2,3,4,5],
    color: '#f0a050',
  },
  {
    id: 'lockdown',
    label: 'Trading Lockdown',
    sub: '6:30–10am · one screen · no distractions',
    category: 'focus',
    active_days: [1,2,3,4,5],
    color: '#e05555',
    alwaysNote: true, // note prompt shown whether completed or not
  },
  {
    id: 'gym_run',
    label: 'Gym or Run',
    sub: 'Completed during chop window or afternoon',
    category: 'fitness',
    active_days: [1,2,3,4,5],
    color: '#4caf50',
  },
  {
    id: 'wilder',
    label: 'Wilder Work Done',
    sub: 'Hike (Wed) · Maya walk (Mon/Tue/Fri) · client service',
    category: 'wilder',
    active_days: [1,2,3,4,5],
    color: '#9c6fd6',
  },
  {
    id: 'pm_meditate',
    label: 'Afternoon Meditation',
    sub: '2:30pm · 15–20 min · afternoon reset',
    category: 'meditate',
    active_days: [1,2,3,4,5],
    color: '#c084fc',
  },
  {
    id: 'golf_run',
    label: 'Golf Sim or Run',
    sub: 'Per schedule · Mon/Fri golf · Tue/Thu run',
    category: 'golf',
    active_days: [1,2,3,4,5],
    color: '#7ec850',
  },
  {
    id: 'reading',
    label: 'Reading',
    sub: '4–5pm · one book · focused',
    category: 'read',
    active_days: [1,2,3,4,5],
    color: '#5bc4f5',
  },
  {
    id: 'screens_off',
    label: 'Screens Off by 7:30pm',
    sub: 'No work · no phone · wind down',
    category: 'sleep',
    active_days: [1,2,3,4,5],
    color: '#a78bfa',
  },

  // ── Weekend anchors (Sat + Sun) ────────────────────────
  {
    id: 'wknd_am_meditate',
    label: 'Morning Meditation',
    sub: '7:30am · 15–20 min · breath focus',
    category: 'meditate',
    active_days: [0,6],
    color: '#c084fc',
  },
  {
    id: 'wknd_run',
    label: 'Run Completed',
    sub: '8–9am · easy or tempo',
    category: 'run',
    active_days: [0,6],
    color: '#2dd4bf',
  },
  {
    id: 'wknd_pm_meditate',
    label: 'Afternoon Meditation',
    sub: '2:30pm · 15–20 min · reset',
    category: 'meditate',
    active_days: [0,6],
    color: '#c084fc',
  },
  {
    id: 'week_review',
    label: 'Week Review Done',
    sub: '3–4pm · reflect · set next week\'s intentions',
    category: 'admin',
    active_days: [6], // Sat only
    color: '#e0b954',
  },
];

/** Returns the habits that should appear for a given JS day number (0=Sun…6=Sat) */
export function getHabitsForDay(jsDay) {
  return HABITS.filter(h => h.active_days.includes(jsDay));
}
