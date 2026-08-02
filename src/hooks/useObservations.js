import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { computeScore } from '../lib/score';

export function useObservations() {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchObservations = useCallback(async (filters = {}) => {
    setLoading(true);
    let query = supabase
      .from('setup_observations')
      .select('*')
      .order('obs_date', { ascending: false })
      .order('obs_time', { ascending: false });

    if (filters.passReason) query = query.eq('pass_reason', filters.passReason);
    if (filters.outcome)    query = query.eq('outcome', filters.outcome);
    if (filters.dateFrom)   query = query.gte('obs_date', filters.dateFrom);
    if (filters.dateTo)     query = query.lte('obs_date', filters.dateTo);
    if (filters.wasPrePlanned !== undefined)
      query = query.eq('was_pre_planned', filters.wasPrePlanned);

    const { data, error } = await query;
    setLoading(false);
    if (error) throw error;
    setObservations(data ?? []);
    return data ?? [];
  }, []);

  async function getObservation(id) {
    const { data, error } = await supabase
      .from('setup_observations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async function createObservation(formData, checks, setupType) {
    const { data: { user } } = await supabase.auth.getUser();
    const score = computeScore(checks, setupType);
    const flushDepth = formData.fb_level && formData.flush_low
      ? parseFloat((parseFloat(formData.fb_level) - parseFloat(formData.flush_low)).toFixed(2))
      : null;
    const flushDepthCat = flushDepth != null && flushDepth >= 20 ? 'deep' : 'shallow';
    const hadConfirmationButFroze =
      score >= 70 &&
      (formData.pass_reason === 'freeze_hesitation' ||
       formData.pass_reason === 'missed_entry_price_ran');

    const payload = {
      ...formData,
      user_id: user.id,
      setup_score: score,
      flush_depth: flushDepth,
      flush_depth_cat: flushDepthCat,
      had_confirmation_but_froze: hadConfirmationButFroze,
      ...checks,
    };

    const { data, error } = await supabase
      .from('setup_observations')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateOutcome(id, outcomeData) {
    const { error } = await supabase
      .from('setup_observations')
      .update(outcomeData)
      .eq('id', id);
    if (error) throw error;
  }

  async function deleteObservation(id) {
    const { error } = await supabase
      .from('setup_observations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async function fetchObservationStats() {
    const { data, error } = await supabase
      .from('setup_observations')
      .select('pass_reason,outcome,setup_score,outcome_pts,had_confirmation_but_froze,was_pre_planned');
    if (error) throw error;

    const total = data.length;
    const freezeEvents = data.filter(o => o.had_confirmation_but_froze);
    const freezeResolved = freezeEvents.filter(o => o.outcome === 'worked' || o.outcome === 'failed');
    const freezeWorked  = freezeEvents.filter(o => o.outcome === 'worked');
    const totalFreezePoints = freezeWorked.reduce((s, o) => s + (o.outcome_pts || 0), 0);
    const criteriaMetPasses = data.filter(o =>
      o.setup_score >= 70 &&
      (o.pass_reason === 'freeze_hesitation' || o.pass_reason === 'missed_entry_price_ran')
    );

    const byPassReason = {};
    data.forEach(o => {
      if (!byPassReason[o.pass_reason])
        byPassReason[o.pass_reason] = { total: 0, worked: 0, failed: 0, pts: [] };
      byPassReason[o.pass_reason].total++;
      if (o.outcome === 'worked') { byPassReason[o.pass_reason].worked++; byPassReason[o.pass_reason].pts.push(o.outcome_pts || 0); }
      if (o.outcome === 'failed') byPassReason[o.pass_reason].failed++;
    });

    const preplanned    = data.filter(o => o.was_pre_planned);
    const notPreplanned = data.filter(o => !o.was_pre_planned);
    const workedRate = arr => {
      const resolved = arr.filter(o => o.outcome === 'worked' || o.outcome === 'failed');
      return resolved.length ? arr.filter(o => o.outcome === 'worked').length / resolved.length : null;
    };

    return {
      total,
      freezeCount: freezeEvents.length,
      freezeRate: total > 0 ? freezeEvents.length / total : 0,
      criteriaMetPassCount: criteriaMetPasses.length,
      criteriaMetPassRate: total > 0 ? criteriaMetPasses.length / total : 0,
      freezeWorkedRate: freezeResolved.length > 0 ? freezeWorked.length / freezeResolved.length : 0,
      totalFreezePoints,
      avgFreezePoints: freezeWorked.length > 0 ? totalFreezePoints / freezeWorked.length : 0,
      byPassReason,
      preplannedCount: preplanned.length,
      preplanRate: total > 0 ? preplanned.length / total : 0,
      preplannedWorkedRate:    workedRate(preplanned),
      notPreplannedWorkedRate: workedRate(notPreplanned),
      scores: data.map(o => ({ score: o.setup_score, passReason: o.pass_reason })),
    };
  }

  return {
    observations, loading,
    fetchObservations, getObservation,
    createObservation, updateOutcome, deleteObservation,
    fetchObservationStats,
  };
}
