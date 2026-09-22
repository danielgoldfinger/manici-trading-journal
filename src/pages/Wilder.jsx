import { useState, useEffect, useCallback } from 'react';
import { useWilder } from '../hooks/useWilder';
import ClientForm from '../components/wilder/ClientForm';
import ServiceLogForm from '../components/wilder/ServiceLogForm';
import LeadForm, { STATUSES } from '../components/wilder/LeadForm';
import { FOMC_WEDNESDAYS } from '../data/scheduleTemplate';

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return [mon.toISOString().slice(0,10), sun.toISOString().slice(0,10)];
}

function fmt$(n) {
  if (!n) return '—';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function ServiceTypeBadge({ type }) {
  const map = {
    hike:        { label: 'Hike',        color: '#4ade80' },
    midday_walk: { label: 'Midday Walk', color: '#60a5fa' },
    boarding:    { label: 'Boarding',    color: '#f59e0b' },
    check_in:    { label: 'Check-in',   color: '#a78bfa' },
    other:       { label: 'Other',      color: '#6b7280' },
  };
  const { label, color } = map[type] ?? { label: type, color: '#6b7280' };
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
      style={{ color, borderColor: color+'44', background: color+'18' }}>
      {label}
    </span>
  );
}

export default function Wilder() {
  const [tab, setTab]           = useState('clients');
  const [clients, setClients]   = useState([]);
  const [logs, setLogs]         = useState([]);
  const [leads, setLeads]       = useState([]);
  const [modal, setModal]       = useState(null);
  const [active, setActive]     = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const {
    fetchClients, saveClient, deleteClient,
    fetchServiceLogs, saveServiceLog, toggleInvoiced, deleteServiceLog,
    fetchLeads, saveLead, deleteLead,
  } = useWilder();

  const load = useCallback(async () => {
    try {
      const [c, l, ld] = await Promise.all([fetchClients(), fetchServiceLogs(), fetchLeads()]);
      setClients(c);
      setLogs(l);
      setLeads(ld);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // FOMC banner: check if this week's Wednesday is an FOMC day
  const today     = new Date();
  const wedOffset = (3 - today.getDay() + 7) % 7; // days until this week's Wed
  const thisWed   = new Date(today);
  thisWed.setDate(today.getDate() - today.getDay() + 3); // this week's Wednesday
  const thisWedStr = thisWed.toISOString().slice(0,10);
  const isFOMCWeek = FOMC_WEDNESDAYS.has(thisWedStr);

  // Weekly revenue
  const [weekStart, weekEnd] = getWeekBounds();
  const weekLogs = logs.filter(l => l.date >= weekStart && l.date <= weekEnd);
  const weekTotal      = weekLogs.reduce((s, l) => s + (l.amount ?? 0), 0);
  const weekCollected  = weekLogs.filter(l => l.invoiced).reduce((s, l) => s + (l.amount ?? 0), 0);
  const weekOutstanding= weekTotal - weekCollected;

  // Hike checklist: active clients with service_type = 'hike'
  const hikeClients = clients.filter(c => c.active && c.service_type === 'hike');

  const activeClients   = clients.filter(c => c.active);
  const inactiveClients = clients.filter(c => !c.active);

  async function handleSaveClient(fields) { await saveClient(fields); await load(); }
  async function handleDeleteClient(c) {
    if (!confirm(`Remove ${c.dog_name} from your roster?`)) return;
    await deleteClient(c.id); await load();
  }

  async function handleSaveLog(fields) { await saveServiceLog(fields); await load(); }
  async function handleDeleteLog(l) {
    if (!confirm('Delete this log entry?')) return;
    await deleteServiceLog(l.id); await load();
  }

  async function handleToggleInvoiced(l) { await toggleInvoiced(l.id, l.invoiced); await load(); }

  async function handleSaveLead(fields) { await saveLead(fields); await load(); }
  async function handleDeleteLead(l) {
    if (!confirm(`Remove ${l.name} from leads?`)) return;
    await deleteLead(l.id); await load();
  }

  const TABS = ['clients','log','leads'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Wilder</h1>
          <p className="text-xs text-gray-500">Dog walking & hike business</p>
        </div>
        <button
          onClick={() => {
            setActive(null);
            if (tab === 'clients') setModal('client');
            else if (tab === 'log')  setModal('log');
            else setModal('lead');
          }}
          className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-sm font-medium text-emerald-400 transition-colors">
          + Add
        </button>
      </div>

      {/* FOMC banner */}
      {isFOMCWeek && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-400">FOMC Wednesday — {thisWedStr}</p>
            <p className="text-xs text-amber-400/70">Fed meeting today. Consider shifting the hike to Tuesday to keep your market hours clear.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'log' ? 'Service Log' : t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'leads' && leads.filter(l => l.status === 'follow_up').length > 0 && (
              <span className="ml-1 px-1 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
                {leads.filter(l => l.status === 'follow_up').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CLIENTS TAB ── */}
      {tab === 'clients' && (
        <div className="space-y-4">
          {/* Hike prep checklist */}
          {hikeClients.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs text-emerald-400/70 uppercase tracking-wider font-semibold mb-3">
                Wednesday Hike • {hikeClients.length} dog{hikeClients.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {hikeClients.map(c => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full border border-emerald-500/40 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white">{c.dog_name}</span>
                      <span className="text-xs text-gray-500 ml-2">{c.owner_name}</span>
                    </div>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="text-xs text-gray-600 hover:text-gray-400">{c.phone}</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active clients */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Active clients ({activeClients.length})</p>
            {activeClients.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-6">No active clients yet. Add your first one.</p>
            )}
            {activeClients.map(c => (
              <div key={c.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{c.dog_name}</span>
                      <ServiceTypeBadge type={c.service_type} />
                      {c.rate_per_session && (
                        <span className="text-xs text-gray-600">{fmt$(c.rate_per_session)}/session</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{c.owner_name}</p>
                    {c.schedule && <p className="text-xs text-gray-600 mt-0.5">{c.schedule}</p>}
                    {c.notes && <p className="text-xs text-gray-700 mt-1 italic">{c.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {c.phone && <a href={`tel:${c.phone}`} className="text-xs text-gray-600 hover:text-gray-400">{c.phone}</a>}
                    <div className="flex gap-1">
                      <button onClick={() => { setActive(c); setModal('client'); }}
                        className="text-xs text-gray-600 hover:text-gray-300 px-2 py-1 rounded hover:bg-white/10">Edit</button>
                      <button onClick={() => handleDeleteClient(c)}
                        className="text-xs text-gray-700 hover:text-red-400 px-2 py-1 rounded hover:bg-white/10">×</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Inactive clients toggle */}
          {inactiveClients.length > 0 && (
            <div>
              <button onClick={() => setShowInactive(v => !v)}
                className="text-xs text-gray-600 hover:text-gray-400">
                {showInactive ? '▲' : '▼'} {inactiveClients.length} inactive client{inactiveClients.length !== 1 ? 's' : ''}
              </button>
              {showInactive && (
                <div className="mt-2 space-y-2 opacity-50">
                  {inactiveClients.map(c => (
                    <div key={c.id} className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-400">{c.dog_name}</span>
                          <span className="text-xs text-gray-600 ml-2">{c.owner_name}</span>
                          <ServiceTypeBadge type={c.service_type} />
                        </div>
                        <button onClick={() => { setActive(c); setModal('client'); }}
                          className="text-xs text-gray-600 hover:text-gray-400 px-2 py-1 rounded">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── LOG TAB ── */}
      {tab === 'log' && (
        <div className="space-y-4">
          {/* Weekly revenue summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'This week', value: fmt$(weekTotal),       color: 'text-white' },
              { label: 'Collected', value: fmt$(weekCollected),   color: 'text-emerald-400' },
              { label: 'Outstanding',value: fmt$(weekOutstanding), color: weekOutstanding > 0 ? 'text-amber-400' : 'text-gray-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Log entries */}
          <div className="space-y-2">
            {logs.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-8">No service logs yet.</p>
            )}
            {logs.map(l => {
              const clientName = l.wilder_clients?.dog_name ?? '—';
              const ownerName  = l.wilder_clients?.owner_name ?? '';
              return (
                <div key={l.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{clientName}</span>
                        {ownerName && <span className="text-xs text-gray-500">{ownerName}</span>}
                        <ServiceTypeBadge type={l.service_type} />
                        {l.amount && <span className="text-xs font-semibold text-emerald-400">{fmt$(l.amount)}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-600">{l.date}</span>
                        {l.duration_mins && <span className="text-xs text-gray-600">{l.duration_mins}min</span>}
                        {l.notes && <span className="text-xs text-gray-700 italic truncate max-w-[180px]">{l.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleToggleInvoiced(l)}
                        className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                          l.invoiced
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-gray-600 hover:border-white/20'
                        }`}>
                        {l.invoiced ? '✓ Paid' : 'Unpaid'}
                      </button>
                      <button onClick={() => { setActive(l); setModal('log'); }}
                        className="text-xs text-gray-600 hover:text-gray-300 px-1.5 py-1 rounded hover:bg-white/10">✎</button>
                      <button onClick={() => handleDeleteLog(l)}
                        className="text-xs text-gray-700 hover:text-red-400 px-1.5 py-1 rounded hover:bg-white/10">×</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LEADS TAB ── */}
      {tab === 'leads' && (
        <div className="space-y-4">
          {/* Status columns */}
          {STATUSES.map(status => {
            const group = leads.filter(l => l.status === status.value);
            if (group.length === 0) return null;
            return (
              <div key={status.value}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: status.color }}/>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: status.color }}>
                    {status.label} ({group.length})
                  </p>
                </div>
                <div className="space-y-2 ml-4">
                  {group.map(l => (
                    <div key={l.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{l.name}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {l.contact && <span className="text-xs text-gray-500">{l.contact}</span>}
                            {l.service_interest && (
                              <span className="text-xs text-gray-600 italic">{l.service_interest}</span>
                            )}
                          </div>
                          {l.notes && <p className="text-xs text-gray-700 mt-1 italic">{l.notes}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setActive(l); setModal('lead'); }}
                            className="text-xs text-gray-600 hover:text-gray-300 px-1.5 py-1 rounded hover:bg-white/10">✎</button>
                          <button onClick={() => handleDeleteLead(l)}
                            className="text-xs text-gray-700 hover:text-red-400 px-1.5 py-1 rounded hover:bg-white/10">×</button>
                        </div>
                      </div>
                      {/* Quick status change */}
                      <div className="flex gap-1 mt-2">
                        {STATUSES.filter(s => s.value !== l.status).map(s => (
                          <button key={s.value} onClick={() => handleSaveLead({ ...l, status: s.value })}
                            className="text-[10px] px-2 py-0.5 rounded-full border transition-colors"
                            style={{ color: s.color, borderColor: s.color+'33', background: s.color+'11' }}>
                            → {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {leads.length === 0 && (
            <p className="text-sm text-gray-600 text-center py-8">No leads yet. Add one to start tracking your pipeline.</p>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'client' && (
        <ClientForm
          client={active}
          onSave={handleSaveClient}
          onClose={() => { setModal(null); setActive(null); }}
        />
      )}
      {modal === 'log' && (
        <ServiceLogForm
          log={active}
          clients={clients}
          onSave={handleSaveLog}
          onClose={() => { setModal(null); setActive(null); }}
        />
      )}
      {modal === 'lead' && (
        <LeadForm
          lead={active}
          onSave={handleSaveLead}
          onClose={() => { setModal(null); setActive(null); }}
        />
      )}
    </div>
  );
}
