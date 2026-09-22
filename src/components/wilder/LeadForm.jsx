import { useState } from 'react';

const STATUSES = [
  { value: 'contacted',  label: 'Contacted',   color: '#60a5fa' },
  { value: 'follow_up',  label: 'Follow-up',   color: '#f59e0b' },
  { value: 'converted',  label: 'Converted',   color: '#4ade80' },
  { value: 'cold',       label: 'Cold',        color: '#6b7280' },
];

export default function LeadForm({ lead, onSave, onClose }) {
  const [form, setForm] = useState({
    name:             lead?.name             ?? '',
    contact:          lead?.contact          ?? '',
    service_interest: lead?.service_interest ?? '',
    status:           lead?.status           ?? 'contacted',
    notes:            lead?.notes            ?? '',
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ id: lead?.id, ...form });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-md bg-[#1a1d27] border border-white/10 rounded-t-2xl sm:rounded-2xl">
        <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{lead ? 'Edit Lead' : 'New Lead'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
              placeholder="Dog owner name"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Contact</label>
              <input value={form.contact} onChange={e => set('contact', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="Phone / email"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Service interest</label>
              <input value={form.service_interest} onChange={e => set('service_interest', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                placeholder="Hike, midday walk…"/>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Status</label>
            <div className="grid grid-cols-4 gap-1.5">
              {STATUSES.map(s => (
                <button key={s.value} type="button" onClick={() => set('status', s.value)}
                  className="py-1.5 rounded-lg text-xs font-medium border transition-colors"
                  style={form.status === s.value
                    ? { background: s.color+'22', borderColor: s.color+'55', color: s.color }
                    : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: '#6b7280' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/25"
              placeholder="How you met them, their dog's breed, follow-up timing…"/>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-sm font-semibold text-emerald-400 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : lead ? 'Update lead' : 'Add lead'}
          </button>
        </form>
      </div>
    </div>
  );
}

export { STATUSES };
