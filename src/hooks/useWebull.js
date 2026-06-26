import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getAccountList, getAccountBalance, getAccountPositions, getOrderHistory } from '../lib/webull';

function selectFuturesAccountId(accounts) {
  const list = accounts?.data ?? accounts ?? [];
  const futuresAccount = list.find((a) => a.account_class === 'FUTURES');
  return futuresAccount?.account_id ?? list[0]?.account_id;
}

export function useWebull() {
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [unmatched, setUnmatched] = useState([]);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  async function fetchAccountData() {
    try {
      const accounts = await getAccountList();
      const accountId = selectFuturesAccountId(accounts);
      if (!accountId) throw new Error('No Webull futures account found for these credentials');

      const [balance, positionsRes] = await Promise.all([
        getAccountBalance(accountId),
        getAccountPositions(accountId),
      ]);
      setAccount({ accountId, ...balance });
      setPositions(positionsRes?.positions ?? positionsRes?.data ?? []);
    } catch (err) {
      setError(err.message);
    }
  }

  const syncTrades = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const accounts = await getAccountList();
      const accountId = selectFuturesAccountId(accounts);
      if (!accountId) throw new Error('No Webull futures account found for these credentials');

      const endDate = new Date().toISOString().slice(0, 10);
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const historyRes = await getOrderHistory(accountId, { startDate, endDate });
      const orders = (historyRes?.orders ?? historyRes?.data ?? []).filter((o) =>
        o.symbol?.includes('MES')
      );

      const { data: unsyncedTrades } = await supabase
        .from('trades')
        .select('*')
        .eq('webull_synced', false)
        .gte('date', startDate);

      const stillUnmatched = [];

      for (const order of orders) {
        const orderDate = order.filledTime?.slice(0, 10) ?? order.create_time?.slice(0, 10);
        const orderPrice = parseFloat(order.avgFilledPrice ?? order.price ?? 0);

        const match = (unsyncedTrades ?? []).find((t) => {
          if (t.date !== orderDate) return false;
          if (t.entry_price == null) return true;
          return Math.abs(parseFloat(t.entry_price) - orderPrice) <= 2;
        });

        if (match) {
          await supabase
            .from('trades')
            .update({ webull_order_id: order.order_id ?? order.client_order_id, webull_synced: true })
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
