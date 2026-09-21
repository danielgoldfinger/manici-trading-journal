import { supabase } from '../lib/supabase';

export function useReading() {
  async function fetchBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async function saveBook(fields) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (fields.id) {
      const { id, ...rest } = fields;
      await supabase.from('books').update(rest).eq('id', id);
    } else {
      await supabase.from('books').insert({ ...fields, user_id: user.id });
    }
  }

  async function deleteBook(id) {
    await supabase.from('books').delete().eq('id', id);
  }

  return { fetchBooks, saveBook, deleteBook };
}
