import { IdPAdapter } from './types.js';
import { TokenResponse } from '../types.js';

export interface SupabaseAdapterConfig {
  url: string;
  apiKey: string;
}

export function createSupabaseAdapter(config: SupabaseAdapterConfig): IdPAdapter {
  const authUrl = `${config.url.replace(/\/$/, '')}/auth/v1`;

  return {
    name: 'supabase',

    async login(email, password): Promise<TokenResponse> {
      const response = await fetch(`${authUrl}/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.apiKey,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || error.msg || 'Login failed');
      }

      return await response.json();
    },

    async logout(accessToken: string): Promise<void> {
      await fetch(`${authUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': config.apiKey,
        },
      });
    },

    getJwksUrl(): string {
      return `${authUrl}/.well-known/jwks.json`;
    },

    getIssuer(): string {
      return authUrl;
    }
  };
}
