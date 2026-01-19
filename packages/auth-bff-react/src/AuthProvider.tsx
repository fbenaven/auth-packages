import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createAuthClient, SessionResponse } from '@fbenaven/auth-bff-client';
import { AuthContextValue, AuthProviderProps } from './types.js';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, baseUrl, sessionCookieName, csrfCookieName }: AuthProviderProps) {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  const authClient = useMemo(() => createAuthClient({
    baseUrl,
    sessionCookieName,
    csrfCookieName,
  }), [baseUrl, sessionCookieName, csrfCookieName]);

  useEffect(() => {
    // Set up the 401 handler
    authClient.setUnauthorizedHandler(() => {
      setSession(null);
      setCsrfToken('');
    });

    // Load existing session on mount
    async function initAuth() {
      try {
        const data = await authClient.getSession();
        setSession(data.user ? data : null);
        if (data.user) {
          setCsrfToken(authClient.getCsrfTokenFromCookie());
        }
      } catch (e) {
        console.error('Failed to init auth', e);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [authClient]);

  const signIn = async (email: string, password: string) => {
    const data = await authClient.signIn(email, password);
    setSession(data);
    setCsrfToken(authClient.getCsrfTokenFromCookie());
  };

  const signOut = async () => {
    await authClient.signOut();
    setSession(null);
    setCsrfToken('');
  };

  const fetchWithAuth = authClient.fetchWithAuth;

  const value: AuthContextValue = {
    session,
    loading,
    csrfToken,
    signIn,
    signOut,
    fetchWithAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
