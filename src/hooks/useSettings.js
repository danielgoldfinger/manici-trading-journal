import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let { data, error: fetchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    if (!data) {
      const { data: created, error: insertError } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id })
        .select('*')
        .single();
      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
      data = created;
    }

    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateSettings(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error: updateError } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select('*')
      .single();
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSettings(data);
  }

  return { settings, loading, error, updateSettings, reload: load };
}
