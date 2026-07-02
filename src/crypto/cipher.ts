import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

import type { EncryptedSectionBlob, SectionId } from '../types/passport.js';

const MASTER_KEY_BYTES = 32;
const SECTION_KEY_BYTES = 32;
const NONCE_BYTES = 12;
const ALGORITHM = 'aes-256-gcm' as const;

export function generateMasterKey(): Buffer {
  return randomBytes(MASTER_KEY_BYTES);
}

export function deriveSectionKey(masterKey: Buffer, sectionId: SectionId): Buffer {
  return Buffer.from(
    hkdfSync(
      'sha256',
      masterKey,
      Buffer.from(sectionId, 'utf8'),
      Buffer.from('ai-passport-section', 'utf8'),
      SECTION_KEY_BYTES,
    ),
  );
}

export function encryptSection(
  payload: unknown,
  sectionId: SectionId,
  masterKey: Buffer,
): EncryptedSectionBlob {
  const sectionKey = deriveSectionKey(masterKey, sectionId);
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv(ALGORITHM, sectionKey, nonce);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: Buffer.concat([ciphertext, authTag]).toString('base64'),
    nonce: nonce.toString('base64'),
    alg: 'AES-256-GCM',
    updated_at: new Date().toISOString(),
  };
}

export function decryptSection<T>(
  blob: EncryptedSectionBlob,
  sectionId: SectionId,
  masterKey: Buffer,
): T {
  if (blob.alg !== 'AES-256-GCM') {
    throw new Error(`Unsupported encryption algorithm: ${blob.alg}`);
  }

  const sectionKey = deriveSectionKey(masterKey, sectionId);
  const nonce = Buffer.from(blob.nonce, 'base64');
  const combined = Buffer.from(blob.ciphertext, 'base64');
  const authTag = combined.subarray(combined.length - 16);
  const ciphertext = combined.subarray(0, combined.length - 16);
  const decipher = createDecipheriv(ALGORITHM, sectionKey, nonce);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return JSON.parse(plaintext.toString('utf8')) as T;
}
