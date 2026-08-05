import { supabase } from '../lib/supabase';

export function useDailyJournal() {

  async function getTodaysEntry() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_journal')
      .select('*')
      .eq('journal_date', today)
      .single();
    if (error?.code === 'PGRST116') return { journal_date: today };
    if (error) throw error;
    return data;
  }

  async function getEntry(date) {
    const { data, error } = await supabase
      .from('daily_journal')
      .select('*')
      .eq('journal_date', date)
      .single();
    if (error?.code === 'PGRST116') return { journal_date: date };
    if (error) throw error;
    return data;
  }

  async function upsertEntry(journalDate, fields) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('daily_journal')
      .upsert(
        { user_id: user.id, journal_date: journalDate, ...fields },
        { onConflict: 'user_id,journal_date' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function completePreSession(journalDate, fields, existingTime) {
    return upsertEntry(journalDate, {
      ...fields,
      pre_session_completed: true,
      // Only set timestamp once — don't overwrite if already exists
      ...(existingTime ? {} : { pre_session_time: new Date().toISOString() }),
    });
  }

  async function completePostSession(journalDate, fields) {
    return upsertEntry(journalDate, {
      ...fields,
      post_session_completed: true,
      post_session_time: new Date().toISOString(),
    });
  }

  async function updateStream(journalDate, text) {
    return upsertEntry(journalDate, { stream_of_consciousness: text });
  }

  async function addEmotionalEvent(journalDate, event, existingEvents = []) {
    const events = [...existingEvents, {
      ...event,
      id: Date.now(),
      logged_at: new Date().toISOString(),
    }];
    return upsertEntry(journalDate, { emotional_events: events });
  }

  async function removeEmotionalEvent(journalDate, eventId, existingEvents = []) {
    const events = existingEvents.filter(e => e.id !== eventId);
    return upsertEntry(journalDate, { emotional_events: events });
  }

  async function updateEmotionalEvent(journalDate, eventId, updates, existingEvents = []) {
    const events = existingEvents.map(e => e.id === eventId ? { ...e, ...updates } : e);
    return upsertEntry(journalDate, { emotional_events: events });
  }

  async function fetchHistory(filters = {}) {
    let query = supabase
      .from('daily_journal')
      .select('*')
      .order('journal_date', { ascending: false });
    if (filters.dateFrom) query = query.gte('journal_date', filters.dateFrom);
    if (filters.dateTo)   query = query.lte('journal_date', filters.dateTo);
    if (filters.minExecution)
      query = query.gte('post_execution_quality', filters.minExecution);
    if (filters.riskPosture)
      query = query.eq('pre_risk_posture', filters.riskPosture);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async function fetchJournalStats() {
    const { data, error } = await supabase
      .from('daily_journal')
      .select([
        'journal_date',
        'pre_mental_state','pre_focus_level','pre_fomo_intensity',
        'pre_loss_aversion','pre_patience_level','pre_risk_posture',
        'post_execution_quality','post_mental_state',
        'adhered_to_levels','adhered_to_window','adhered_to_one_trade',
        'adhered_to_stop','adhered_to_t1','adhered_to_runner',
        'avoided_impulse_trades','followed_preplan',
        'emotional_events',
        'pre_session_completed','post_session_completed',
      ].join(','));
    if (error) throw error;

    const adherenceKeys = [
      'adhered_to_levels','adhered_to_window','adhered_to_one_trade',
      'adhered_to_stop','adhered_to_t1','adhered_to_runner',
      'avoided_impulse_trades','followed_preplan',
    ];

    const completed = (data ?? []).filter(d => d.post_session_completed);

    return {
      totalEntries: (data ?? []).length,
      completedEntries: completed.length,
      completionRate: (data ?? []).length > 0 ? completed.length / (data ?? []).length : 0,
      avgExecutionQuality: avg(completed.map(d => d.post_execution_quality)),
      avgMentalState: avg((data ?? []).map(d => d.pre_mental_state).filter(Boolean)),
      adherenceByField: adherenceKeys.reduce((acc, key) => {
        const vals = completed.filter(d => d[key] !== null && d[key] !== undefined);
        acc[key] = vals.length > 0 ? vals.filter(d => d[key]).length / vals.length : null;
        return acc;
      }, {}),
      overallAdherenceRate: avg(
        completed.map(d => {
          const filled = adherenceKeys.filter(k => d[k] !== null && d[k] !== undefined);
          if (!filled.length) return null;
          return filled.filter(k => d[k]).length / filled.length;
        }).filter(v => v !== null)
      ),
      scatterData: completed
        .filter(d => d.pre_mental_state && d.post_execution_quality)
        .map(d => ({
          date: d.journal_date,
          mentalState: d.pre_mental_state,
          executionQuality: d.post_execution_quality,
        })),
      executionTimeline: completed
        .filter(d => d.post_execution_quality)
        .sort((a, b) => a.journal_date.localeCompare(b.journal_date))
        .map(d => ({ date: d.journal_date, score: d.post_execution_quality })),
      emotionalEvents: completed
        .flatMap(d => (d.emotional_events || []).map(e => ({ ...e, date: d.journal_date }))),
      riskPostureDist: (data ?? []).reduce((acc, d) => {
        if (d.pre_risk_posture) acc[d.pre_risk_posture] = (acc[d.pre_risk_posture] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  function avg(arr) {
    const filtered = arr.filter(v => v != null);
    return filtered.length > 0 ? filtered.reduce((a, b) => a + b, 0) / filtered.length : null;
  }

  return {
    getTodaysEntry, getEntry, upsertEntry,
    completePreSession, completePostSession,
    updateStream, addEmotionalEvent, removeEmotionalEvent, updateEmotionalEvent,
    fetchHistory, fetchJournalStats,
  };
}
