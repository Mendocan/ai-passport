export const PASSPORT_VERSION = '1.0.0';

export const SECTION_IDS = [
  'identity',
  'preferences',
  'coding',
  'projects',
  'permissions',
  'providers',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface IdentitySection {
  display_name?: string;
  role?: string;
  timezone?: string;
  locale?: string;
  bio?: string;
}

export interface PreferencesSection {
  language?: string;
  communication_style?: 'concise' | 'balanced' | 'detailed';
  verbosity?: 'low' | 'medium' | 'high';
  explain_before_code?: boolean;
  prefer_examples?: boolean;
}

export interface CodingSection {
  primary_languages?: string[];
  frameworks?: string[];
  style?: {
    indent?: number;
    quotes?: 'single' | 'double';
    semicolons?: boolean;
    line_width?: number;
    trailing_comma?: boolean;
  };
  conventions?: string[];
  ai_preferences?: {
    explain_before_code?: boolean;
    prefer_minimal_diffs?: boolean;
    avoid_unrequested_refactors?: boolean;
    match_existing_patterns?: boolean;
    write_tests_when_requested?: boolean;
  };
  detected_from?: {
    source?: 'manual' | 'git' | 'github' | 'plugin';
    path?: string;
    analyzed_at?: string;
  };
}

export interface ProjectEntry {
  id?: string;
  name: string;
  description?: string;
  status?: 'active' | 'paused' | 'archived';
  stack?: string[];
  conventions?: string[];
  repo_root?: string;
  repo_remote?: string;
  started_at?: string;
  updated_at?: string;
}

export interface PermissionsMetaSection {
  default_policy?: 'deny_all';
  last_reviewed_at?: string;
}

export interface ProviderEntry {
  id: string;
  name: string;
  registered_at?: string;
  last_access_at?: string;
}

export interface PassportDocument {
  version: string;
  identity: IdentitySection;
  preferences: PreferencesSection;
  coding: CodingSection;
  projects: ProjectEntry[];
  permissions: PermissionsMetaSection;
  providers: ProviderEntry[];
}

export interface EncryptedSectionBlob {
  ciphertext: string;
  nonce: string;
  alg: 'AES-256-GCM';
  updated_at: string;
}

export interface EncryptedPassportEnvelope {
  version: string;
  sections: Partial<Record<SectionId, EncryptedSectionBlob>>;
}

export interface PassportMeta {
  passport_id: string;
  version: string;
  sections: SectionId[];
  created_at: string;
  updated_at: string;
}

export interface GrantsFile {
  grants: GrantEntry[];
}

export interface GrantEntry {
  id: string;
  provider: string;
  sections: SectionId[];
  project_filter?: 'active_only' | 'all';
  fields?: Partial<Record<SectionId, string[]>>;
  issued_at: string;
  expires_at: string | null;
  revoked: boolean;
}

export type SectionPayload =
  | IdentitySection
  | PreferencesSection
  | CodingSection
  | ProjectEntry[]
  | PermissionsMetaSection
  | ProviderEntry[];
