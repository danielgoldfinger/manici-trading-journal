import { useEffect, useState } from 'react';
import { useDailyJournal } from '../hooks/useDailyJournal';
import JournalHistoryRow from '../components/journal/JournalHistoryRow';
import PreSessionForm from '../components/journal/PreSessionForm';
import PostSessionForm from '../components/journal/PostSessionForm';
import StreamOfConsciousness from '../components/journal/StreamOfConsciousness';
import { adherenceScore } from '../components/journal/AdherenceChecklist';

const inputClass = 'rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';

export default function JournalHistory() {
  const { fetchHistory } = useDailyJournal();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', minExecution: '', riskPosture: '' });

  async function load() {
    setLoading(true);
    try {
      const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      setEntries(await fetchHistory(active));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  function updateFilter(k, v) { setFilters(p => ({ ...p, [k]: v })); }

  if (selected) {
    return (
      <div className="space-y-10">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200">
          ← Back to history
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Pre-session (read-only view) */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Pre-session</h2>
            <PreSessionForm journalDate={selected.journal_date} entry={selected} onSaved={() => {}} />
          </section>
          {/* Post-session (read-only view) */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Post-session</h2>
            <PostSessionForm journalDate={selected.journal_date} entry={selected} onSaved={() => {}} />
          </section>
        </div>

        {selected.stream_of_consciousness && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Stream of consciousness</h2>
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
              {selected.stream_of_consciousness}
            </p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input type="date" value={filters.dateFrom} onChange={e => updateFilter('dateFrom', e.target.value)} className={inputClass} />
        <input type="date" value={filters.dateTo} onChange={e => updateFilter('dateTo', e.target.value)} className={inputClass} />
        <select value={filters.minExecution} onChange={e => updateFilter('minExecution', e.target.value)} className={inputClass}>
          <option value="">Any execution quality</option>
          {[7, 8, 9].map(n => <option key={n} value={n}>≥ {n}/10</option>)}
        </select>
        <select value={filters.riskPosture} onChange={e => updateFilter('riskPosture', e.target.value)} className={inputClass}>
          <option value="">Any risk posture</option>
          <option value="normal">Normal</option>
          <option value="profit_protection">Profit protection</option>
          <option value="recovering_loss">Recovering loss</option>
          <option value="cautious">Cautious</option>
          <option value="sit_out">Sitting out</option>
        </select>
        {Object.values(filters).some(Boolean) && (
          <button onClick={() => setFilters({ dateFrom: '', dateTo: '', minExecution: '', riskPosture: '' })} className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-500 dark:border-gray-700">
            Clear
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && entries.length === 0 && <p className="text-sm text-gray-400">No entries found.</p>}
      <div className="space-y-2">
        {entries.map(e => (
          <JournalHistoryRow key={e.id} entry={e} onClick={setSelected} />
        ))}
      </div>
    </div>
  );
}
