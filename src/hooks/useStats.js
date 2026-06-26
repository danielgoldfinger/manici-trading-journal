import { useMemo } from 'react';
import { getSizingTier } from '../lib/sizing';

const SCORE_BANDS = [
  { tier: 'pass', label: '0-59%', min: 0, max: 59 },
  { tier: 'marginal', label: '60-69%', min: 60, max: 69 },
  { tier: 'valid', label: '70-84%', min: 70, max: 84 },
  { tier: 'aplus', label: '85-100%', min: 85, max: 100 },
];

const WIN_BANDS = [
  { label: '85-100%', min: 85, max: 100 },
  { label: '70-84%', min: 70, max: 84 },
  { label: '0-69%', min: 0, max: 69 },
];

export function useStats(trades) {
  return useMemo(() => {
    const closed = trades.filter((t) => t.result !== 'open');
    const wins = closed.filter((t) => t.result === 'win');
    const losses = closed.filter((t) => t.result === 'loss');

    const totalTrades = trades.length;
    const winRate = wins.length + losses.length > 0 ? wins.length / (wins.length + losses.length) : 0;
    const totalPnlPoints = closed.reduce((sum, t) => sum + (t.pnl_points ?? 0), 0);
    const avgPnlPoints = closed.length > 0 ? totalPnlPoints / closed.length : 0;
    const avgScore = trades.length > 0
      ? trades.reduce((sum, t) => sum + (t.setup_score ?? 0), 0) / trades.length
      : 0;
    const disciplineRate = totalTrades > 0
      ? trades.filter((t) => !t.mistake_flag).length / totalTrades
      : 0;

    const winRateByBand = WIN_BANDS.map((band) => {
      const inBand = closed.filter((t) => (t.setup_score ?? 0) >= band.min && (t.setup_score ?? 0) <= band.max);
      const bandWins = inBand.filter((t) => t.result === 'win');
      const bandLosses = inBand.filter((t) => t.result === 'loss');
      const rate = bandWins.length + bandLosses.length > 0 ? bandWins.length / (bandWins.length + bandLosses.length) : 0;
      return { label: band.label, winRate: Math.round(rate * 100), count: inBand.length };
    });

    const avgPnlByBand = WIN_BANDS.map((band) => {
      const inBand = closed.filter((t) => (t.setup_score ?? 0) >= band.min && (t.setup_score ?? 0) <= band.max);
      const avg = inBand.length > 0 ? inBand.reduce((sum, t) => sum + (t.pnl_points ?? 0), 0) / inBand.length : 0;
      return { label: band.label, avgPnl: Math.round(avg * 100) / 100, count: inBand.length };
    });

    const scoreHistogram = Array.from({ length: 10 }, (_, i) => {
      const min = i * 10;
      const max = min + 10;
      const count = trades.filter((t) => (t.setup_score ?? 0) >= min && (t.setup_score ?? 0) < max).length;
      return { label: `${min}-${max}`, count };
    });

    const mistakeFrequency = {};
    trades.forEach((t) => {
      if (t.mistake_flag) mistakeFrequency[t.mistake_flag] = (mistakeFrequency[t.mistake_flag] ?? 0) + 1;
    });
    const mistakeChart = Object.entries(mistakeFrequency)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    const dailyPnl = {};
    closed.forEach((t) => {
      dailyPnl[t.date] = (dailyPnl[t.date] ?? 0) + (t.pnl_points ?? 0);
    });

    const equityCurve = [...closed]
      .sort((a, b) => a.date.localeCompare(b.date))
      .reduce((acc, t) => {
        const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
        const pnlUsd = (t.pnl_points ?? 0) * 5 * (t.actual_contracts ?? 1);
        acc.push({ date: t.date, balance: prevBalance + pnlUsd });
        return acc;
      }, []);

    return {
      totalTrades,
      winRate,
      totalPnlPoints,
      avgPnlPoints,
      avgScore,
      disciplineRate,
      winRateByBand,
      avgPnlByBand,
      scoreHistogram,
      mistakeChart,
      dailyPnl,
      equityCurve,
    };
  }, [trades]);
}

export { SCORE_BANDS, getSizingTier };
