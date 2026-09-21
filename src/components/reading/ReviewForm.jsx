import { useState } from 'react';

export default function ReviewForm({ book, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date_finished:    book?.date_finished    ?? today,
    rating:           book?.rating           ?? null,
    review:           book?.review           ?? '',
    takeaways:        book?.takeaways?.length ? book.takeaways : ['', '', ''],
    would_recommend:  book?.would_recommend  ?? null,
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setTakeaway(i, v) {
    setForm(f => { const t = [...f.takeaways]; t[i] = v; return { ...f, takeaways: t }; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: book.id,
      status: 'finished',
      date_finished: form.date_finished,
      rating: form.rating,
      review: form.review,
      takeaways: form.takeaways.filter(t => t.trim()),
      would_recommend: form.would_recommend,
    });
    setSaving(false);
    onClose();
  }

  const Stars = () => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => set('rating', n)}
          className={`text-2xl transition-all ${n <= (form.rating ?? 0) ? 'text-amber-400' : 'text-white/10 hover:text-amber-400/40'}`}>
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-md bg-[#1a1d27] border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1d27] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Mark as Finished</h2>
            <p className="text-xs text-gray-500">{book.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date finished</label>
            <input type="date" value={form.date_finished} onChange={e => set('date_finished', e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"/>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Rating</label>
            <Stars />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Review <span className="text-gray-600">(one paragraph)</span></label>
            <textarea value={form.review} onChange={e => set('review', e.target.value)} rows={3}
              placeholder="What did you think? Key themes, writing quality, how it changed your thinking…"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/25"/>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-gray-500">Top 3 takeaways <span className="text-gray-600">— what will you actually use?</span></label>
            {[0,1,2].map(i => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-2 text-xs text-gray-600 w-4 flex-shrink-0">{i+1}.</span>
                <textarea value={form.takeaways[i] ?? ''} onChange={e => setTakeaway(i, e.target.value)} rows={2}
                  placeholder={['Key insight or action…','Key insight or action…','Key insight or action…'][i]}
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/25"/>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Would recommend?</label>
            <div className="flex gap-2">
              {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
                <button key={l} type="button" onClick={() => set('would_recommend', v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.would_recommend === v
                      ? v ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving || !form.rating}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-sm font-semibold text-amber-400 disabled:opacity-40 transition-colors">
            {saving ? 'Saving…' : 'Save review'}
          </button>
          {!form.rating && <p className="text-center text-xs text-gray-600">Rating required</p>}
        </form>
      </div>
    </div>
  );
}
