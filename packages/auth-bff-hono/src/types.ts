import { Context } from 'hono';
import { IdPAdapter, CookieOptions } from '@fbenaven/auth-bff-core';

export interface AuthRoutesConfig {
  adapter: IdPAdapter | ((c: Context) => IdPAdapter);
  sessionSecret: string | ((c: Context) => string);
  cookieOptions?: CookieOptions;
  sessionCookieName?: string;
}

export interface JwtMiddlewareConfig {
  adapter: IdPAdapter | ((c: Context) => IdPAdapter);
  sessionSecret: string | ((c: Context) => string);
  sessionCookieName?: string;
  getJwksUrl?: (c: Context) => string;
  getIssuer?: (c: Context) => string;
}

export type AuthVariables = {
  user: any;
  authMethod: 'bearer' | 'cookie' | null;
};

