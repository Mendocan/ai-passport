import crypto from 'node:crypto';
import fs from 'node:fs';

import type { PassportContext } from './permission.js';
import { ensurePassportDirs, getPassportPaths } from './paths.js';

export const TOKEN_PREFIX = 'aip_tok_';
export const DEFAULT_TOKEN_TTL_SECONDS = 3600;

export interface AuthTokenRecord {
  id: string;
  client_id: string;
  grant_id: string;
  passport_id: string;
  context: PassportContext;
  issued_at: string;
  expires_at: string;
  one_time: boolean;
  used_at: string | null;
}

export interface AuthTokensFile {
  tokens: AuthTokenRecord[];
}

export interface IssueTokenOptions {
  ttlSeconds?: number;
  oneTime?: boolean;
}

export interface TokenSummary {
  id: string;
  client_id: string;
  grant_id: string;
  passport_id: string;
  issued_at: string;
  expires_at: string;
  one_time: boolean;
  used_at: string | null;
  expired: boolean;
  usable: boolean;
  sections: string[];
}

export class AuthTokenStore {
  constructor(private readonly home?: string) {}

  private loadFile(): AuthTokensFile {
    const paths = getPassportPaths(this.home);
    if (!fs.existsSync(paths.tokens)) {
      return { tokens: [] };
    }

    return JSON.parse(fs.readFileSync(paths.tokens, 'utf8')) as AuthTokensFile;
  }

  private saveFile(file: AuthTokensFile): void {
    const paths = ensurePassportDirs(this.home);
    this.purgeExpired(file);
    fs.writeFileSync(paths.tokens, JSON.stringify(file, null, 2), 'utf8');
  }

  private purgeExpired(file: AuthTokensFile): void {
    const now = Date.now();
    file.tokens = file.tokens.filter((token) => new Date(token.expires_at).getTime() > now);
  }

  issueToken(
    clientId: string,
    grantId: string,
    passportId: string,
    context: PassportContext,
    options: IssueTokenOptions = {},
  ): AuthTokenRecord {
    const ttlSeconds = options.ttlSeconds ?? DEFAULT_TOKEN_TTL_SECONDS;
    const oneTime = options.oneTime ?? true;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    const record: AuthTokenRecord = {
      id: `${TOKEN_PREFIX}${crypto.randomBytes(24).toString('base64url')}`,
      client_id: clientId,
      grant_id: grantId,
      passport_id: passportId,
      context,
      issued_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      one_time: oneTime,
      used_at: null,
    };

    const file = this.loadFile();
    this.purgeExpired(file);
    file.tokens.push(record);
    this.saveFile(file);

    return record;
  }

  findToken(tokenId: string): AuthTokenRecord | undefined {
    const file = this.loadFile();
    this.purgeExpired(file);
    this.saveFile(file);
    return file.tokens.find((token) => token.id === tokenId);
  }

  inspectToken(tokenId: string): TokenSummary {
    const token = this.findToken(tokenId);
    if (!token) {
      throw new Error('Token not found or expired.');
    }

    return toSummary(token);
  }

  exchangeToken(tokenId: string): PassportContext {
    const file = this.loadFile();
    this.purgeExpired(file);

    const index = file.tokens.findIndex((token) => token.id === tokenId);
    if (index === -1) {
      throw new Error('Token not found or expired.');
    }

    const token = file.tokens[index]!;

    if (token.used_at) {
      throw new Error('Token already used.');
    }

    if (new Date(token.expires_at) <= new Date()) {
      throw new Error('Token expired.');
    }

    if (token.one_time) {
      token.used_at = new Date().toISOString();
    }

    this.saveFile(file);
    return token.context;
  }

  revokeTokensForClient(clientId: string): number {
    const file = this.loadFile();
    const before = file.tokens.length;
    file.tokens = file.tokens.filter((token) => token.client_id !== clientId);
    const removed = before - file.tokens.length;
    this.saveFile(file);
    return removed;
  }
}

function toSummary(token: AuthTokenRecord): TokenSummary {
  const expired = new Date(token.expires_at) <= new Date();
  const usable = !expired && !token.used_at;

  return {
    id: token.id,
    client_id: token.client_id,
    grant_id: token.grant_id,
    passport_id: token.passport_id,
    issued_at: token.issued_at,
    expires_at: token.expires_at,
    one_time: token.one_time,
    used_at: token.used_at,
    expired,
    usable,
    sections: inferSections(token.context),
  };
}

function inferSections(context: PassportContext): string[] {
  const sections: string[] = [];
  if (context.identity) sections.push('identity');
  if (context.preferences) sections.push('preferences');
  if (context.coding) sections.push('coding');
  if (context.projects) sections.push('projects');
  return sections;
}

export function isLocalCallbackUrl(callbackUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(callbackUrl);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

export async function deliverTokenToCallback(callbackUrl: string, token: string): Promise<void> {
  if (!isLocalCallbackUrl(callbackUrl)) {
    throw new Error('Callback URL must use http(s)://localhost or http(s)://127.0.0.1');
  }

  const url = new URL(callbackUrl);
  url.searchParams.set('token', token);

  const response = await fetch(url.toString(), { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Callback failed with status ${response.status}`);
  }
}
