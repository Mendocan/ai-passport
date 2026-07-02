import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { GrantRequest } from '../core/permission.js';
import type { SectionId } from '../types/passport.js';

export interface GrantTemplate {
  name: string;
  sections: SectionId[];
  project_filter?: GrantRequest['project_filter'];
  fields?: GrantRequest['fields'];
}

function getConfigRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
}

export function loadGrantTemplate(consumerId: string): GrantTemplate | undefined {
  const templatePath = path.join(getConfigRoot(), 'config', 'grant-templates.json');
  if (!fs.existsSync(templatePath)) {
    return undefined;
  }

  const templates = JSON.parse(fs.readFileSync(templatePath, 'utf8')) as Record<string, GrantTemplate>;
  return templates[consumerId];
}

export function buildGrantRequest(
  consumerId: string,
  sections?: SectionId[],
): { request: GrantRequest; consumerName?: string } {
  const template = loadGrantTemplate(consumerId);

  if (!sections && !template) {
    throw new Error(
      `No grant template for "${consumerId}". Pass --sections identity,coding,projects`,
    );
  }

  return {
    request: {
      provider: consumerId,
      sections: sections ?? template!.sections,
      project_filter: template?.project_filter,
      fields: template?.fields,
    },
    consumerName: template?.name,
  };
}
