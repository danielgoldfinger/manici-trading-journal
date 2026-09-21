import { Link } from 'react-router-dom';
import { MODULES } from '../lib/modules';
import ModuleIcon from '../components/layout/ModuleIcon';

const modules = MODULES.filter((m) => m.key !== 'home');

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500">{todayLabel()}</p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          {greeting()}, Daniel
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Your personal operating system — one place for everything that matters.
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((m) => (
          <Link
            key={m.key}
            to={m.to}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:shadow-lg"
          >
            {/* Color accent line */}
            <div
              className="absolute left-0 top-0 h-0.5 w-full opacity-70"
              style={{ backgroundColor: m.color }}
            />

            <div className="flex items-start justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: m.color + '22' }}
              >
                <ModuleIcon icon={m.icon} size={20} color={m.color} />
              </div>
              <svg
                className="h-4 w-4 text-gray-600 transition-colors group-hover:text-gray-400"
                fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-white">{m.label}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{m.description}</p>
            </div>

            {m.key === 'trading' && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="text-[10px] font-medium text-green-400">Active</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
