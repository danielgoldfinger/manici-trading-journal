import { NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const links = [
  { to: '/log', label: 'Log' },
  { to: '/journal', label: 'Journal' },
  { to: '/stats', label: 'Stats' },
  { to: '/plan', label: 'Plan' },
  { to: '/observations', label: 'Observations' },
  { to: '/principles', label: 'Principles' },
  { to: '/settings', label: 'Settings' },
];

export default function Nav() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-800">
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        Sign out
      </button>
    </nav>
  );
}
