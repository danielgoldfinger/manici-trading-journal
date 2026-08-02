import { useEffect, useState } from 'react';
import { useObservations } from '../../hooks/useObservations';
import { PASS_REASON_LABELS } from '../../lib/observations';

function Metric({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function pct(n) { return n != null ? `${Math.round(n * 100)}%` : '—'; }

export default function ObservationAnalysis() {
  const { fetchObservationStats } = useObservations();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchObservationStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <p className="text-sm text-gray-400">Loading analysis…</p>;

  if (stats.total < 10) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
        <p className="text-sm text-gray-500">Analysis unlocks after 10 observations.</p>
        <p className="text-xs text-gray-400 mt-1">{stats.total} logged so far — keep going.</p>
      </div>
    );
  }

  const passReasonRows = Object.entries(stats.byPassReason).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total observations" value={stats.total} />
        <Metric
          label="Freeze rate (criteria met)"
          value={pct(stats.freezeRate)}
          sub={`${stats.freezeCount} of ${stats.total}`}
        />
        <Metric
          label="When frozen, setup worked"
          value={pct(stats.freezeWorkedRate)}
          sub={stats.totalFreezePoints ? `${stats.totalFreezePoints.toFixed(1)} pts left on table` : undefined}
        />
        <Metric
          label="Pre-planned hit rate"
          value={pct(stats.preplannedWorkedRate)}
          sub={`vs ${pct(stats.notPreplannedWorkedRate)} unplanned`}
        />
      </div>

      {/* By pass reason */}
      <section>
        <h3 className="mb-2 text-sm font-medium">By pass reason</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800">
                <th className="pb-2 pr-4 font-medium">Reason</th>
                <th className="pb-2 pr-4 font-medium text-right">Count</th>
                <th className="pb-2 pr-4 font-medium text-right">Worked</th>
                <th className="pb-2 font-medium text-right">Failed</th>
              </tr>
            </thead>
            <tbody>
              {passReasonRows.map(([reason, d]) => (
                <tr key={reason} className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-1.5 pr-4">{PASS_REASON_LABELS[reason] ?? reason}</td>
                  <td className="py-1.5 pr-4 text-right">{d.total}</td>
                  <td className="py-1.5 pr-4 text-right text-green-600 dark:text-green-400">{d.worked}</td>
                  <td className="py-1.5 text-right text-red-600 dark:text-red-400">{d.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Score distribution */}
      {stats.scores.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium">Score distribution</h3>
          <ScoreHistogram scores={stats.scores.map(s => s.score)} />
        </section>
      )}
    </div>
  );
}

function ScoreHistogram({ scores }) {
  const buckets = Array.from({ length: 10 }, (_, i) => ({ label: `${i * 10}–${i * 10 + 9}`, count: 0 }));
  scores.forEach(s => {
    const idx = Math.min(Math.floor((s ?? 0) / 10), 9);
    buckets[idx].count++;
  });
  const max = Math.max(...buckets.map(b => b.count), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {buckets.map(b => (
        <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-purple-400 dark:bg-purple-600 transition-all"
            style={{ height: `${(b.count / max) * 64}px` }}
            title={`${b.label}: ${b.count}`}
          />
          <span className="text-[10px] text-gray-400 rotate-0">{b.label.split('–')[0]}</span>
        </div>
      ))}
    </div>
  );
}
