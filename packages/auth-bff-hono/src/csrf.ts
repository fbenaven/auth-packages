import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

export interface CsrfOptions {
  cookieName?: string;
  headerName?: string;
  skipIfBearer?: boolean;
}

export const csrfMiddleware = (options: CsrfOptions = {}): MiddlewareHandler => {
  const cookieName = options.cookieName || CSRF_COOKIE_NAME;
  const headerName = options.headerName || CSRF_HEADER_NAME;

  return async (c, next) => {
    const method = c.req.method;

    // Only check state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      
      // If skipIfBearer is true, check for Authorization header
      if (options.skipIfBearer) {
        const authHeader = c.req.header('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
          await next();
          return;
        }
      }

      const cookieToken = getCookie(c, cookieName);
      const headerToken = c.req.header(headerName);

      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        console.warn(`CSRF validation failed for ${method} ${c.req.path}. Cookie: ${!!cookieToken}, Header: ${!!headerToken}`);
        return c.json({ error: 'Invalid CSRF token' }, 403);
      }
    }

    await next();
  };
};
