import { useState } from 'react';

const GENRES = ['Markets / Finance','Biography','Strategy','Psychology','History','Business','Fiction','Other'];
const STATUSES = [
  { value: 'reading',      label: 'Currently Reading' },
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'finished',     label: 'Finished' },
];

export default function BookForm({ book, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title:        book?.title        ?? '',
    author:       book?.author       ?? '',
    genre:        book?.genre        ?? '',
    status:       book?.status       ?? 'reading',
    date_started: book?.date_started ?? today,
    target_finish:book?.target_finish ?? '',
    pages:        book?.pages        ?? '',
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: book?.id,
      ...form,
      pages: form.pages ? parseInt(form.pages) : null,
      date_started: form.date_started || null,
      target_finish: form.target_finish || null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-md bg-[#1a1d27] border border-white/10 rounded-t-2xl sm:rounded-2xl">
        <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{book ? 'Edit Book' : 'Add Book'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
              placeholder="Book title"/>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Author</label>
            <input value={form.author} onChange={e => set('author', e.target.value)} required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
              placeholder="Author name"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Genre</label>
              <select value={form.genre} onChange={e => set('genre', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25">
                <option value="" className="bg-[#1a1d27]">— select —</option>
                {GENRES.map(g => <option key={g} value={g} className="bg-[#1a1d27]">{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25">
                {STATUSES.map(s => <option key={s.value} value={s.value} className="bg-[#1a1d27]">{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date started</label>
              <input type="date" value={form.date_started} onChange={e => set('date_started', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"/>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Target finish</label>
              <input type="date" value={form.target_finish} onChange={e => set('target_finish', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"/>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pages <span className="text-gray-600">(optional)</span></label>
            <input type="number" value={form.pages} onChange={e => set('pages', e.target.value)} min="1" placeholder="320"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"/>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-[#5bc4f5]/20 hover:bg-[#5bc4f5]/30 border border-[#5bc4f5]/30 text-sm font-semibold text-[#5bc4f5] disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : book ? 'Update book' : 'Add book'}
          </button>
        </form>
      </div>
    </div>
  );
}
