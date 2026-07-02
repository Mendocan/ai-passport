import { randomUUID } from 'node:crypto';

import type { IdentitySection, PassportDocument } from '../types/passport.js';
import { PASSPORT_VERSION } from '../types/passport.js';

export function generatePassportId(): string {
  return `aip_${randomUUID()}`;
}

export function createDefaultIdentity(overrides: Partial<IdentitySection> = {}): IdentitySection {
  return {
    display_name: 'Developer',
    role: 'Software Engineer',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: 'en',
    ...overrides,
  };
}

export function createDefaultPassport(overrides: Partial<PassportDocument> = {}): PassportDocument {
  const now = new Date().toISOString();

  return {
    version: PASSPORT_VERSION,
    identity: createDefaultIdentity(overrides.identity),
    preferences: {
      language: 'en',
      communication_style: 'balanced',
      verbosity: 'medium',
      explain_before_code: true,
      prefer_examples: true,
      ...overrides.preferences,
    },
    coding: {
      primary_languages: [],
      frameworks: [],
      style: {
        indent: 2,
        quotes: 'single',
        semicolons: true,
        line_width: 100,
        trailing_comma: true,
      },
      conventions: [],
      ai_preferences: {
        explain_before_code: true,
        prefer_minimal_diffs: true,
        avoid_unrequested_refactors: true,
        match_existing_patterns: true,
        write_tests_when_requested: false,
      },
      detected_from: {
        source: 'manual',
        analyzed_at: now,
      },
      ...overrides.coding,
    },
    projects: overrides.projects ?? [],
    permissions: {
      default_policy: 'deny_all',
      last_reviewed_at: now,
      ...overrides.permissions,
    },
    providers: overrides.providers ?? [],
  };
}
