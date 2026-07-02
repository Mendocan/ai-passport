import fs from 'node:fs';

import { generateMasterKey } from '../crypto/cipher.js';
import { storeMasterKey, getKeyStorageKind } from '../crypto/keychain.js';
import { createDefaultPassport, generatePassportId } from './identity.js';
import { Passport } from './passport.js';
import { Permission, type GrantRequest, type PassportContext } from './permission.js';
import { ensurePassportDirs, getExamplePassportPath, passportExists } from './paths.js';
import { Vault, readPassportDocumentFromFile } from './vault.js';
import type { GrantEntry, PassportDocument, PassportMeta } from '../types/passport.js';
import { PASSPORT_VERSION, SECTION_IDS } from '../types/passport.js';

export interface InitOptions {
  force?: boolean;
  fromExample?: boolean;
  examplePath?: string;
}

export interface InitResult {
  passportId: string;
  home: string;
  passportPath: string;
  metaPath: string;
  keyStorage: 'os-keychain' | 'file-fallback';
  sectionCount: number;
}

export interface PassportInfo {
  passportId: string;
  version: string;
  home: string;
  created: string;
  updated: string;
  keyStorage: 'os-keychain' | 'file-fallback' | 'missing';
  providers: string[];
  permissions: number;
  sections: string[];
}

export class PassportManager {
  private readonly vault: Vault;
  private readonly permission: Permission;

  constructor(private readonly home?: string) {
    this.vault = new Vault(home);
    this.permission = new Permission(home);
  }

  exists(): boolean {
    return passportExists(this.home);
  }

  async init(options: InitOptions = {}): Promise<InitResult> {
    if (this.exists() && !options.force) {
      throw new Error('Passport already exists. Use --force to recreate it.');
    }

    const paths = ensurePassportDirs(this.home);
    const masterKey = generateMasterKey();
    await storeMasterKey(masterKey, this.home);

    let document: PassportDocument;
    if (options.fromExample) {
      const examplePath = options.examplePath ?? getExamplePassportPath();
      document = readPassportDocumentFromFile(examplePath);
    } else {
      document = createDefaultPassport();
    }

    document.version = PASSPORT_VERSION;
    const passport = Passport.fromDocument(document);
    const now = new Date().toISOString();

    const meta: PassportMeta = {
      passport_id: generatePassportId(),
      version: PASSPORT_VERSION,
      sections: [...SECTION_IDS],
      created_at: now,
      updated_at: now,
    };

    const envelope = this.vault.encrypt(passport, masterKey);

    fs.writeFileSync(paths.passport, JSON.stringify(envelope, null, 2), 'utf8');
    this.vault.writeMeta(meta);
    fs.writeFileSync(paths.grants, JSON.stringify({ grants: [] }, null, 2), 'utf8');

    if (!fs.existsSync(paths.accessLog)) {
      fs.writeFileSync(paths.accessLog, '', 'utf8');
    }

    const keyStorage = await getKeyStorageKind(this.home);

    return {
      passportId: meta.passport_id,
      home: paths.root,
      passportPath: paths.passport,
      metaPath: paths.meta,
      keyStorage: keyStorage === 'missing' ? 'file-fallback' : keyStorage,
      sectionCount: SECTION_IDS.length,
    };
  }

  async info(): Promise<PassportInfo> {
    const meta = this.vault.readMeta();
    const keyStorage = await getKeyStorageKind(this.home);
    const grants = this.permission.getActiveGrants();
    const passport = await this.vault.read();

    return {
      passportId: meta.passport_id,
      version: meta.version,
      home: ensurePassportDirs(this.home).root,
      created: meta.created_at,
      updated: meta.updated_at,
      keyStorage,
      providers: passport.document.providers.map((provider) => provider.id),
      permissions: grants.length,
      sections: meta.sections,
    };
  }

  async read(): Promise<Passport> {
    return this.vault.read();
  }

  async save(passport: Passport): Promise<void> {
    await this.vault.write(passport);
  }

  async grant(request: GrantRequest, consumerName?: string): Promise<GrantEntry> {
    const grant = this.permission.grant(request);
    let passport = await this.read();
    passport = passport.registerConsumer(request.provider, consumerName);
    await this.save(passport);
    return grant;
  }

  revoke(provider: string): number {
    return this.permission.revoke(provider);
  }

  async export(provider: string): Promise<PassportContext> {
    const grant = this.permission.getActiveGrantForProvider(provider);
    if (!grant) {
      throw new Error(`No active grant for "${provider}". Run \`ai-passport grant ${provider}\` first.`);
    }

    const passport = await this.read();
    const context = this.permission.exportContext(passport, grant);

    this.permission.appendAccessLog(provider, grant.id, grant.sections);

    const updated = passport.touchConsumerAccess(provider);
    await this.save(updated);

    return context;
  }

  async peekExport(provider: string): Promise<PassportContext> {
    const grant = this.permission.getActiveGrantForProvider(provider);
    if (!grant) {
      throw new Error(`No active grant for "${provider}". Run \`ai-passport grant ${provider}\` first.`);
    }

    const passport = await this.read();
    return this.permission.exportContext(passport, grant);
  }

  listActiveGrants(): Array<{
    id: string;
    provider: string;
    sections: string[];
    issued_at: string;
    project_filter?: string;
  }> {
    return this.permission.getActiveGrants().map((grant) => ({
      id: grant.id,
      provider: grant.provider,
      sections: grant.sections,
      issued_at: grant.issued_at,
      project_filter: grant.project_filter,
    }));
  }
}
