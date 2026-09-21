import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import SidebarNav from './SidebarNav';
import BottomTabBar from './BottomTabBar';
import Nav from './Nav';
import { TRADING_ROUTES } from '../../lib/modules';

export default function PersonalOSLayout() {
  const { pathname } = useLocation();
  const isTrading = TRADING_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  return (
    <AuthGuard>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <SidebarNav />
      </div>

      {/* Main content — offset by sidebar on desktop, padded for bottom tab on mobile */}
      <div className="min-h-screen md:pl-56">
        {/* Trading sub-nav shown when inside the trading module */}
        {isTrading && (
          <div className="border-b border-white/10">
            <Nav />
          </div>
        )}

        <main className="px-4 py-6 pb-24 sm:px-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden">
        <BottomTabBar />
      </div>
    </AuthGuard>
  );
}
