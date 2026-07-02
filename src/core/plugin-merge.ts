import type { CodingSection, PassportDocument, ProjectEntry } from '../types/passport.js';
import type { GitAnalysisResult } from '../plugins/git/types.js';

function isManualCoding(coding: CodingSection): boolean {
  return coding.detected_from?.source === 'manual';
}

function mergeCodingSection(
  existing: CodingSection,
  detected: Partial<CodingSection>,
  force: boolean,
): CodingSection {
  if (isManualCoding(existing) && !force) {
    return {
      ...existing,
      primary_languages: existing.primary_languages?.length ? existing.primary_languages : detected.primary_languages,
      frameworks: existing.frameworks?.length ? existing.frameworks : detected.frameworks,
      conventions: existing.conventions?.length ? existing.conventions : detected.conventions,
      style: existing.style ?? detected.style,
      detected_from: existing.detected_from,
    };
  }

  return {
    ...existing,
    ...detected,
    style: {
      ...existing.style,
      ...detected.style,
    },
    ai_preferences: existing.ai_preferences,
    conventions: detected.conventions ?? existing.conventions,
  };
}

function upsertProject(projects: ProjectEntry[], detected: Partial<ProjectEntry>): ProjectEntry[] {
  const repoRoot = detected.repo_root;
  const existingIndex = projects.findIndex((project) => project.repo_root === repoRoot);

  if (existingIndex === -1) {
    return [
      ...projects,
      {
        name: detected.name ?? 'Project',
        ...detected,
      } as ProjectEntry,
    ];
  }

  const next = [...projects];
  next[existingIndex] = {
    ...next[existingIndex],
    ...detected,
    name: detected.name ?? next[existingIndex].name,
  };
  return next;
}

export function mergeGitAnalysis(
  document: PassportDocument,
  analysis: GitAnalysisResult,
  force = false,
): PassportDocument {
  return {
    ...document,
    coding: mergeCodingSection(document.coding, analysis.coding, force),
    projects: upsertProject(document.projects, analysis.project),
  };
}
