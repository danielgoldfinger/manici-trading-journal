import { useState, useEffect } from 'react';
import { CATEGORIES } from '../../data/scheduleTemplate';
import { useSchedule } from '../../hooks/useSchedule';

export default function BlockDetailModal({ block, date, logEntry, onClose, onRefresh, isActual }) {
  const { toggleLog, updateNote } = useSchedule();
  const cat = CATEGORIES[block.category] ?? CATEGORIES.free;
  const completed = !!logEntry;
  const [note, setNote] = useState(logEntry?.note ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  async function handleToggle() {
    setSaving(true);
    await toggleLog(date, block.id, completed, note);
    await onRefresh();
    setSaving(false);
    onClose();
  }

  async function handleSaveNote(e) {
    e.preventDefault();
    setSaving(true);
    await updateNote(date, block.id, note);
    await onRefresh();
    setSaving(false);
    onClose();
  }

  const timeLabel = `${fmt12(block.start)} – ${fmt12(block.end)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-[#1a1d27] border border-white/10 p-5 pb-8 sm:pb-5">
        {/* color bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: cat.color }} />

        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-lg">✕</button>

        <div className="mt-2 flex items-start gap-3">
          <div className="mt-0.5 h-3 w-1 flex-shrink-0 rounded-full" style={{ background: cat.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: cat.color }}>
              {cat.label}
            </p>
            <h3 className="mt-0.5 text-base font-bold text-white leading-snug">{block.label}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{timeLabel}</p>
            {block.sub && <p className="mt-2 text-sm text-gray-400 leading-relaxed">{block.sub}</p>}
          </div>
        </div>

        {isActual && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <button
                onClick={handleToggle}
                disabled={saving}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  completed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {completed ? '✓ Done' : '○ Mark done'}
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note…"
                rows={2}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/25"
              />
              {note !== (logEntry?.note ?? '') && (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-gray-300 transition-colors"
                >
                  Save note
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function fmt12(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2,'0')}${ampm}`;
}
