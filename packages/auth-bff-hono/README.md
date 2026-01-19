# @fbenaven/auth-bff-hono

Hono middleware and route handlers for the BFF authentication system. It orchestrates secure cookie management, CSRF protection, and JWT verification.

## Features

- **Auth Routes**: Pre-built endpoints for `/login`, `/logout`, and `/session`.
- **Dual Authentication**: 
  - **Cookies**: For browser clients (HttpOnly, encrypted).
  - **Bearer Tokens**: For mobile/CLI clients (standard Authorization header).
- **CSRF Protection**: Double-submit cookie pattern for state-changing requests.
- **RBAC**: Role-based access control middleware.

## Installation

```bash
pnpm add @fbenaven/auth-bff-hono @fbenaven/auth-bff-core hono jose
```

## Usage

### 1. Setup Auth Routes

Mount the authentication endpoints. These handle the exchange of credentials for encrypted session cookies.

```typescript
import { Hono } from 'hono';
import { createAuthRoutes } from '@fbenaven/auth-bff-hono';
import { createSupabaseAdapter } from '@fbenaven/auth-bff-core';

const app = new Hono();

app.route('/auth', createAuthRoutes({
  // Inject the IdP adapter
  adapter: (c) => createSupabaseAdapter({
    url: c.env.SUPABASE_URL,
    apiKey: c.env.SUPABASE_PUBLISHABLE_KEY,
  }),
  // Inject session secret
  sessionSecret: (c) => c.env.SESSION_SECRET,
  // Cookie configuration
  cookieOptions: {
    secure: true,
    sameSite: 'Lax',
    path: '/',
  }
}));
```

### 2. Protect API Routes

Use `jwtMiddleware` to protect your API. It automatically handles extracting tokens from Cookies OR Bearer headers.

```typescript
import { jwtMiddleware, csrfMiddleware } from '@fbenaven/auth-bff-hono';

// Protect all /api routes
app.use('/api/*', jwtMiddleware({
  adapter: (c) => createSupabaseAdapter({
    url: c.env.SUPABASE_URL,
    apiKey: c.env.SUPABASE_PUBLISHABLE_KEY,
  }),
  sessionSecret: (c) => c.env.SESSION_SECRET,
}));

// Apply CSRF protection (bypassed if using Bearer token)
app.use('/api/*', csrfMiddleware({ skipIfBearer: true }));

app.get('/api/me', (c) => {
  const user = c.get('user'); // Typed automatically if using AuthVariables
  return c.json({ user });
});
```

### 3. Role-Based Access Control

Verify user roles or permissions.

```typescript
import { roleGuard } from '@fbenaven/auth-bff-hono';

app.get('/api/admin', roleGuard('admin'), (c) => {
  return c.json({ message: 'Welcome Admin' });
});
```

## Type Safety

To get typed context variables (`user`, `authMethod`), define them in your Hono app:

```typescript
import { AuthVariables } from '@fbenaven/auth-bff-hono';

const app = new Hono<{ Variables: AuthVariables }>();
```
