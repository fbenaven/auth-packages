# @fbenaven/auth-bff-core

The core logic and types for the Backend-for-Frontend (BFF) authentication system. This package handles platform-agnostic cryptography (Web Crypto API) and Identity Provider (IdP) adapters.

## Features

- **Session Encryption**: AES-GCM 256-bit encryption for secure stateless sessions.
- **IdP Adapters**: Extensible interface for Identity Providers (currently supports Supabase).
- **Zero Dependencies**: Uses native Web Crypto API and Fetch API.
- **Type Safety**: Full TypeScript definitions.

## Installation

```bash
pnpm add @fbenaven/auth-bff-core
```

## Usage

### 1. Crypto Utilities

Encrypt and decrypt session data securely.

```typescript
import { encrypt, decrypt } from '@fbenaven/auth-bff-core';

const secret = '...'; // 32-byte hex string
const sessionData = { user: { id: 1 }, access_token: '...' };

// Encrypt
const token = await encrypt(sessionData, secret);

// Decrypt
const payload = await decrypt(token, secret);
```

### 2. Supabase Adapter

Create an adapter to communicate with Supabase Auth.

```typescript
import { createSupabaseAdapter } from '@fbenaven/auth-bff-core';

const adapter = createSupabaseAdapter({
  url: process.env.SUPABASE_URL,
  apiKey: process.env.SUPABASE_PUBLISHABLE_KEY,
});

// Login
const { access_token, user } = await adapter.login('user@example.com', 'password');

// Logout
await adapter.logout(access_token);
```

## Creating Custom Adapters

You can implement the `IdPAdapter` interface to support Auth0, Keycloak, etc.

```typescript
import { IdPAdapter, TokenResponse } from '@fbenaven/auth-bff-core';

const myAdapter: IdPAdapter = {
  name: 'my-idp',
  async login(email, password) { /* ... */ },
  async logout(token) { /* ... */ },
  getJwksUrl() { return 'https://.../.well-known/jwks.json'; },
  getIssuer() { return 'https://...'; }
};
```
