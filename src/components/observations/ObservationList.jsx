import { useEffect, useState } from 'react';
import { useObservations } from '../../hooks/useObservations';
import { PASS_REASON_LABELS, OUTCOME_LABELS } from '../../lib/observations';
import ObservationRow from './ObservationRow';
import ObservationDetail from './ObservationDetail';

const inputClass = 'rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';

export default function ObservationList() {
  const { observations, loading, fetchObservations } = useObservations();
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ passReason: '', outcome: '', dateFrom: '', dateTo: '' });

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    const active = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    );
    fetchObservations(active);
  }, [filters]);

  if (selected) {
    return (
      <ObservationDetail
        obs={selected}
        onClose={() => setSelected(null)}
        onUpdated={() => { setSelected(null); fetchObservations(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={filters.passReason} onChange={e => updateFilter('passReason', e.target.value)} className={inputClass}>
          <option value="">All pass reasons</option>
          {Object.entries(PASS_REASON_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filters.outcome} onChange={e => updateFilter('outcome', e.target.value)} className={inputClass}>
          <option value="">All outcomes</option>
          {Object.entries(OUTCOME_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="date" value={filters.dateFrom} onChange={e => updateFilter('dateFrom', e.target.value)} className={inputClass} placeholder="From" />
        <input type="date" value={filters.dateTo} onChange={e => updateFilter('dateTo', e.target.value)} className={inputClass} placeholder="To" />
        {Object.values(filters).some(Boolean) && (
          <button
            onClick={() => setFilters({ passReason: '', outcome: '', dateFrom: '', dateTo: '' })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-800 dark:border-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && observations.length === 0 && (
        <p className="text-sm text-gray-400">No observations match the current filters.</p>
      )}
      <div className="space-y-2">
        {observations.map(obs => (
          <ObservationRow key={obs.id} obs={obs} onClick={setSelected} />
        ))}
      </div>
    </div>
  );
}
