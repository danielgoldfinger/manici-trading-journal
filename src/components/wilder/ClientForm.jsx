import { useState } from 'react';

const SERVICE_TYPES = [
  { value: 'hike',         label: 'Hike' },
  { value: 'midday_walk',  label: 'Midday Walk' },
  { value: 'boarding',     label: 'Boarding' },
  { value: 'other',        label: 'Other' },
];

export default function ClientForm({ client, onSave, onClose }) {
  const [form, setForm] = useState({
    dog_name:        client?.dog_name        ?? '',
    owner_name:      client?.owner_name      ?? '',
    phone:           client?.phone           ?? '',
    email:           client?.email           ?? '',
    service_type:    client?.service_type    ?? 'hike',
    schedule:        client?.schedule        ?? '',
    rate_per_session:client?.rate_per_session ?? '',
    active:          client?.active          ?? true,
    notes:           client?.notes           ?? '',
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: client?.id,
      ...form,
      rate_per_session: form.rate_per_session ? parseFloat(form.rate_per_session) : null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-md bg-[#1a1d27] border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1d27] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{client ? 'Edit Client' : 'New Client'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dog name</label>
              <input value={form.dog_name} onChange={e => set('dog_name', e.target.value)} required
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="Buddy"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Owner name</label>
              <input value={form.owner_name} onChange={e => set('owner_name', e.target.value)} required
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="Jane Smith"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="(555) 555-5555"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="jane@example.com"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Service</label>
              <select value={form.service_type} onChange={e => set('service_type', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25">
                {SERVICE_TYPES.map(s => <option key={s.value} value={s.value} className="bg-[#1a1d27]">{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Rate / session ($)</label>
              <input type="number" min="0" step="0.01" value={form.rate_per_session} onChange={e => set('rate_per_session', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="25.00"/>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Schedule <span className="text-gray-600">(e.g. "Mon/Tue/Fri midday")</span></label>
            <input value={form.schedule} onChange={e => set('schedule', e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
              placeholder="Wed hike"/>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/25"
              placeholder="Allergies, quirks, gate code…"/>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => set('active', !form.active)}
              className={`w-9 h-5 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-white/15'}`}>
              <span className={`block w-3.5 h-3.5 rounded-full bg-white mx-0.5 transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0'}`}/>
            </button>
            <span className="text-xs text-gray-400">Active client</span>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-sm font-semibold text-emerald-400 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : client ? 'Update client' : 'Add client'}
          </button>
        </form>
      </div>
    </div>
  );
}
