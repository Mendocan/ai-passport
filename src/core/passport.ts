import type { PassportDocument, SectionId } from '../types/passport.js';
import { SECTION_IDS } from '../types/passport.js';

export class Passport {
  constructor(public readonly document: PassportDocument) {}

  static fromDocument(document: PassportDocument): Passport {
    return new Passport(document);
  }

  get version(): string {
    return this.document.version;
  }

  getSection(sectionId: SectionId): unknown {
    switch (sectionId) {
      case 'identity':
        return this.document.identity;
      case 'preferences':
        return this.document.preferences;
      case 'coding':
        return this.document.coding;
      case 'projects':
        return this.document.projects;
      case 'permissions':
        return this.document.permissions;
      case 'providers':
        return this.document.providers;
      default:
        throw new Error(`Unknown section: ${sectionId satisfies never}`);
    }
  }

  withSection(sectionId: SectionId, value: unknown): Passport {
    const next = { ...this.document };

    switch (sectionId) {
      case 'identity':
        next.identity = value as PassportDocument['identity'];
        break;
      case 'preferences':
        next.preferences = value as PassportDocument['preferences'];
        break;
      case 'coding':
        next.coding = value as PassportDocument['coding'];
        break;
      case 'projects':
        next.projects = value as PassportDocument['projects'];
        break;
      case 'permissions':
        next.permissions = value as PassportDocument['permissions'];
        break;
      case 'providers':
        next.providers = value as PassportDocument['providers'];
        break;
      default:
        throw new Error(`Unknown section: ${sectionId satisfies never}`);
    }

    return new Passport(next);
  }

  registerConsumer(consumerId: string, consumerName?: string): Passport {
    const now = new Date().toISOString();
    const existing = this.document.providers.find((provider) => provider.id === consumerId);

    if (existing) {
      return this;
    }

    return new Passport({
      ...this.document,
      providers: [
        ...this.document.providers,
        {
          id: consumerId,
          name: consumerName ?? consumerId,
          registered_at: now,
        },
      ],
      permissions: {
        ...this.document.permissions,
        last_reviewed_at: now,
      },
    });
  }

  touchConsumerAccess(consumerId: string): Passport {
    const now = new Date().toISOString();

    return new Passport({
      ...this.document,
      providers: this.document.providers.map((provider) =>
        provider.id === consumerId ? { ...provider, last_access_at: now } : provider,
      ),
    });
  }

  toJSON(): PassportDocument {
    return this.document;
  }
}

export function iterateSections(passport: Passport): Array<{ id: SectionId; payload: unknown }> {
  return SECTION_IDS.map((id) => ({ id, payload: passport.getSection(id) }));
}
