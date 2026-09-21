import { MODULES } from '../../lib/modules';
import ModuleIcon from './ModuleIcon';

export default function ComingSoon({ module: key, label, description }) {
  const mod = MODULES.find((m) => m.key === key);
  const color = mod?.color ?? '#6b7280';

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ backgroundColor: color + '22', border: `1px solid ${color}44` }}
      >
        {mod && <ModuleIcon icon={mod.icon} size={36} color={color} />}
      </div>
      <h1 className="text-xl font-bold text-white">{label}</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-xs text-gray-400">Not yet built</span>
      </div>
    </div>
  );
}
