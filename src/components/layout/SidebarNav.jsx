import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MODULES } from '../../lib/modules';
import ModuleIcon from './ModuleIcon';

export default function SidebarNav() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-white/10 bg-[#0f1117]">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center px-5">
        <NavLink to="/" className="text-base font-bold tracking-tight text-white">
          Personal <span className="text-purple-400">OS</span>
        </NavLink>
      </div>

      {/* Module nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-0.5">
          {MODULES.map((m) => (
            <li key={m.key}>
              <NavLink
                to={m.to}
                end={m.exact}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <ModuleIcon icon={m.icon} size={18} color={isActive ? m.color : 'currentColor'} />
                    <span>{m.label}</span>
                    {isActive && (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: settings + sign out */}
      <div className="shrink-0 border-t border-white/10 px-3 py-3 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <ModuleIcon icon="settings" size={18} color="currentColor" />
          Settings
        </NavLink>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
