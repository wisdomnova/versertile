'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@/lib/types/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<void>;
  loginWithWallet: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setState({ user: data.data.user, loading: false, error: null });
      } else {
        setState({ user: null, loading: false, error: null });
      }
    } catch {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setState({ user: data.data.user, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setState((prev) => ({ ...prev, loading: false, error: msg }));
      throw err;
    }
  };

  const signup = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, password_confirm: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setState({ user: data.data.user, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      setState((prev) => ({ ...prev, loading: false, error: msg }));
      throw err;
    }
  };

  const loginWithWallet = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
      if (!ethereum) {
        throw new Error('No wallet detected. Please install MetaMask.');
      }

      const accounts: string[] = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const address = accounts[0];

      const nonceRes = await fetch(`/api/auth/nonce?address=${address}`);
      const nonceData = await nonceRes.json();
      if (!nonceRes.ok) throw new Error(nonceData.error || 'Failed to get nonce');

      const domain = window.location.host;
      const uri = window.location.origin;
      const issuedAt = new Date().toISOString();

      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        address,
        '',
        'Sign in to VERSERTILE',
        '',
        `URI: ${uri}`,
        'Version: 1',
        `Chain ID: ${nonceData.data.chainId}`,
        `Nonce: ${nonceData.data.nonce}`,
        `Issued At: ${issuedAt}`,
      ].join('\n');

      const signature: string = await ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      const verifyRes = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature, address }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Wallet verification failed');
      }

      setState({ user: verifyData.data.user, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Wallet login failed';
      setState((prev) => ({ ...prev, loading: false, error: msg }));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setState({ user: null, loading: false, error: null });
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, loginWithWallet, logout, refresh, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<never>;
}
