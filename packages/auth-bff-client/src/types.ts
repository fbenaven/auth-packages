export interface AuthClientConfig {
  baseUrl: string;
  sessionCookieName?: string;
  csrfCookieName?: string;
}

export interface SessionResponse {
  user: Record<string, any> | null;
}

export interface AuthClient {
  signIn(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  getSession(): Promise<SessionResponse>;
  fetchWithAuth(url: string, options?: RequestInit): Promise<Response>;
  setUnauthorizedHandler(handler: () => void): void;
  getCsrfTokenFromCookie(): string;
}
