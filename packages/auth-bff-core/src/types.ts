export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  user: Record<string, any>;
  expires_in?: number;
}

export interface SessionData {
  access_token: string;
  refresh_token?: string;
  csrf_token: string;
  user: Record<string, any>;
  iat?: number;
}

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  path?: string;
  maxAge?: number;
  domain?: string;
}
