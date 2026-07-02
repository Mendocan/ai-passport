import type { GrantEntry, PassportDocument, SectionId } from '../types/passport.js';
import { Passport } from '../core/passport.js';
import {
  PassportManager,
  type InitOptions,
  type InitResult,
  type PassportInfo,
} from '../core/passport-manager.js';
import type { GrantRequest, PassportContext } from '../core/permission.js';

export interface LoadOptions {
  home?: string;
}

export interface GrantSummary {
  id: string;
  provider: string;
  sections: string[];
  issued_at: string;
  project_filter?: string;
}

/**
 * High-level SDK for AI Passport.
 * Use `AiPassport.load()` — or import as `Passport` from `@ai-passport-core/cli/sdk`.
 */
export class AiPassport {
  private constructor(private readonly manager: PassportManager) {}

  static async load(options: LoadOptions = {}): Promise<AiPassport> {
    const manager = new PassportManager(options.home);
    if (!manager.exists()) {
      throw new Error('Passport not found. Run `ai-passport init` first.');
    }
    return new AiPassport(manager);
  }

  static async create(options: InitOptions & LoadOptions = {}): Promise<InitResult> {
    const manager = new PassportManager(options.home);
    return manager.init(options);
  }

  static exists(home?: string): boolean {
    return new PassportManager(home).exists();
  }

  async info(): Promise<PassportInfo> {
    return this.manager.info();
  }

  async read(): Promise<PassportDocument> {
    const passport = await this.manager.read();
    return passport.document;
  }

  async readPassport(): Promise<Passport> {
    return this.manager.read();
  }

  getSection(sectionId: SectionId): Promise<unknown> {
    return this.read().then((document) => {
      switch (sectionId) {
        case 'identity':
          return document.identity;
        case 'preferences':
          return document.preferences;
        case 'coding':
          return document.coding;
        case 'projects':
          return document.projects;
        case 'permissions':
          return document.permissions;
        case 'providers':
          return document.providers;
        default:
          throw new Error(`Unknown section: ${sectionId satisfies never}`);
      }
    });
  }

  async save(document: PassportDocument): Promise<void> {
    await this.manager.save(Passport.fromDocument(document));
  }

  async grant(request: GrantRequest, consumerName?: string): Promise<GrantEntry> {
    return this.manager.grant(request, consumerName);
  }

  revoke(consumer: string): number {
    return this.manager.revoke(consumer);
  }

  async export(consumer: string): Promise<PassportContext> {
    return this.manager.export(consumer);
  }

  async peek(consumer: string): Promise<PassportContext> {
    return this.manager.peekExport(consumer);
  }

  listGrants(): GrantSummary[] {
    return this.manager.listActiveGrants();
  }
}
