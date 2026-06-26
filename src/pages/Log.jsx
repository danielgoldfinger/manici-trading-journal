import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TradeForm from '../components/trade/TradeForm';
import Spinner from '../components/shared/Spinner';

export default function Log() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const [todayTradeId, setTodayTradeId] = useState(undefined);

  useEffect(() => {
    if (editId) {
      setTodayTradeId(editId);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from('trades')
      .select('id')
      .eq('date', today)
      .maybeSingle()
      .then(({ data }) => setTodayTradeId(data?.id ?? null));
  }, [editId]);

  if (todayTradeId === undefined) return <Spinner label="Loading…" />;

  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold">
        {todayTradeId ? "Edit today's trade" : 'Log trade'}
      </h1>
      <TradeForm tradeId={todayTradeId} key={todayTradeId ?? 'new'} />
    </div>
  );
}
