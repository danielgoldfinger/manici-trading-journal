import { useEffect, useState } from 'react';
import { useDailyPlan } from '../hooks/useDailyPlan';
import NewsletterUpload from '../components/newsletter/NewsletterUpload';
import ParsedPlanView from '../components/newsletter/ParsedPlanView';

export default function Plan() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { plan, loading, error, loadPlan, parseAndSave } = useDailyPlan();
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    loadPlan(date);
  }, [date, loadPlan]);

  async function handleParse(text) {
    setParsing(true);
    try {
      await parseAndSave(date, text);
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Daily plan</h1>

      <NewsletterUpload date={date} onDateChange={setDate} onParse={handleParse} parsing={parsing} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && plan && <ParsedPlanView plan={plan} />}
      {!loading && !plan && <p className="text-sm text-gray-400">No plan parsed for this date yet.</p>}
    </div>
  );
}
