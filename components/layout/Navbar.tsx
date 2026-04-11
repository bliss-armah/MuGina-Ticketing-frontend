'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth.store';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-dark text-white shadow-lg">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-brand-gold text-2xl font-black tracking-tight">MuGina</span>
          <span className="text-xs text-gray-400 font-medium hidden xs:block">Ticketing</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'ORGANIZER' && (
                <Link href="/organizer/dashboard" className="text-xs text-gray-300 hover:text-brand-gold transition-colors">
                  Dashboard
                </Link>
              )}
              {user.role === 'GATE_AGENT' && (
                <Link href="/scan" className="text-xs text-gray-300 hover:text-brand-gold transition-colors">
                  Scanner
                </Link>
              )}
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs text-gray-300 hover:text-brand-gold transition-colors">
                Login
              </Link>
              <Link href="/register" className="bg-brand-gold text-white text-xs px-3 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
