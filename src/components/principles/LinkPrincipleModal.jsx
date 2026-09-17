import { useEffect, useState } from 'react';
import { usePrinciples } from '../../hooks/usePrinciples';

const REL_TYPES = [
  { value: 'violated',    label: 'Violated',    color: 'text-red-600 dark:text-red-400' },
  { value: 'applied',     label: 'Applied',     color: 'text-green-600 dark:text-green-400' },
  { value: 'reinforced',  label: 'Reinforced',  color: 'text-blue-600 dark:text-blue-400' },
];

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

export default function LinkPrincipleModal({ sourceType, sourceId, existingLinks = [], onSaved, onClose }) {
  const { fetchPrinciples, linkTrade, linkJournal } = usePrinciples();
  const [principles, setPrinciples] = useState([]);
  const [principleId, setPrincipleId] = useState('');
  const [relType, setRelType] = useState('violated');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrinciples().then(setPrinciples).catch(console.error);
  }, []);

  const existingIds = new Set(existingLinks.map(l => l.principle_id));
  const available = principles.filter(p => !existingIds.has(p.id));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!principleId) return;
    setSaving(true);
    setError(null);
    try {
      if (sourceType === 'trade') {
        await linkTrade(sourceId, principleId, relType, note);
      } else {
        await linkJournal(sourceId, principleId, relType, note);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-950"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Link a principle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Principle</span>
            <select value={principleId} onChange={e => setPrincipleId(e.target.value)} required className={inputClass}>
              <option value="">Select…</option>
              {available.map(p => (
                <option key={p.id} value={p.id}>
                  {p.display_number ? `#${p.display_number} — ` : ''}{p.title}
                </option>
              ))}
            </select>
            {available.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">All principles already linked, or none created yet.</p>
            )}
          </label>

          <div>
            <span className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">Relationship</span>
            <div className="flex gap-2">
              {REL_TYPES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRelType(r.value)}
                  className={`flex-1 rounded border px-3 py-2 text-xs font-medium transition-colors ${
                    relType === r.value
                      ? `border-transparent bg-gray-100 ${r.color} dark:bg-gray-800`
                      : 'border-gray-300 text-gray-500 dark:border-gray-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Note (optional)</span>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              className={inputClass}
              placeholder="How did this apply? What happened?"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !principleId}
              className="flex-1 rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Linking…' : 'Link'}
            </button>
            <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
