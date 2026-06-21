import apiClient from './client';
import axios from 'axios'; // Import axios to use its type guard

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
  } catch (error) {
    // 1. Check if it's an actual Axios error with a server response
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      
      // 2. Safely return null only for explicit auth failures
      if (status === 401 || status === 403) {
        return null; 
      }
    }

    // 3. Rethrow network errors (500s, CORS, timeouts, offline, etc.)
    throw error;
  }
}