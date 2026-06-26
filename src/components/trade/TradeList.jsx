import { useMemo, useState } from 'react';
import { getSizingTier } from '../../lib/sizing';
import TradeRow from './TradeRow';

const RESULT_OPTIONS = ['All', 'win', 'loss', 'be', 'open'];
const SETUP_OPTIONS = ['All', 'FB', 'LR', 'BT', 'BD'];
const SCORE_BAND_OPTIONS = ['All', 'aplus', 'valid', 'marginal', 'pass'];
const SCORE_BAND_LABELS = { aplus: 'A+', valid: 'Valid', marginal: 'Marginal', pass: 'Pass' };

export default function TradeList({ trades, onSelect }) {
  const [resultFilter, setResultFilter] = useState('All');
  const [setupFilter, setSetupFilter] = useState('All');
  const [scoreBandFilter, setScoreBandFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');

  const filtered = useMemo(() => {
    let result = trades;

    if (resultFilter !== 'All') result = result.filter((t) => t.result === resultFilter);
    if (setupFilter !== 'All') result = result.filter((t) => t.setup_type === setupFilter);
    if (scoreBandFilter !== 'All') {
      result = result.filter((t) => getSizingTier(t.setup_score ?? 0).tier === scoreBandFilter);
    }
    if (startDate) result = result.filter((t) => t.date >= startDate);
    if (endDate) result = result.filter((t) => t.date <= endDate);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) => t.thesis?.toLowerCase().includes(q) || t.post_review?.toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    if (sort === 'date_desc') sorted.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === 'date_asc') sorted.sort((a, b) => a.date.localeCompare(b.date));
    if (sort === 'score') sorted.sort((a, b) => (b.setup_score ?? 0) - (a.setup_score ?? 0));
    if (sort === 'pnl') sorted.sort((a, b) => (b.pnl_points ?? 0) - (a.pnl_points ?? 0));
    return sorted;
  }, [trades, resultFilter, setupFilter, scoreBandFilter, startDate, endDate, search, sort]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className={selectClass}>
          {RESULT_OPTIONS.map((o) => <option key={o} value={o}>{o === 'All' ? 'All results' : o}</option>)}
        </select>
        <select value={setupFilter} onChange={(e) => setSetupFilter(e.target.value)} className={selectClass}>
          {SETUP_OPTIONS.map((o) => <option key={o} value={o}>{o === 'All' ? 'All setups' : o}</option>)}
        </select>
        <select value={scoreBandFilter} onChange={(e) => setScoreBandFilter(e.target.value)} className={selectClass}>
          {SCORE_BAND_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === 'All' ? 'All score bands' : SCORE_BAND_LABELS[o]}</option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={selectClass} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={selectClass} />
        <input
          type="text"
          placeholder="Search thesis / review…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${selectClass} flex-1 min-w-[160px]`}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
          <option value="date_desc">Date ↓</option>
          <option value="date_asc">Date ↑</option>
          <option value="score">Score</option>
          <option value="pnl">P&L</option>
        </select>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-gray-800">
            <th className="py-2 px-3">Date</th>
            <th className="py-2 px-3">Time</th>
            <th className="py-2 px-3">Setup</th>
            <th className="py-2 px-3">Result</th>
            <th className="py-2 px-3">P&L</th>
            <th className="py-2 px-3">Score</th>
            <th className="py-2 px-3">Contracts</th>
            <th className="py-2 px-3">Mistake</th>
            <th className="py-2 px-3">Synced</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((trade) => (
            <TradeRow key={trade.id} trade={trade} onClick={onSelect} />
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-sm text-gray-400">
                No trades match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

const selectClass = 'rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';
