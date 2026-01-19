# Worker Skaffolding Monorepo

This monorepo contains four TypeScript libraries for authentication and authorization workflows, designed to be modular and composable for modern web applications. Each package serves a distinct purpose and can be used independently or together.

## Packages Overview

- **auth-bff-client**: Client-side SDK for interacting with the Auth BFF (Backend For Frontend).
- **auth-bff-core**: Core logic, types, and adapters for authentication flows.
- **auth-bff-hono**: Hono.js middleware and utilities for building authentication-enabled APIs.
- **auth-bff-react**: React context provider and hooks for integrating authentication in React apps.

---

## 1. auth-bff-client

**Purpose:**
Provides a TypeScript/JavaScript client for interacting with the Auth BFF API from frontend applications.

**Key Methods:**
- `login(credentials)`: Initiates login flow.
- `logout()`: Logs out the current user.
- `getSession()`: Retrieves the current session or user info.
- `refreshSession()`: Refreshes authentication tokens.

**How to Use:**
```ts
import { login, logout, getSession } from 'auth-bff-client';

await login({ email, password });
const session = await getSession();
await logout();
```

**Typical Use Cases:**
- Authenticating users from a SPA or mobile app.
- Managing session state on the client.

---

## 2. auth-bff-core

**Purpose:**
Contains the core authentication logic, shared types, and adapters for different auth providers (e.g., Supabase).

**Key Methods & Modules:**
- `adapters/`: Pluggable adapters for different backends (e.g., Supabase).
- `crypto/session.ts`: Utilities for session management and cryptography.
- Shared types for users, sessions, and tokens.

**How to Use:**
```ts
import { createSession, verifySession } from 'auth-bff-core/src/crypto/session';
import { supabaseAdapter } from 'auth-bff-core/src/adapters/supabase';

const session = createSession(userData);
const isValid = verifySession(sessionToken);
```

**Typical Use Cases:**
- Building custom authentication flows.
- Integrating with different identity providers.

---

## 3. auth-bff-hono

**Purpose:**
Provides Hono.js middleware and utilities for securing API routes, handling CSRF, JWT, RBAC, and routing.

**Key Methods & Modules:**
- `csrf.ts`: CSRF protection middleware.
- `jwtMiddleware.ts`: JWT validation middleware.
- `rbac.ts`: Role-based access control utilities.
- `routes.ts`: Auth-related API route handlers.

**How to Use:**
```ts
import { csrfMiddleware, jwtMiddleware } from 'auth-bff-hono';
import { Hono } from 'hono';

const app = new Hono();
app.use('/api/*', jwtMiddleware());
app.use(csrfMiddleware());
```

**Typical Use Cases:**
- Securing API endpoints in a Hono.js server.
- Adding authentication and authorization to microservices.

---

## 4. auth-bff-react

**Purpose:**
Provides React context, hooks, and components for integrating authentication into React applications.

**Key Methods & Components:**
- `AuthProvider`: React context provider for auth state.
- `useAuth()`: Hook to access authentication state and methods.

**How to Use:**
```tsx
import { AuthProvider, useAuth } from 'auth-bff-react';

function App() {
  return (
    <AuthProvider>
      <MyRoutes />
    </AuthProvider>
  );
}

function Profile() {
  const { user, login, logout } = useAuth();
  // ...
}
```

**Typical Use Cases:**
- Protecting routes in a React app.
- Accessing user/session info in components.

---

## Getting Started

1. Install the desired packages using your package manager (e.g., npm, yarn, pnpm).
2. Follow the usage examples above for each package.
3. See the source code in each package's `src/` directory for more details and advanced usage.

---

## License

MIT
