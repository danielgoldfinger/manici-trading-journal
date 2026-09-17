import { useEffect, useState } from 'react';
import { usePrinciples } from '../../hooks/usePrinciples';

const REL_COLORS = {
  violated:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  applied:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  reinforced: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function PrincipleLinksPanel({ principleId, refreshKey }) {
  const { fetchLinks } = usePrinciples();
  const [links, setLinks] = useState({ trades: [], journals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLinks(principleId)
      .then(setLinks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [principleId, refreshKey]);

  const total = links.trades.length + links.journals.length;

  if (loading) return <p className="text-xs text-gray-400">Loading evidence…</p>;
  if (total === 0) return <p className="text-xs text-gray-400">No trades or journal entries linked yet.</p>;

  return (
    <div className="space-y-3">
      {links.trades.map(l => (
        <div key={l.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${REL_COLORS[l.relationship_type]}`}>
            {l.relationship_type}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Trade · {l.trades?.date} · {l.trades?.ticker ?? 'ES'} {l.trades?.setup_type}
              {l.trades?.result && <span className="ml-1 text-gray-400">({l.trades.result}{l.trades.pnl_points != null ? `, ${l.trades.pnl_points > 0 ? '+' : ''}${l.trades.pnl_points} pts` : ''})</span>}
            </p>
            {l.note && <p className="mt-0.5 text-xs text-gray-500">{l.note}</p>}
          </div>
        </div>
      ))}
      {links.journals.map(l => (
        <div key={l.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${REL_COLORS[l.relationship_type]}`}>
            {l.relationship_type}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Journal · {l.daily_journal?.journal_date}
            </p>
            {l.note && <p className="mt-0.5 text-xs text-gray-500">{l.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
