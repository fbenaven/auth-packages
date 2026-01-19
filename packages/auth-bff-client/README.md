# @fbenaven/auth-bff-client

A lightweight, framework-agnostic TypeScript client for interacting with the BFF Auth API. It handles authentication state, CSRF token management, and authenticated fetching.

## Features

- **Standard Fetch Wrapper**: Automatically handles credentials and 401 rejections.
- **CSRF Handling**: Auto-injects `X-CSRF-Token` header from cookies.
- **Session Management**: Simple `signIn`, `signOut`, and `getSession` methods.
- **TypeScript**: Fully typed request/response objects.

## Installation

```bash
pnpm add @fbenaven/auth-bff-client
```

## Usage

### 1. Initialize Client

```typescript
import { createAuthClient } from '@fbenaven/auth-bff-client';

const auth = createAuthClient({
  baseUrl: 'https://api.example.com', // Your Worker URL
  // Optional overrides
  // sessionCookieName: 'session',
  // csrfCookieName: 'csrf_token'
});
```

### 2. Authentication

```typescript
// Sign In
try {
  await auth.signIn('user@example.com', 'password');
} catch (err) {
  console.error('Login failed', err);
}

// Get Session
const { user } = await auth.getSession();
if (user) {
  console.log('Logged in as', user.email);
}

// Sign Out
await auth.signOut();
```

### 3. Authenticated Requests

Use `fetchWithAuth` to make requests to your protected API. It automatically includes credentials (cookies) and handles CSRF.

```typescript
const response = await auth.fetchWithAuth('/api/protected-resource', {
  method: 'POST',
  body: JSON.stringify({ data: 'test' })
});

if (response.status === 401) {
  // Handle unauthorized (session expired)
}
```

### 4. Global 401 Handler

Register a callback to be notified whenever a request returns 401 (Unauthorized). Useful for redirecting to login or clearing state.

```typescript
auth.setUnauthorizedHandler(() => {
  console.log('Session expired, redirecting to login...');
  window.location.href = '/login';
});
```
