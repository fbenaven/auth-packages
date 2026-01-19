import { Hono, Context } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { encrypt, decrypt, SessionData, IdPAdapter } from '@fbenaven/auth-bff-core';
import { generateCsrfToken, CSRF_COOKIE_NAME } from './csrf.js';
import { AuthRoutesConfig } from './types.js';

export function createAuthRoutes(config: AuthRoutesConfig) {
  const auth = new Hono();
  const sessionCookieName = config.sessionCookieName || 'session';

  const getAdapter = (c: Context): IdPAdapter => {
    return typeof config.adapter === 'function' ? config.adapter(c) : config.adapter;
  };

  const getSecret = (c: Context): string => {
    return typeof config.sessionSecret === 'function' ? config.sessionSecret(c) : config.sessionSecret;
  };

  auth.post('/login', async (c) => {
    const { email, password } = await c.req.json();
    const adapter = getAdapter(c);
    const secret = getSecret(c);

    try {
      const data = await adapter.login(email, password);
      const csrfToken = generateCsrfToken();

      const sessionData: SessionData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        csrf_token: csrfToken,
        user: data.user,
        iat: Math.floor(Date.now() / 1000),
      };

      const encryptedSession = await encrypt(sessionData, secret);

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax' as const,
        path: '/',
        maxAge: 3600,
        ...config.cookieOptions,
      };

      // Set HttpOnly session cookie
      setCookie(c, sessionCookieName, encryptedSession, cookieOptions);

      // Set non-HttpOnly CSRF cookie
      setCookie(c, CSRF_COOKIE_NAME, csrfToken, {
        ...cookieOptions,
        httpOnly: false,
      });

      return c.json({ user: data.user });
    } catch (error: any) {
      return c.json({ error: error.message || 'Login failed' }, 401);
    }
  });

  auth.post('/logout', async (c) => {
    const adapter = getAdapter(c);
    const secret = getSecret(c);
    const sessionCookie = getCookie(c, sessionCookieName);

    if (sessionCookie) {
      const session = await decrypt(sessionCookie, secret);
      if (session?.access_token) {
        try {
          await adapter.logout(session.access_token);
        } catch (e) {
          console.warn('Logout from IdP failed:', e);
        }
      }
    }

    deleteCookie(c, sessionCookieName, config.cookieOptions);
    deleteCookie(c, CSRF_COOKIE_NAME, config.cookieOptions);
    return c.json({ message: 'Logged out' });
  });

  auth.get('/session', async (c) => {
    const secret = getSecret(c);
    const sessionCookie = getCookie(c, sessionCookieName);

    if (!sessionCookie) {
      return c.json({ user: null }, 200);
    }

    const session = await decrypt(sessionCookie, secret);
    if (!session) {
      deleteCookie(c, sessionCookieName, config.cookieOptions);
      return c.json({ user: null }, 200);
    }

    return c.json({ user: session.user });
  });

  return auth;
}
