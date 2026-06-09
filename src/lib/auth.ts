import { AuthResponse } from '@/types';

const KEYS = {
  accessToken: 'b2b_access_token',
  refreshToken: 'b2b_refresh_token',
  role: 'b2b_role',
  email: 'b2b_email',
};

export function saveAuth(data: AuthResponse) {
  localStorage.setItem(KEYS.accessToken, data.accessToken);
  localStorage.setItem(KEYS.refreshToken, data.refreshToken);
  localStorage.setItem(KEYS.role, data.role);
  localStorage.setItem(KEYS.email, data.email);
}

export function clearAuth() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.refreshToken);
}

export function getUserRole(): 'ADMIN' | 'CLIENT' | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.role) as 'ADMIN' | 'CLIENT' | null;
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.email);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
