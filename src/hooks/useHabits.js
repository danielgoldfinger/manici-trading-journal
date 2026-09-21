import { supabase } from '../lib/supabase';

export function useHabits() {
  /** Fetch all logs in a date range. Returns map keyed by "date|habit_id" */
  async function fetchLogs(startDate, endDate) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) throw error;
    const map = {};
    for (const row of data ?? []) {
      map[`${row.date}|${row.habit_id}`] = row;
    }
    return map;
  }

  async function toggleHabit(date, habitId, currentlyDone) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (currentlyDone) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date)
        .eq('habit_id', habitId);
    } else {
      await supabase
        .from('habit_logs')
        .upsert({ user_id: user.id, date, habit_id: habitId, completed: true, note: '' },
          { onConflict: 'user_id,date,habit_id' });
    }
  }

  async function saveNote(date, habitId, note) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('habit_logs')
      .upsert({ user_id: user.id, date, habit_id: habitId, completed: true, note },
        { onConflict: 'user_id,date,habit_id' });
  }

  return { fetchLogs, toggleHabit, saveNote };
}
