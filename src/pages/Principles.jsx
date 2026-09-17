import { useEffect, useState } from 'react';
import { usePrinciples } from '../hooks/usePrinciples';
import PrincipleForm from '../components/principles/PrincipleForm';
import PrincipleLinksPanel from '../components/principles/PrincipleLinksPanel';

const CATEGORY_COLORS = {
  'Risk Management': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Psychology':      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Process':         'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Execution':       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Market Structure':'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Mindset':         'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Discipline':      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Other':           'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function CategoryBadge({ category }) {
  if (!category) return null;
  const cls = CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'];
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>{category}</span>;
}

export default function Principles() {
  const { fetchPrinciples, createPrinciple, updatePrinciple, deletePrinciple } = usePrinciples();

  const [principles, setPrinciples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [linksRefreshKey, setLinksRefreshKey] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    try { setPrinciples(await fetchPrinciples()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const categories = [...new Set(principles.map(p => p.category).filter(Boolean))].sort();

  const filtered = filterCategory
    ? principles.filter(p => p.category === filterCategory)
    : principles;

  async function handleSave(fields) {
    setSaving(true);
    try {
      if (editingId) {
        await updatePrinciple(editingId, fields);
      } else {
        await createPrinciple(fields);
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      await deletePrinciple(id);
      setExpandedId(null);
      setConfirmDeleteId(null);
      await load();
    } catch (e) { console.error(e); }
  }

  async function togglePin(p) {
    await updatePrinciple(p.id, { pinned: !p.pinned });
    await load();
  }

  function startEdit(p) {
    setEditingId(p.id);
    setShowForm(true);
    setExpandedId(null);
  }

  const editingPrinciple = principles.find(p => p.id === editingId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Principles</h1>
          <p className="mt-0.5 text-sm text-gray-500">Fundamental truths that guide your decisions.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          + Add principle
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-5 dark:border-purple-800 dark:bg-purple-900/10">
          <h2 className="mb-4 text-sm font-semibold">{editingId ? 'Edit principle' : 'New principle'}</h2>
          <PrincipleForm
            initial={editingPrinciple ?? {}}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingId(null); }}
            saving={saving}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="flex rounded border border-gray-300 text-sm dark:border-gray-700">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 ${view === 'grid' ? 'bg-gray-100 font-medium dark:bg-gray-800' : 'text-gray-500'}`}
          >
            ⊞ Grid
          </button>
          <button
            onClick={() => setView('list')}
            className={`border-l border-gray-300 px-3 py-1.5 dark:border-gray-700 ${view === 'list' ? 'bg-gray-100 font-medium dark:bg-gray-800' : 'text-gray-500'}`}
          >
            ☰ List
          </button>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <span className="text-xs text-gray-400">{filtered.length} principle{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500">No principles yet.</p>
          <button onClick={() => setShowForm(true)} className="mt-2 text-sm text-purple-600 hover:underline dark:text-purple-400">
            Add your first one
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <div
              key={p.id}
              className={`flex flex-col rounded-xl border p-4 transition-shadow hover:shadow-md ${
                p.pinned ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {p.display_number != null && (
                    <span className="shrink-0 text-xs font-bold text-gray-400">#{p.display_number}</span>
                  )}
                  {p.pinned && <span title="Pinned" className="text-xs">📌</span>}
                </div>
                <CategoryBadge category={p.category} />
              </div>

              <h3
                className="mb-2 cursor-pointer text-sm font-semibold leading-snug hover:text-purple-600 dark:hover:text-purple-400"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              >
                {p.title}
              </h3>

              {p.body && expandedId !== p.id && (
                <p className="line-clamp-3 text-xs text-gray-500 dark:text-gray-400">{p.body}</p>
              )}

              {expandedId === p.id && (
                <div className="mt-2 space-y-4">
                  {p.body && <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{p.body}</p>}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Evidence</p>
                    <PrincipleLinksPanel principleId={p.id} refreshKey={linksRefreshKey} />
                  </div>
                </div>
              )}

              <div className="mt-auto flex items-center gap-3 pt-3">
                <button
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  className="text-xs text-purple-600 hover:underline dark:text-purple-400"
                >
                  {expandedId === p.id ? 'Collapse' : 'Expand'}
                </button>
                <button onClick={() => startEdit(p)} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Edit</button>
                <button onClick={() => togglePin(p)} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  {p.pinned ? 'Unpin' : 'Pin'}
                </button>
                {confirmDeleteId === p.id ? (
                  <>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600">Confirm</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-400">Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDeleteId(p.id)} className="text-xs text-gray-400 hover:text-red-500">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {!loading && view === 'list' && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <div key={p.id} className={`rounded-xl border ${p.pinned ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-gray-800'}`}>
              <button
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              >
                <span className="mt-0.5 shrink-0 text-sm font-bold text-gray-300 dark:text-gray-600 w-6 text-right">
                  {p.display_number ?? i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.pinned && <span className="text-xs">📌</span>}
                    <span className="text-sm font-semibold">{p.title}</span>
                    <CategoryBadge category={p.category} />
                  </div>
                  {!expandedId || expandedId !== p.id ? (
                    p.body && <p className="mt-1 line-clamp-1 text-xs text-gray-500">{p.body}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-gray-400">{expandedId === p.id ? '▲' : '▼'}</span>
              </button>

              {expandedId === p.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-gray-800">
                  {p.body && <p className="mb-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{p.body}</p>}
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Evidence</p>
                    <PrincipleLinksPanel principleId={p.id} refreshKey={linksRefreshKey} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(p)} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Edit</button>
                    <button onClick={() => togglePin(p)} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      {p.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    {confirmDeleteId === p.id ? (
                      <>
                        <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600">Confirm delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-400">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(p.id)} className="text-xs text-gray-400 hover:text-red-500">Delete</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
