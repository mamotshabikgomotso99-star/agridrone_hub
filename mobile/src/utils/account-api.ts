import Constants from 'expo-constants';

import type { User, UserRole } from '@/types/marketplace';

function resolveApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.hostUri ?? 'localhost:8081';
  const host = hostUri.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0') {
    return `http://${host}:5000`;
  }

  return 'http://localhost:5000';
}

const apiBaseUrl = resolveApiBaseUrl();

export type AccountCredentials = {
  token: string;
  user: User;
};

type AccountResponse = { user: User };

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error('Could not reach the account service. Check your connection and try again.');
  }

  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error || 'The account request could not be completed.');
  return payload;
}

export const accountApi = {
  signIn: (email: string, password: string) => request<AccountCredentials>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (fullName: string, email: string, password: string, role: Extract<UserRole, 'farmer' | 'operator'>) => request<AccountCredentials>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password, role }),
  }),
  getAccount: async (token: string) => (await request<AccountResponse>('/api/account', {}, token)).user,
  updateAccount: async (token: string, updates: Partial<Pick<User, 'fullName' | 'email' | 'phone' | 'location' | 'province' | 'businessName' | 'farmName'>>) =>
    (await request<AccountResponse>('/api/account', { method: 'PATCH', body: JSON.stringify(updates) }, token)).user,
  changePassword: (token: string, currentPassword: string, newPassword: string) => request<{ ok: boolean }>('/api/account/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }, token),
  signOut: (token: string) => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }, token),
};