export default function AccountWidget({ account, positions }) {
  if (!account) return null;

  const openPosition = positions?.find((p) => p.symbol?.includes('MES'));
  const balanceValue = account.total_net_liquidation_value ?? account.netLiquidation ?? account.balance;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-800">
      <div>
        <p className="text-xs text-gray-500">Live balance</p>
        {balanceValue !== undefined ? (
          <p className="text-xl font-bold">${parseFloat(balanceValue).toLocaleString()}</p>
        ) : (
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer">Unrecognized response shape — raw data</summary>
            <pre className="mt-1 overflow-x-auto">{JSON.stringify(account, null, 2)}</pre>
          </details>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500">Open MES position</p>
        <p className="text-xl font-bold">
          {openPosition ? `${openPosition.quantity ?? openPosition.qty} @ ${openPosition.avgCost ?? openPosition.cost_price}` : 'None'}
        </p>
      </div>
    </div>
  );
}
