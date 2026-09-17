import { supabase } from '../lib/supabase';

export function usePrinciples() {

  async function fetchPrinciples() {
    const { data, error } = await supabase
      .from('principles')
      .select('*')
      .order('pinned', { ascending: false })
      .order('display_number', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async function createPrinciple(fields) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('principles')
      .insert({ user_id: user.id, ...fields })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updatePrinciple(id, fields) {
    const { data, error } = await supabase
      .from('principles')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deletePrinciple(id) {
    const { error } = await supabase.from('principles').delete().eq('id', id);
    if (error) throw error;
  }

  async function fetchLinks(principleId) {
    const [{ data: trades }, { data: journals }] = await Promise.all([
      supabase
        .from('trade_principles')
        .select('*, trades(date, setup_type, result, pnl_points, ticker)')
        .eq('principle_id', principleId)
        .order('created_at', { ascending: false }),
      supabase
        .from('journal_principles')
        .select('*, daily_journal(journal_date, post_session_summary)')
        .eq('principle_id', principleId)
        .order('created_at', { ascending: false }),
    ]);
    return { trades: trades ?? [], journals: journals ?? [] };
  }

  async function linkTrade(tradeId, principleId, relationshipType, note) {
    const { data, error } = await supabase
      .from('trade_principles')
      .upsert({ trade_id: tradeId, principle_id: principleId, relationship_type: relationshipType, note: note || null },
               { onConflict: 'trade_id,principle_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function unlinkTrade(tradeId, principleId) {
    const { error } = await supabase
      .from('trade_principles')
      .delete()
      .eq('trade_id', tradeId)
      .eq('principle_id', principleId);
    if (error) throw error;
  }

  async function linkJournal(journalId, principleId, relationshipType, note) {
    const { data, error } = await supabase
      .from('journal_principles')
      .upsert({ journal_id: journalId, principle_id: principleId, relationship_type: relationshipType, note: note || null },
               { onConflict: 'journal_id,principle_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function unlinkJournal(journalId, principleId) {
    const { error } = await supabase
      .from('journal_principles')
      .delete()
      .eq('journal_id', journalId)
      .eq('principle_id', principleId);
    if (error) throw error;
  }

  async function fetchLinksForTrade(tradeId) {
    const { data, error } = await supabase
      .from('trade_principles')
      .select('*, principles(id, title, category, display_number)')
      .eq('trade_id', tradeId);
    if (error) throw error;
    return data ?? [];
  }

  async function fetchLinksForJournal(journalId) {
    const { data, error } = await supabase
      .from('journal_principles')
      .select('*, principles(id, title, category, display_number)')
      .eq('journal_id', journalId);
    if (error) throw error;
    return data ?? [];
  }

  return {
    fetchPrinciples, createPrinciple, updatePrinciple, deletePrinciple,
    fetchLinks, linkTrade, unlinkTrade, linkJournal, unlinkJournal,
    fetchLinksForTrade, fetchLinksForJournal,
  };
}
