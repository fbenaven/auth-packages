import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { MiddlewareHandler, Context } from 'hono';
import { getCookie, deleteCookie } from 'hono/cookie';
import { decrypt, IdPAdapter } from '@fbenaven/auth-bff-core';
import { JwtMiddlewareConfig } from './types.js';

let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

export const jwtMiddleware = (config: JwtMiddlewareConfig): MiddlewareHandler => {
  const sessionCookieName = config.sessionCookieName || 'session';

  const getAdapter = (c: Context): IdPAdapter => {
    return typeof config.adapter === 'function' ? config.adapter(c) : config.adapter;
  };

  const getSecret = (c: Context): string => {
    return typeof config.sessionSecret === 'function' ? config.sessionSecret(c) : config.sessionSecret;
  };

  return async (c, next) => {
    let token: string | null = null;
    let authMethod: 'bearer' | 'cookie' | null = null;

    // 1. Try Authorization header first (backend clients)
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      authMethod = 'bearer';
    }

    // 2. Fall back to session cookie (browser clients)
    if (!token) {
      const sessionCookie = getCookie(c, sessionCookieName);
      if (sessionCookie) {
        try {
          const secret = getSecret(c);
          const session = await decrypt(sessionCookie, secret);
          if (session?.access_token) {
            token = session.access_token;
            authMethod = 'cookie';
          }
        } catch (e) {
          console.warn('Failed to decrypt session cookie:', e);
          deleteCookie(c, sessionCookieName);
        }
      }
    }

    // 3. No token found
    if (!token) {
      return c.json({ error: 'Unauthorized: No token or session found' }, 401);
    }

    // 4. Verify the JWT
    try {
      const adapter = getAdapter(c);
      const jwksUrl = config.getJwksUrl ? config.getJwksUrl(c) : adapter.getJwksUrl();
      const issuer = config.getIssuer ? config.getIssuer(c) : adapter.getIssuer();

      if (!jwksUrl) {
        return c.json({ error: 'Server error: JWKS URL not configured' }, 500);
      }

      // Initialize JWKS once
      if (!JWKS) {
        JWKS = createRemoteJWKSet(new URL(jwksUrl));
      }

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: issuer,
      });

      // Attach user info to context
      c.set('user', payload);
      c.set('authMethod', authMethod);

      await next();
    } catch (error) {
      console.error(`[Auth] Failed: JWT verification error for ${c.req.method} ${c.req.path}:`, error);
      return c.json({ error: 'Unauthorized: Invalid or expired token' }, 401);
    }
  };
};
