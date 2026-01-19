import { AuthClient, AuthClientConfig, SessionResponse } from './types.js';

export function createAuthClient(config: AuthClientConfig): AuthClient {
  let onUnauthorized = () => {};
  const csrfCookieName = config.csrfCookieName || 'csrf_token';

  function setUnauthorizedHandler(handler: () => void) {
    onUnauthorized = handler;
  }

  async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    if (response.status === 401) {
      onUnauthorized();
    }

    return response;
  }

  async function signIn(email: string, password: string): Promise<any> {
    const response = await fetchWithAuth(`${config.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return await response.json();
  }

  async function signOut(): Promise<void> {
    const csrfToken = getCsrfTokenFromCookie();

    await fetchWithAuth(`${config.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });
  }

  async function getSession(): Promise<SessionResponse> {
    const response = await fetchWithAuth(`${config.baseUrl}/auth/session`);
    if (!response.ok) return { user: null };
    return await response.json();
  }

  function getCsrfTokenFromCookie(): string {
    if (typeof document === 'undefined') return '';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${csrfCookieName}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }

  return {
    signIn,
    signOut,
    getSession,
    getCsrfTokenFromCookie,
    setUnauthorizedHandler,
    fetchWithAuth,
  };
}
