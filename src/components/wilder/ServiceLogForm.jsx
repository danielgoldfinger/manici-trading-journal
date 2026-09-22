import { useState } from 'react';

const SERVICE_TYPES = ['hike','midday_walk','boarding','check_in','other'];

export default function ServiceLogForm({ log, clients, onSave, onClose }) {
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({
    client_id:    log?.client_id    ?? '',
    date:         log?.date         ?? today,
    service_type: log?.service_type ?? 'hike',
    duration_mins:log?.duration_mins ?? '',
    amount:       log?.amount       ?? '',
    invoiced:     log?.invoiced     ?? false,
    notes:        log?.notes        ?? '',
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleClientChange(clientId) {
    const client = clients.find(c => c.id === clientId);
    set('client_id', clientId);
    if (client) {
      if (client.service_type) set('service_type', client.service_type);
      if (client.rate_per_session) set('amount', client.rate_per_session);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: log?.id,
      ...form,
      client_id:     form.client_id     || null,
      duration_mins: form.duration_mins ? parseInt(form.duration_mins) : null,
      amount:        form.amount        ? parseFloat(form.amount)      : null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-md bg-[#1a1d27] border border-white/10 rounded-t-2xl sm:rounded-2xl">
        <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{log ? 'Edit Log' : 'Log Service'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Client</label>
            <select value={form.client_id} onChange={e => handleClientChange(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25">
              <option value="" className="bg-[#1a1d27]">— select client —</option>
              {clients.map(c => <option key={c.id} value={c.id} className="bg-[#1a1d27]">{c.dog_name} ({c.owner_name})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Service</label>
              <select value={form.service_type} onChange={e => set('service_type', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25">
                {SERVICE_TYPES.map(s => <option key={s} value={s} className="bg-[#1a1d27]">{s.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration (mins)</label>
              <input type="number" min="1" value={form.duration_mins} onChange={e => set('duration_mins', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="60"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount ($)</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="25.00"/>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
              placeholder="Anything notable from the session…"/>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => set('invoiced', !form.invoiced)}
              className={`w-9 h-5 rounded-full transition-colors ${form.invoiced ? 'bg-emerald-500' : 'bg-white/15'}`}>
              <span className={`block w-3.5 h-3.5 rounded-full bg-white mx-0.5 transition-transform ${form.invoiced ? 'translate-x-4' : 'translate-x-0'}`}/>
            </button>
            <span className="text-xs text-gray-400">Invoiced / collected</span>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-sm font-semibold text-emerald-400 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : log ? 'Update log' : 'Save log'}
          </button>
        </form>
      </div>
    </div>
  );
}
