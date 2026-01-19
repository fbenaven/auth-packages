import { TokenResponse } from '../types.js';

export interface IdPAdapter {
  name: string;
  login(email: string, password: string): Promise<TokenResponse>;
  logout(accessToken: string): Promise<void>;
  getJwksUrl(): string;
  getIssuer(): string;
}
