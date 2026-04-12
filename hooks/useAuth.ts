'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';

export function useAuth(requireAuth: boolean = true) {
  const { user, token, isLoading, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && requireAuth && !token) {
      router.push('/login');
    }
  }, [isLoading, requireAuth, token, router]);

  return { user, token, isLoading, isAuthenticated: !!token };
}

export function useRequireRole(roles: string | string[]) {
  const { user, isLoading } = useAuth(true);
  const router = useRouter();
  const allowed = Array.isArray(roles) ? roles : [roles];

  useEffect(() => {
    if (!isLoading && user && !allowed.includes(user.role)) {
      router.push('/events');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, router]);

  return { user, isLoading };
}
