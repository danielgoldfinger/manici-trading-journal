import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MistakeChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-400 dark:border-gray-800">
        No mistakes flagged yet.
      </div>
    );
  }

  return (
    <div className="h-72 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Mistake frequency</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
