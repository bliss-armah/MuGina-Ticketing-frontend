export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ORGANIZER' | 'ATTENDEE' | 'GATE_AGENT';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mugina_token');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('mugina_user');
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

export function setSession(token: string, user: User) {
  localStorage.setItem('mugina_token', token);
  localStorage.setItem('mugina_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('mugina_token');
  localStorage.removeItem('mugina_user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
