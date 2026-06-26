import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EquityCurve({ actual, projected }) {
  const merged = actual.map((point, i) => ({
    date: point.date,
    actual: point.balance,
    projected: projected[i]?.endBalance ?? null,
  }));

  return (
    <div className="h-72 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Actual vs projected equity</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="actual" stroke="#7c3aed" strokeWidth={2} dot={false} name="Actual" />
          <Line type="monotone" dataKey="projected" stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Projected" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
