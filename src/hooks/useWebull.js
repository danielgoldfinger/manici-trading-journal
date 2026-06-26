import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getAccountSummary, getPositions, getRecentOrders } from '../lib/webull';

export function useWebull() {
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [unmatched, setUnmatched] = useState([]);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  async function fetchAccountData() {
    try {
      const [summary, pos] = await Promise.all([getAccountSummary(), getPositions()]);
      setAccount(summary);
      setPositions(pos?.positions ?? []);
    } catch (err) {
      setError(err.message);
    }
  }

  const syncTrades = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const endDate = new Date().toISOString().slice(0, 10);
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const ordersRes = await getRecentOrders(startDate, endDate);
      const orders = (ordersRes?.orders ?? []).filter((o) => o.symbol?.includes('MES'));

      const { data: unsyncedTrades } = await supabase
        .from('trades')
        .select('*')
        .eq('webull_synced', false)
        .gte('date', startDate);

      const stillUnmatched = [];

      for (const order of orders) {
        const orderDate = order.filledTime?.slice(0, 10);
        const orderSide = order.side === 'BUY' ? 'long' : 'short';
        const orderPrice = parseFloat(order.avgFilledPrice ?? order.price ?? 0);

        const match = (unsyncedTrades ?? []).find((t) => {
          if (t.date !== orderDate) return false;
          if (t.entry_price == null) return true;
          return Math.abs(parseFloat(t.entry_price) - orderPrice) <= 2;
        });

        if (match) {
          await supabase
            .from('trades')
            .update({ webull_order_id: order.orderId, webull_synced: true })
            .eq('id', match.id);
        } else {
          stillUnmatched.push(order);
        }
      }

      setUnmatched(stillUnmatched);
      setLastSynced(new Date().toISOString());
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  return { account, positions, fetchAccountData, syncTrades, syncing, unmatched, error, lastSynced };
}
