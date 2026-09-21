import { supabase } from '../lib/supabase';

export function useSchedule() {
  async function fetchLogs(startDate, endDate) {
    const { data, error } = await supabase
      .from('schedule_log')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) throw error;
    // keyed by "date|block_id"
    const map = {};
    for (const row of data ?? []) {
      map[`${row.date}|${row.block_id}`] = row;
    }
    return map;
  }

  async function toggleLog(date, blockId, currentlyCompleted, note = '') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (currentlyCompleted) {
      await supabase
        .from('schedule_log')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date)
        .eq('block_id', blockId);
    } else {
      await supabase
        .from('schedule_log')
        .upsert({ user_id: user.id, date, block_id: blockId, completed: true, note },
          { onConflict: 'user_id,date,block_id' });
    }
  }

  async function updateNote(date, blockId, note) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('schedule_log')
      .upsert({ user_id: user.id, date, block_id: blockId, completed: true, note },
        { onConflict: 'user_id,date,block_id' });
  }

  return { fetchLogs, toggleLog, updateNote };
}
