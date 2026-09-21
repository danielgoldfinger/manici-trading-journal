import { supabase } from '../lib/supabase';

export function useFitness() {
  async function fetchWorkouts(limit = 30) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, workout_exercises(*)')
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async function fetchRuns(limit = 30) {
    const { data, error } = await supabase
      .from('run_sessions')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async function saveWorkout({ id, date, type, duration_mins, energy_level, notes, exercises }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let sessionId = id;
    if (id) {
      await supabase.from('workout_sessions').update({ date, type, duration_mins, energy_level, notes }).eq('id', id);
    } else {
      const { data } = await supabase
        .from('workout_sessions')
        .insert({ user_id: user.id, date, type, duration_mins, energy_level, notes })
        .select().single();
      sessionId = data.id;
    }

    // Replace exercises
    await supabase.from('workout_exercises').delete().eq('session_id', sessionId);
    if (exercises?.length) {
      await supabase.from('workout_exercises').insert(
        exercises.map((ex, i) => ({
          session_id: sessionId,
          user_id: user.id,
          name: ex.name,
          sets: ex.sets || null,
          reps: ex.reps || null,
          weight_lbs: ex.weight_lbs || null,
          display_order: i,
        }))
      );
    }
    return sessionId;
  }

  async function deleteWorkout(id) {
    await supabase.from('workout_sessions').delete().eq('id', id);
  }

  async function saveRun({ id, date, distance_miles, duration_mins, run_type, route, felt_score, notes }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = { date, distance_miles, duration_mins, run_type, route, felt_score, notes };
    if (id) {
      await supabase.from('run_sessions').update(payload).eq('id', id);
    } else {
      await supabase.from('run_sessions').insert({ ...payload, user_id: user.id });
    }
  }

  async function deleteRun(id) {
    await supabase.from('run_sessions').delete().eq('id', id);
  }

  return { fetchWorkouts, fetchRuns, saveWorkout, deleteWorkout, saveRun, deleteRun };
}
