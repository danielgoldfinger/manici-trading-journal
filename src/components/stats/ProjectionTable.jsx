export default function ProjectionTable({ curve }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Compounding projection</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-gray-800">
            <th className="py-2 px-3">Month</th>
            <th className="py-2 px-3">Start balance</th>
            <th className="py-2 px-3">Contracts</th>
            <th className="py-2 px-3">Projected gain</th>
            <th className="py-2 px-3">End balance</th>
          </tr>
        </thead>
        <tbody>
          {curve.map((row) => (
            <tr key={row.month} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-1.5 px-3">{row.month}</td>
              <td className="py-1.5 px-3">${row.startBalance.toLocaleString()}</td>
              <td className="py-1.5 px-3">{row.contracts}</td>
              <td className="py-1.5 px-3">${row.monthlyGain.toLocaleString()}</td>
              <td className="py-1.5 px-3">${row.endBalance.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
