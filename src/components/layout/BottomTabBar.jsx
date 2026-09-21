import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MODULES } from '../../lib/modules';
import ModuleIcon from './ModuleIcon';

// Primary 4 tabs + "More"
const PRIMARY_KEYS = ['home', 'habits', 'trading', 'fitness', 'reading'];

export default function BottomTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const primary = MODULES.filter((m) => PRIMARY_KEYS.includes(m.key));
  const secondary = MODULES.filter((m) => !PRIMARY_KEYS.includes(m.key));

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
    setMoreOpen(false);
  }

  return (
    <>
      {/* More drawer overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-50 rounded-t-2xl border-t border-white/10 bg-[#0f1117] px-4 pb-6 pt-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">More</span>
            <button onClick={() => setMoreOpen(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {secondary.map((m) => (
              <NavLink
                key={m.key}
                to={m.to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors ${
                    isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <ModuleIcon icon={m.icon} size={22} color={isActive ? m.color : '#9ca3af'} />
                    <span className="text-[10px] font-medium text-gray-300">{m.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 grid grid-cols-2 gap-2">
            <NavLink
              to="/settings"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <ModuleIcon icon="settings" size={16} color="currentColor" />
              Settings
            </NavLink>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-white/10 bg-[#0f1117]">
        {primary.map((m) => (
          <NavLink
            key={m.key}
            to={m.to}
            end={m.exact}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-white' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ModuleIcon icon={m.icon} size={22} color={isActive ? m.color : 'currentColor'} />
                <span>{m.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-1 h-0.5 w-6 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-gray-500 hover:text-white"
        >
          <ModuleIcon icon="more" size={22} color="currentColor" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
