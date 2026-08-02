import { useState } from 'react';
import ObservationForm from '../components/observations/ObservationForm';
import ObservationList from '../components/observations/ObservationList';
import ObservationAnalysis from '../components/observations/ObservationAnalysis';

const TABS = [
  { key: 'log',      label: 'Log' },
  { key: 'history',  label: 'History' },
  { key: 'analysis', label: 'Analysis' },
];

export default function Observations() {
  const [tab, setTab] = useState('log');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Setup Observations</h1>
      <p className="mb-6 text-sm text-gray-500">
        Log setups you watched but didn't trade — to track execution patterns and understand your decision-making.
      </p>

      {/* Tab bar */}
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

      {tab === 'log' && (
        <ObservationForm onSaved={() => { setRefreshKey(k => k + 1); setTab('history'); }} />
      )}
      {tab === 'history' && <ObservationList key={refreshKey} />}
      {tab === 'analysis' && <ObservationAnalysis key={refreshKey} />}
    </div>
  );
}
