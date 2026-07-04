import type { EncryptedPassportEnvelope, GrantsFile, PassportMeta } from '../../types/passport.js';

export const SYNC_BUNDLE_FORMAT = 'ai-passport-sync-v1' as const;

export interface SyncBundle {
  format: typeof SYNC_BUNDLE_FORMAT;
  passport_id: string;
  updated_at: string;
  passport: EncryptedPassportEnvelope;
  meta: PassportMeta;
  grants?: GrantsFile;
}

export interface SyncConfig {
  provider: 'file';
  target: string;
}

export interface SyncPushResult {
  passport_id: string;
  updated_at: string;
  target: string;
}

export interface SyncPullResult {
  passport_id: string;
  updated_at: string;
  target: string;
  applied: boolean;
}

export interface SyncStatusResult {
  passport_id?: string;
  local_updated_at?: string;
  remote_updated_at?: string;
  in_sync: boolean;
  target: string;
}

export interface SyncStore {
  push(bundle: SyncBundle): Promise<{ updated_at: string }>;
  pull(): Promise<SyncBundle | null>;
  remoteUpdatedAt(): Promise<string | null>;
}
