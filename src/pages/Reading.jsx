import { useState, useEffect, useCallback } from 'react';
import { useReading } from '../hooks/useReading';
import BookForm from '../components/reading/BookForm';
import ReviewForm from '../components/reading/ReviewForm';

const GENRE_COLORS = {
  'Markets / Finance': '#4f8ef7',
  'Biography':         '#f0a050',
  'Strategy':          '#e0b954',
  'Psychology':        '#c084fc',
  'History':           '#9c6fd6',
  'Business':          '#4caf50',
  'Fiction':           '#5bc4f5',
  'Other':             '#6b7280',
};

function Stars({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'text-xl' : 'text-sm';
  return (
    <span className={sz}>
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= (rating ?? 0) ? 'text-amber-400' : 'text-white/10'}>★</span>
      ))}
    </span>
  );
}

function GenreBadge({ genre }) {
  if (!genre) return null;
  const color = GENRE_COLORS[genre] ?? '#6b7280';
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
      style={{ color, borderColor: color + '44', background: color + '18' }}>
      {genre}
    </span>
  );
}

function daysLeft(target) {
  if (!target) return null;
  const diff = Math.ceil((new Date(target + 'T12:00:00') - new Date()) / 86400000);
  return diff;
}

export default function Reading() {
  const [books, setBooks]       = useState([]);
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit' | 'review'
  const [active, setActive]     = useState(null); // book being acted on
  const [expanded, setExpanded] = useState(null); // book id for detail expand
  const [filter, setFilter]     = useState('all'); // 'all' | year | 'want_to_read'
  const { fetchBooks, saveBook, deleteBook } = useReading();

  const load = useCallback(async () => {
    try { setBooks(await fetchBooks()); } catch(e) { console.error(e); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const currentBook  = books.find(b => b.status === 'reading');
  const finished     = books.filter(b => b.status === 'finished');
  const wantToRead   = books.filter(b => b.status === 'want_to_read');

  // Yearly stats
  const thisYear = new Date().getFullYear();
  const finishedThisYear = finished.filter(b => b.date_finished?.startsWith(String(thisYear)));
  const avgRating = finishedThisYear.filter(b => b.rating).reduce((s, b, _, a) => s + b.rating / a.filter(x => x.rating).length, 0);
  const favorite  = finishedThisYear.filter(b => b.rating).sort((a,b) => b.rating - a.rating)[0];
  const totalPages = finishedThisYear.filter(b => b.pages).reduce((s, b) => s + b.pages, 0);

  // Years for filter
  const years = [...new Set(finished.map(b => b.date_finished?.slice(0,4)).filter(Boolean))].sort((a,b) => b-a);

  const filteredFinished = filter === 'all' ? finished
    : filter === 'want_to_read' ? wantToRead
    : finished.filter(b => b.date_finished?.startsWith(filter));

  async function handleSave(fields) {
    await saveBook(fields);
    await load();
  }

  async function handleDelete(book) {
    if (!confirm(`Delete "${book.title}"?`)) return;
    await deleteBook(book.id);
    await load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Currently Reading */}
      {currentBook ? (
        <div className="rounded-xl border border-[#5bc4f5]/25 bg-[#5bc4f5]/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#5bc4f5]/70 uppercase tracking-wider font-semibold mb-1">Currently Reading</p>
              <h2 className="text-lg font-bold text-white leading-tight">{currentBook.title}</h2>
              <p className="text-sm text-gray-400">{currentBook.author}</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <GenreBadge genre={currentBook.genre} />
                {currentBook.date_started && (
                  <span className="text-xs text-gray-600">Started {new Date(currentBook.date_started+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                )}
                {currentBook.target_finish && (() => {
                  const d = daysLeft(currentBook.target_finish);
                  return (
                    <span className={`text-xs ${d < 0 ? 'text-red-400' : d <= 7 ? 'text-amber-400' : 'text-gray-600'}`}>
                      {d < 0 ? `${Math.abs(d)}d overdue` : `${d}d left`}
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => { setActive(currentBook); setModal('review'); }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold text-amber-400 transition-colors whitespace-nowrap">
                Mark finished
              </button>
              <button onClick={() => { setActive(currentBook); setModal('edit'); }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-400 transition-colors text-center">
                Edit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
          <p className="text-sm text-gray-500">No book in progress</p>
          <button onClick={() => { setActive(null); setModal('add'); }}
            className="mt-2 text-xs text-[#5bc4f5] hover:underline">Start one →</button>
        </div>
      )}

      {/* Yearly stats */}
      {finishedThisYear.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: `Books in ${thisYear}`, value: finishedThisYear.length },
            { label: 'Avg rating', value: avgRating ? avgRating.toFixed(1) + ' ★' : '—' },
            { label: 'Pages read', value: totalPages ? totalPages.toLocaleString() : '—' },
            { label: 'Favorite', value: favorite ? favorite.title.split(' ').slice(0,3).join(' ')+'…' : '—', small: true },
          ].map(({ label, value, small }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className={`font-bold text-white ${small ? 'text-xs leading-tight' : 'text-xl'}`}>{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add + filter row */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => { setActive(null); setModal('add'); }}
          className="px-4 py-2 rounded-xl bg-[#5bc4f5]/15 hover:bg-[#5bc4f5]/25 border border-[#5bc4f5]/25 text-sm font-medium text-[#5bc4f5] transition-colors">
          + Add book
        </button>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {['all', 'want_to_read', ...years].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${filter === f ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-500 hover:text-gray-300'}`}>
              {f === 'all' ? 'All' : f === 'want_to_read' ? 'Want to read' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Library */}
      <div className="space-y-2">
        {filteredFinished.length === 0 && filter !== 'want_to_read' && wantToRead.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">No books yet. Add your first one above.</p>
        ) : (
          (filter === 'want_to_read' ? wantToRead : filteredFinished).map(book => {
            const isExpanded = expanded === book.id;
            return (
              <div key={book.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                <div className="p-3 flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : book.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {book.date_finished && (
                        <span className="text-[10px] text-gray-600">{book.date_finished.slice(0,4)}</span>
                      )}
                      <GenreBadge genre={book.genre} />
                      {book.would_recommend === true && (
                        <span className="text-[10px] text-emerald-400">✓ Recommend</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white mt-0.5 leading-tight">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.author}</p>
                    {book.rating && <div className="mt-1"><Stars rating={book.rating} /></div>}
                  </div>
                  <span className="text-gray-600 text-xs flex-shrink-0 mt-1">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/[0.06] px-3 pb-3 pt-2 space-y-3">
                    {book.review && (
                      <p className="text-sm text-gray-400 leading-relaxed italic">"{book.review}"</p>
                    )}
                    {book.takeaways?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider">Takeaways</p>
                        {book.takeaways.map((t, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-xs text-gray-600 flex-shrink-0">{i+1}.</span>
                            <p className="text-xs text-gray-300 leading-relaxed">{t}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setActive(book); setModal('edit'); }}
                        className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-white/10">
                        Edit
                      </button>
                      {book.status === 'finished' && !book.rating && (
                        <button onClick={() => { setActive(book); setModal('review'); }}
                          className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded hover:bg-white/10">
                          Add review
                        </button>
                      )}
                      <button onClick={() => handleDelete(book)}
                        className="text-xs text-gray-600 hover:text-red-400 px-2 py-1 rounded hover:bg-white/10 ml-auto">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <BookForm onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {modal === 'edit' && active && (
        <BookForm book={active} onSave={handleSave} onClose={() => { setModal(null); setActive(null); }} />
      )}
      {modal === 'review' && active && (
        <ReviewForm book={active} onSave={handleSave} onClose={() => { setModal(null); setActive(null); }} />
      )}
    </div>
  );
}
