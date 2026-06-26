import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { parseNewsletter } from '../lib/newsletter';
import { stripLoneSurrogates } from '../lib/pdf';

export function useDailyPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPlan = useCallback(async (date) => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('plan_date', date)
      .maybeSingle();
    if (fetchError) setError(fetchError.message);
    setPlan(data ?? null);
    setLoading(false);
    return data ?? null;
  }, []);

  async function parseAndSave(date, rawTextInput) {
    setLoading(true);
    setError(null);

    const rawText = stripLoneSurrogates(rawTextInput);
    const regexResult = parseNewsletter(rawText);

    let directBidLevels = [];
    let aiWarning = null;
    if (regexResult.directBidText) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-parser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            directBidText: regexResult.directBidText,
            fullPlanText: rawText,
          }),
        });
        const json = await res.json();
        directBidLevels = json.levels ?? [];
        aiWarning = json.warning ?? null;
      } catch (err) {
        aiWarning = `AI extraction failed: ${err.message}`;
      }
    }

    const fbCandidates = directBidLevels.filter((l) => l.type === 'FB' || l.type === 'conditional');

    const parseStatus = regexResult.parseWarnings.length > 0 || aiWarning ? 'review' : 'clean';
    const parseNotes = [...regexResult.parseWarnings, aiWarning].filter(Boolean).join('; ') || null;

    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      user_id: user.id,
      plan_date: date,
      raw_text: rawText,
      supports: regexResult.supports,
      resistances: regexResult.resistances,
      direct_bid_levels: directBidLevels,
      fb_candidates: fbCandidates,
      bull_case: regexResult.bullCase,
      bear_case: regexResult.bearCase,
      summary: regexResult.summary,
      current_position: regexResult.currentPosition,
      bias: regexResult.bias,
      parse_status: parseStatus,
      parse_notes: parseNotes,
    };

    const { data, error: upsertError } = await supabase
      .from('daily_plans')
      .upsert(payload, { onConflict: 'plan_date' })
      .select('*')
      .single();

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      throw upsertError;
    }

    setPlan(data);
    setLoading(false);
    return data;
  }

  return { plan, loading, error, loadPlan, parseAndSave };
}
