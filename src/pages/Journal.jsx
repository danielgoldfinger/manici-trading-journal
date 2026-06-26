import { useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import TradeList from '../components/trade/TradeList';
import TradeDetail from '../components/trade/TradeDetail';
import Spinner from '../components/shared/Spinner';

export default function Journal() {
  const { trades, loading, error } = useTrades();
  const [selectedId, setSelectedId] = useState(null);

  if (loading) return <Spinner label="Loading trades…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Journal</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {selectedId ? (
        <TradeDetail tradeId={selectedId} onClose={() => setSelectedId(null)} />
      ) : trades.length === 0 ? (
        <p className="text-sm text-gray-400">No trades logged yet.</p>
      ) : (
        <TradeList trades={trades} onSelect={setSelectedId} />
      )}
    </div>
  );
}
