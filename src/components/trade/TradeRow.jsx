const RESULT_STYLES = {
  win: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  loss: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  be: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export default function TradeRow({ trade, onClick }) {
  return (
    <tr
      onClick={() => onClick(trade.id)}
      className="cursor-pointer border-b border-gray-100 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
    >
      <td className="py-2 px-3">{trade.date}</td>
      <td className="py-2 px-3">{trade.entry_time ?? '—'}</td>
      <td className="py-2 px-3">{trade.setup_type}</td>
      <td className="py-2 px-3">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${RESULT_STYLES[trade.result] ?? RESULT_STYLES.open}`}>
          {trade.result}
        </span>
      </td>
      <td className="py-2 px-3">{trade.pnl_points ?? '—'}</td>
      <td className="py-2 px-3">{trade.setup_score ?? '—'}%</td>
      <td className="py-2 px-3">{trade.actual_contracts ?? '—'}</td>
      <td className="py-2 px-3">{trade.mistake_flag ? '⚠️' : ''}</td>
      <td className="py-2 px-3">{trade.webull_synced ? '✅' : ''}</td>
    </tr>
  );
}
