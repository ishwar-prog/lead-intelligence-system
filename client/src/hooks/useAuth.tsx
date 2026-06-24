import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import * as authApi from '../api/auth.api';
import type { AuthUser } from '../api/auth.api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const authVersionRef = useRef(0);

  useEffect(() => {
    const version = authVersionRef.current;
    authApi
      .getCurrentUser()
      .then((u) => {
        if (authVersionRef.current === version) setUser(u);
      })
      .finally(() => {
        if (authVersionRef.current === version) setLoading(false);
      });
  }, []);

  async function login(email: string, password: string) {
    const version = ++authVersionRef.current;
    const u = await authApi.login(email, password);
    if (authVersionRef.current === version) setUser(u);
    setLoading(false);
  }

  async function register(email: string, password: string, name: string) {
    const version = ++authVersionRef.current;
    const u = await authApi.register(email, password, name);
    if (authVersionRef.current === version) setUser(u);
    setLoading(false);
  }

  async function logout() {
    const version = ++authVersionRef.current;
    await authApi.logout();
    if (authVersionRef.current === version) setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
