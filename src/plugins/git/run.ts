import path from 'node:path';

import { mergeGitAnalysis } from '../../core/plugin-merge.js';
import { Passport } from '../../core/passport.js';
import { PassportManager } from '../../core/passport-manager.js';
import { analyzeRepository } from './analyzer.js';

export interface RunGitPluginOptions {
  home?: string;
  repoPath?: string;
  force?: boolean;
}

export interface RunGitPluginResult {
  repoPath: string;
  languages: string[];
  frameworks: string[];
  projectName: string;
}

export async function runGitPlugin(options: RunGitPluginOptions = {}): Promise<RunGitPluginResult> {
  const manager = new PassportManager(options.home);

  if (!manager.exists()) {
    throw new Error('Passport not found. Run `ai-passport init` first.');
  }

  const repoPath = path.resolve(options.repoPath ?? process.cwd());
  const analysis = analyzeRepository({ repoPath });
  const passport = await manager.read();
  const merged = mergeGitAnalysis(passport.document, analysis, options.force ?? false);

  await manager.save(Passport.fromDocument(merged));

  return {
    repoPath,
    languages: analysis.coding.primary_languages ?? [],
    frameworks: analysis.coding.frameworks ?? [],
    projectName: analysis.project.name ?? path.basename(repoPath),
  };
}
