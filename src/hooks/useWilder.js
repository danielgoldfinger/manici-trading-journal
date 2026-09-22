import { supabase } from '../lib/supabase';

export function useWilder() {
  async function fetchClients() {
    const { data, error } = await supabase
      .from('wilder_clients').select('*').order('dog_name');
    if (error) throw error;
    return data ?? [];
  }

  async function saveClient(fields) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, ...rest } = fields;
    if (id) { await supabase.from('wilder_clients').update(rest).eq('id', id); }
    else     { await supabase.from('wilder_clients').insert({ ...rest, user_id: user.id }); }
  }

  async function deleteClient(id) {
    await supabase.from('wilder_clients').delete().eq('id', id);
  }

  async function fetchServiceLogs(limit = 60) {
    const { data, error } = await supabase
      .from('wilder_service_logs')
      .select('*, wilder_clients(dog_name, owner_name)')
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async function saveServiceLog(fields) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, ...rest } = fields;
    if (id) { await supabase.from('wilder_service_logs').update(rest).eq('id', id); }
    else     { await supabase.from('wilder_service_logs').insert({ ...rest, user_id: user.id }); }
  }

  async function toggleInvoiced(id, current) {
    await supabase.from('wilder_service_logs').update({ invoiced: !current }).eq('id', id);
  }

  async function deleteServiceLog(id) {
    await supabase.from('wilder_service_logs').delete().eq('id', id);
  }

  async function fetchLeads() {
    const { data, error } = await supabase
      .from('wilder_leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async function saveLead(fields) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { id, ...rest } = fields;
    if (id) { await supabase.from('wilder_leads').update(rest).eq('id', id); }
    else     { await supabase.from('wilder_leads').insert({ ...rest, user_id: user.id }); }
  }

  async function deleteLead(id) {
    await supabase.from('wilder_leads').delete().eq('id', id);
  }

  return {
    fetchClients, saveClient, deleteClient,
    fetchServiceLogs, saveServiceLog, toggleInvoiced, deleteServiceLog,
    fetchLeads, saveLead, deleteLead,
  };
}
