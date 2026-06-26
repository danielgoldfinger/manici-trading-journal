import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChecklist } from '../../lib/score';
import { useTrades } from '../../hooks/useTrades';

export default function TradeDetail({ tradeId, onClose }) {
  const navigate = useNavigate();
  const { getTrade, deleteTrade } = useTrades();
  const [trade, setTrade] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    getTrade(tradeId).then(setTrade);
  }, [tradeId]);

  if (!trade) return null;

  async function handleDelete() {
    await deleteTrade(tradeId);
    onClose();
  }

  return (
    <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {trade.date} — {trade.setup_type}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/log?id=${trade.id}`)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
          >
            Edit
          </button>
          {confirmingDelete ? (
            <>
              <button onClick={handleDelete} className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">
                Confirm delete
              </button>
              <button onClick={() => setConfirmingDelete(false)} className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmingDelete(true)} className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-800">
              Delete
            </button>
          )}
          <button onClick={onClose} className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700">
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 md:grid-cols-4">
        <Meta label="Result" value={trade.result} />
        <Meta label="Score" value={`${trade.setup_score ?? '—'}%`} />
        <Meta label="P&L (pts)" value={trade.pnl_points ?? '—'} />
        <Meta label="Flush depth" value={trade.flush_depth} />
        <Meta label="FB level" value={trade.fb_level ?? '—'} />
        <Meta label="Entry" value={trade.entry_price ?? '—'} />
        <Meta label="Stop" value={trade.stop_price ?? '—'} />
        <Meta label="T1" value={trade.t1_price ?? '—'} />
        <Meta label="Exit" value={trade.exit_price ?? '—'} />
        <Meta label="Recommended contracts" value={trade.recommended_contracts ?? '—'} />
        <Meta label="Actual contracts" value={trade.actual_contracts ?? '—'} />
        <Meta label="Mistake flag" value={trade.mistake_flag ?? 'None'} />
      </div>

      {trade.webull_order_id && (
        <p className="mt-3 text-xs text-gray-500">Webull order: {trade.webull_order_id} {trade.webull_synced ? '(synced)' : '(unmatched)'}</p>
      )}

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Checklist replay</h3>
        <ul className="grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
          {getChecklist(trade.setup_type).map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <span className={trade[item.id] ? 'text-green-600' : 'text-gray-400'}>
                {trade[item.id] ? '✓' : '✗'}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {trade.thesis && (
        <div className="mt-6">
          <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">Pre-trade thesis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{trade.thesis}</p>
        </div>
      )}

      {trade.post_review && (
        <div className="mt-4">
          <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">Post-trade review</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{trade.post_review}</p>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
