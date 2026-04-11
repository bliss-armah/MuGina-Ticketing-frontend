import { create } from 'zustand';
import { User, setSession, clearSession, getUser, getToken } from '../lib/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setAuth: (token, user) => {
    setSession(token, user);
    set({ user, token });
  },
  logout: () => {
    clearSession();
    set({ user: null, token: null });
  },
  initialize: () => {
    const token = getToken();
    const user = getUser();
    set({ user, token, isLoading: false });
  },
}));
