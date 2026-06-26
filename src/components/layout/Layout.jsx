import { Outlet } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import Nav from './Nav';

export default function Layout() {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Nav />
        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </AuthGuard>
  );
}
