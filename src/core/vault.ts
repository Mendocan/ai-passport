import fs from 'node:fs';

import { decryptSection, encryptSection } from '../crypto/cipher.js';
import { loadMasterKey } from '../crypto/keychain.js';
import { assertValidPassport } from '../schema/validator.js';
import type {
  EncryptedPassportEnvelope,
  PassportDocument,
  PassportMeta,
} from '../types/passport.js';
import { SECTION_IDS } from '../types/passport.js';
import { Passport, iterateSections } from './passport.js';
import { ensurePassportDirs, getPassportPaths } from './paths.js';

export class Vault {
  constructor(private readonly home?: string) {}

  encrypt(passport: Passport, masterKey: Buffer): EncryptedPassportEnvelope {
    assertValidPassport(passport.document);

    const sections: EncryptedPassportEnvelope['sections'] = {};
    for (const { id, payload } of iterateSections(passport)) {
      sections[id] = encryptSection(payload, id, masterKey);
    }

    return {
      version: passport.version,
      sections,
    };
  }

  decrypt(envelope: EncryptedPassportEnvelope, masterKey: Buffer): Passport {
    let passport = Passport.fromDocument({ version: envelope.version } as PassportDocument);

    for (const sectionId of SECTION_IDS) {
      const blob = envelope.sections[sectionId];
      if (!blob) {
        throw new Error(`Missing encrypted section: ${sectionId}`);
      }

      const payload = decryptSection<unknown>(blob, sectionId, masterKey);
      passport = passport.withSection(sectionId, payload);
    }

    assertValidPassport(passport.document);
    return passport;
  }

  async readEnvelope(): Promise<EncryptedPassportEnvelope> {
    const paths = ensurePassportDirs(this.home);
    if (!fs.existsSync(paths.passport)) {
      throw new Error('Passport not found. Run `ai-passport init` first.');
    }

    return JSON.parse(fs.readFileSync(paths.passport, 'utf8')) as EncryptedPassportEnvelope;
  }

  async read(): Promise<Passport> {
    const envelope = await this.readEnvelope();
    const masterKey = await loadMasterKey(this.home);
    return this.decrypt(envelope, masterKey);
  }

  async write(passport: Passport): Promise<void> {
    const paths = ensurePassportDirs(this.home);
    const masterKey = await loadMasterKey(this.home);
    const envelope = this.encrypt(passport, masterKey);
    const meta = this.readMeta();

    meta.updated_at = new Date().toISOString();

    fs.writeFileSync(paths.passport, JSON.stringify(envelope, null, 2), 'utf8');
    fs.writeFileSync(paths.meta, JSON.stringify(meta, null, 2), 'utf8');
  }

  readMeta(): PassportMeta {
    const paths = getPassportPaths(this.home);
    if (!fs.existsSync(paths.meta)) {
      throw new Error('Passport metadata not found. Run `ai-passport init` first.');
    }

    return JSON.parse(fs.readFileSync(paths.meta, 'utf8')) as PassportMeta;
  }

  writeMeta(meta: PassportMeta): void {
    const paths = ensurePassportDirs(this.home);
    fs.writeFileSync(paths.meta, JSON.stringify(meta, null, 2), 'utf8');
  }
}

export function readPassportDocumentFromFile(filePath: string): PassportDocument {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as PassportDocument;
  assertValidPassport(raw);
  return raw;
}
