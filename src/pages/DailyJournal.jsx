import { useEffect, useState } from 'react';
import { useDailyJournal } from '../hooks/useDailyJournal';
import PreSessionForm from '../components/journal/PreSessionForm';
import PostSessionForm from '../components/journal/PostSessionForm';
import StreamOfConsciousness from '../components/journal/StreamOfConsciousness';
import WeeklyReviewModal, { shouldShowWeeklyReview } from '../components/journal/WeeklyReviewModal';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

const SECTIONS = [
  { key: 'pre',    label: 'Pre-session', sub: 'Write before markets open' },
  { key: 'post',   label: 'Post-session', sub: 'Write after the close' },
  { key: 'stream', label: 'Stream of consciousness', sub: 'Private — not included in analytics' },
];

export default function DailyJournal() {
  const [date, setDate] = useState(todayISO());
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWeekly, setShowWeekly] = useState(false);
  const { getEntry } = useDailyJournal();

  async function load(d) {
    setLoading(true);
    try {
      const e = await getEntry(d);
      setEntry(e ?? { journal_date: d });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(date); }, [date]);

  useEffect(() => {
    if (date === todayISO() && shouldShowWeeklyReview(date)) {
      setShowWeekly(true);
    }
  }, [date]);

  function handleSaved() { load(date); }

  return (
    <div className="space-y-10">
      {/* Date nav */}
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={e => setDate(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        {date !== todayISO() && (
          <button onClick={() => setDate(todayISO())} className="text-sm text-purple-600 hover:underline dark:text-purple-400">
            Today
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          {/* Pre-session */}
          <JournalSection {...SECTIONS[0]} completed={entry?.pre_session_completed}>
            <PreSessionForm journalDate={date} entry={entry} onSaved={handleSaved} />
          </JournalSection>

          {/* Post-session */}
          <JournalSection {...SECTIONS[1]} completed={entry?.post_session_completed}>
            <PostSessionForm journalDate={date} entry={entry} onSaved={handleSaved} />
          </JournalSection>

          {/* Stream */}
          <JournalSection {...SECTIONS[2]} completed={!!entry?.stream_of_consciousness}>
            <StreamOfConsciousness journalDate={date} initialValue={entry?.stream_of_consciousness ?? ''} />
          </JournalSection>
        </>
      )}

      {showWeekly && (
        <WeeklyReviewModal
          journalDate={date}
          entry={entry}
          onClose={() => setShowWeekly(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function JournalSection({ key: _key, label, sub, completed, children }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3 border-b border-gray-200 pb-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {completed && <span className="text-green-500">✓</span>}
          <h2 className="text-base font-semibold">{label}</h2>
        </div>
        <span className="text-xs text-gray-400">{sub}</span>
      </div>
      {children}
    </section>
  );
}
