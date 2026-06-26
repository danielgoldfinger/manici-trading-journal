import { useTrades } from '../hooks/useTrades';
import { useSettings } from '../hooks/useSettings';
import { useStats } from '../hooks/useStats';
import { projectEquityCurve } from '../lib/projection';
import MetricCard from '../components/stats/MetricCard';
import EquityCurve from '../components/stats/EquityCurve';
import WinRateByScore from '../components/stats/WinRateByScore';
import AvgPnlByScore from '../components/stats/AvgPnlByScore';
import ScoreHistogram from '../components/stats/ScoreHistogram';
import PnlCalendar from '../components/stats/PnlCalendar';
import MistakeChart from '../components/stats/MistakeChart';
import ProjectionTable from '../components/stats/ProjectionTable';
import Spinner from '../components/shared/Spinner';

export default function Stats() {
  const { trades, loading } = useTrades();
  const { settings } = useSettings();
  const stats = useStats(trades);

  if (loading) return <Spinner label="Crunching stats…" />;

  const accountBalance = settings?.account_balance ?? 11600;
  const projectedCurve = projectEquityCurve(accountBalance, 24);
  const monthlyProjection = projectedCurve.map((m, i) => ({
    ...m,
    date: stats.equityCurve[i]?.date ?? `M${m.month}`,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Stats</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Total trades" value={stats.totalTrades} />
        <MetricCard label="Win rate" value={`${Math.round(stats.winRate * 100)}%`} />
        <MetricCard label="Total P&L" value={`${stats.totalPnlPoints.toFixed(2)} pts`} />
        <MetricCard label="Avg P&L / trade" value={`${stats.avgPnlPoints.toFixed(2)} pts`} />
        <MetricCard label="Avg setup score" value={`${Math.round(stats.avgScore)}%`} />
        <MetricCard label="Discipline rate" value={`${Math.round(stats.disciplineRate * 100)}%`} />
      </div>

      <EquityCurve actual={stats.equityCurve} projected={monthlyProjection} />

      <div className="grid gap-4 md:grid-cols-2">
        <WinRateByScore data={stats.winRateByBand} />
        <AvgPnlByScore data={stats.avgPnlByBand} />
      </div>

      <ScoreHistogram data={stats.scoreHistogram} />
      <PnlCalendar dailyPnl={stats.dailyPnl} />
      <MistakeChart data={stats.mistakeChart} />
      <ProjectionTable curve={projectedCurve} />
    </div>
  );
}
