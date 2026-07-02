import fs from 'node:fs';

import type { Passport } from './passport.js';
import { ensurePassportDirs, getPassportPaths } from './paths.js';
import type {
  CodingSection,
  GrantEntry,
  GrantsFile,
  IdentitySection,
  PreferencesSection,
  ProjectEntry,
  SectionId,
} from '../types/passport.js';

export interface PassportContext {
  passport_version: string;
  exported_at: string;
  provider: string;
  grant_id: string;
  identity?: Partial<IdentitySection>;
  preferences?: Partial<PreferencesSection>;
  coding?: CodingSection;
  projects?: Array<Partial<ProjectEntry>>;
}

export interface GrantRequest {
  provider: string;
  sections: SectionId[];
  project_filter?: GrantEntry['project_filter'];
  fields?: Partial<Record<SectionId, string[]>>;
}

export const GRANTABLE_SECTIONS: SectionId[] = ['identity', 'preferences', 'coding', 'projects'];

export class Permission {
  constructor(private readonly home?: string) {}

  private loadGrantsFile(): GrantsFile {
    const paths = getPassportPaths(this.home);
    if (!fs.existsSync(paths.grants)) {
      return { grants: [] };
    }

    return JSON.parse(fs.readFileSync(paths.grants, 'utf8')) as GrantsFile;
  }

  private saveGrantsFile(grantsFile: GrantsFile): void {
    const paths = ensurePassportDirs(this.home);
    fs.writeFileSync(paths.grants, JSON.stringify(grantsFile, null, 2), 'utf8');
  }

  isActive(grant: GrantEntry, now = new Date()): boolean {
    if (grant.revoked) {
      return false;
    }

    if (grant.expires_at) {
      return new Date(grant.expires_at) > now;
    }

    return true;
  }

  getActiveGrants(): GrantEntry[] {
    return this.loadGrantsFile().grants.filter((grant) => this.isActive(grant));
  }

  getActiveGrantForProvider(provider: string): GrantEntry | undefined {
    return this.getActiveGrants().find((grant) => grant.provider === provider);
  }

  grant(request: GrantRequest): GrantEntry {
    const invalid = request.sections.filter((section) => !GRANTABLE_SECTIONS.includes(section));
    if (invalid.length > 0) {
      throw new Error(`Cannot grant internal sections: ${invalid.join(', ')}`);
    }

    const grantsFile = this.loadGrantsFile();

    for (const grant of grantsFile.grants) {
      if (grant.provider === request.provider && this.isActive(grant)) {
        grant.revoked = true;
      }
    }

    const grant: GrantEntry = {
      id: `grant_${request.provider}_${Date.now().toString(36)}`,
      provider: request.provider,
      sections: request.sections,
      project_filter: request.project_filter ?? 'active_only',
      fields: request.fields,
      issued_at: new Date().toISOString(),
      expires_at: null,
      revoked: false,
    };

    grantsFile.grants.push(grant);
    this.saveGrantsFile(grantsFile);
    return grant;
  }

  revoke(provider: string): number {
    const grantsFile = this.loadGrantsFile();
    let revokedCount = 0;

    for (const grant of grantsFile.grants) {
      if (grant.provider === provider && this.isActive(grant)) {
        grant.revoked = true;
        revokedCount += 1;
      }
    }

    if (revokedCount === 0) {
      throw new Error(`No active grant found for provider "${provider}".`);
    }

    this.saveGrantsFile(grantsFile);
    return revokedCount;
  }

  exportContext(passport: Passport, grant: GrantEntry): PassportContext {
    if (!this.isActive(grant)) {
      throw new Error(`Grant "${grant.id}" is not active.`);
    }

    const document = passport.document;
    const context: PassportContext = {
      passport_version: document.version,
      exported_at: new Date().toISOString(),
      provider: grant.provider,
      grant_id: grant.id,
    };

    for (const section of grant.sections) {
      switch (section) {
        case 'identity':
          context.identity = pickFields(document.identity, grant.fields?.identity);
          break;
        case 'preferences':
          context.preferences = pickFields(document.preferences, grant.fields?.preferences);
          break;
        case 'coding':
          context.coding = pickFields(document.coding, grant.fields?.coding) as CodingSection;
          break;
        case 'projects':
          context.projects = filterProjects(document.projects, grant);
          break;
        default:
          break;
      }
    }

    return context;
  }

  appendAccessLog(provider: string, grantId: string, sections: SectionId[]): void {
    const paths = ensurePassportDirs(this.home);
    const entry = {
      ts: new Date().toISOString(),
      provider,
      grant_id: grantId,
      sections,
    };
    fs.appendFileSync(paths.accessLog, `${JSON.stringify(entry)}\n`, 'utf8');
  }
}

function pickFields<T extends object>(value: T, fields?: string[]): Partial<T> {
  if (!fields || fields.length === 0) {
    return value;
  }

  const picked: Partial<T> = {};
  for (const field of fields) {
    if (field in value) {
      picked[field as keyof T] = value[field as keyof T];
    }
  }
  return picked;
}

function filterProjects(
  projects: ProjectEntry[],
  grant: GrantEntry,
): Array<Partial<ProjectEntry>> {
  const filtered =
    grant.project_filter === 'active_only'
      ? projects.filter((project) => (project.status ?? 'active') === 'active')
      : projects;

  const fieldList = grant.fields?.projects;
  return filtered.map((project) => pickFields(project, fieldList));
}

export function parseSectionList(value: string): SectionId[] {
  const sections = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const section of sections) {
    if (!GRANTABLE_SECTIONS.includes(section as SectionId)) {
      throw new Error(
        `Invalid section "${section}". Grantable sections: ${GRANTABLE_SECTIONS.join(', ')}`,
      );
    }
  }

  return sections as SectionId[];
}
