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

export function useRequireRole(role: string) {
  const { user, isLoading } = useAuth(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== role) {
      router.push('/');
    }
  }, [user, isLoading, role, router]);

  return { user, isLoading };
}
