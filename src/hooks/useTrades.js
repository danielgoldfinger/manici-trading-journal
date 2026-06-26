import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setTrades(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  async function createTrade(trade) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase
      .from('trades')
      .insert({ ...trade, user_id: user.id })
      .select('*')
      .single();
    if (insertError) throw insertError;
    setTrades((prev) => [data, ...prev]);
    return data;
  }

  async function updateTrade(id, updates) {
    const { data, error: updateError } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (updateError) throw updateError;
    setTrades((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }

  async function deleteTrade(id) {
    const { error: deleteError } = await supabase.from('trades').delete().eq('id', id);
    if (deleteError) throw deleteError;
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }

  async function getTrade(id) {
    const { data, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    return data;
  }

  return { trades, loading, error, fetchTrades, createTrade, updateTrade, deleteTrade, getTrade };
}
