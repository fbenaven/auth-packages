import { ReactNode } from 'react';
import { SessionResponse } from '@fbenaven/auth-bff-client';

export interface AuthContextValue {
  session: SessionResponse | null;
  loading: boolean;
  csrfToken: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

export interface AuthProviderProps {
  children: ReactNode;
  baseUrl: string;
  sessionCookieName?: string;
  csrfCookieName?: string;
}
