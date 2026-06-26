export default function AccountWidget({ account, positions }) {
  if (!account) return null;

  const openPosition = positions?.find((p) => p.symbol?.includes('MES'));

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-800">
      <div>
        <p className="text-xs text-gray-500">Live balance</p>
        <p className="text-xl font-bold">${parseFloat(account.netLiquidation ?? account.balance ?? 0).toLocaleString()}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Open MES position</p>
        <p className="text-xl font-bold">
          {openPosition ? `${openPosition.quantity} @ ${openPosition.avgCost}` : 'None'}
        </p>
      </div>
    </div>
  );
}
