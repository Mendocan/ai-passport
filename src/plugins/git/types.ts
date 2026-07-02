import type { CodingSection, ProjectEntry } from '../../types/passport.js';

export interface GitAnalysisResult {
  coding: Partial<CodingSection>;
  project: Partial<ProjectEntry>;
}

export interface AnalyzerOptions {
  repoPath: string;
  maxFiles?: number;
}
