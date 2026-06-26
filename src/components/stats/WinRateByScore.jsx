import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export default function WinRateByScore({ data }) {
  return (
    <div className="h-72 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Win rate by score band</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis unit="%" tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="winRate" fill="#7c3aed">
            <LabelList dataKey="count" position="top" formatter={(v) => `n=${v}`} fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
