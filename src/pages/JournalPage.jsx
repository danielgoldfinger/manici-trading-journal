import { useState } from 'react';
import DailyJournal from './DailyJournal';
import JournalHistory from './JournalHistory';
import Journal from './Journal';

const TABS = [
  { key: 'daily',    label: 'Daily journal' },
  { key: 'history',  label: 'Journal history' },
  { key: 'tradelog', label: 'Trade log' },
];

export default function JournalPage() {
  const [tab, setTab] = useState('daily');

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'daily'    && <DailyJournal />}
      {tab === 'history'  && <JournalHistory />}
      {tab === 'tradelog' && <Journal />}
    </div>
  );
}
