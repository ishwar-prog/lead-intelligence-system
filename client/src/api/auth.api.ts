import apiClient from './client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export async function register(email: string, password: string, name: string): Promise<AuthUser> {
  const res = await apiClient.post('/auth/register', { email, password, name });
  return res.data.data;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  } catch {
    return null; // not logged in - not an error, just an expected state
  }
}