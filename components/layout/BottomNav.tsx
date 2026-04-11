'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/auth.store';

const navItems = [
  { href: '/', label: 'Events', icon: '🎪' },
  { href: '/tickets', label: 'My Tickets', icon: '🎫', authRequired: true },
  { href: '/scan', label: 'Scan', icon: '📷', roles: ['GATE_AGENT', 'ORGANIZER'] },
  { href: '/organizer/dashboard', label: 'Dashboard', icon: '📊', roles: ['ORGANIZER'] },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const visibleItems = navItems.filter((item) => {
    if (item.roles && !item.roles.includes(user?.role || '')) return false;
    if (item.authRequired && !user) return false;
    return true;
  });

  if (visibleItems.length < 2) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
                isActive ? 'text-brand-gold' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
