import fs from 'node:fs';
import path from 'node:path';

import type { CodingSection } from '../../types/passport.js';
import type { AnalyzerOptions, GitAnalysisResult } from './types.js';

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  '.ai-passport',
  '__pycache__',
  '.venv',
  'venv',
]);

const EXTENSION_LANGUAGES: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.py': 'Python',
  '.rs': 'Rust',
  '.go': 'Go',
  '.java': 'Java',
  '.kt': 'Kotlin',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.swift': 'Swift',
  '.vue': 'Vue',
  '.sql': 'SQL',
  '.md': 'Markdown',
};

const PACKAGE_FRAMEWORKS: Array<{ match: string; label: string }> = [
  { match: 'next', label: 'Next.js' },
  { match: 'react', label: 'React' },
  { match: 'vue', label: 'Vue' },
  { match: '@angular/core', label: 'Angular' },
  { match: 'express', label: 'Express' },
  { match: 'fastify', label: 'Fastify' },
  { match: 'hono', label: 'Hono' },
  { match: '@nestjs/core', label: 'NestJS' },
  { match: 'electron', label: 'Electron' },
];

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function collectFiles(root: string, maxFiles: number): string[] {
  const files: string[] = [];
  const queue: Array<{ dir: string; depth: number }> = [{ dir: root, depth: 0 }];

  while (queue.length > 0 && files.length < maxFiles) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current.dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (files.length >= maxFiles) {
        break;
      }

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) {
          continue;
        }
        if (current.depth < 6) {
          queue.push({ dir: path.join(current.dir, entry.name), depth: current.depth + 1 });
        }
        continue;
      }

      if (entry.isFile()) {
        files.push(path.join(current.dir, entry.name));
      }
    }
  }

  return files;
}

function detectLanguages(files: string[]): string[] {
  const counts = new Map<string, number>();

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const language = EXTENSION_LANGUAGES[ext];
    if (!language || language === 'Markdown') {
      continue;
    }
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([language]) => language);
}

function detectFrameworks(repoPath: string): string[] {
  const frameworks = new Set<string>();
  const packageJson = readJsonFile<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>(path.join(repoPath, 'package.json'));

  if (packageJson) {
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const { match, label } of PACKAGE_FRAMEWORKS) {
      if (deps[match]) {
        frameworks.add(label);
      }
    }

    if (deps.typescript) {
      frameworks.add('TypeScript');
    }
  }

  if (fs.existsSync(path.join(repoPath, 'pyproject.toml'))) {
    frameworks.add('Python');
  }
  if (fs.existsSync(path.join(repoPath, 'Cargo.toml'))) {
    frameworks.add('Rust');
  }
  if (fs.existsSync(path.join(repoPath, 'go.mod'))) {
    frameworks.add('Go');
  }

  return [...frameworks];
}

function parseEditorConfig(repoPath: string): Partial<NonNullable<CodingSection['style']>> {
  const editorPath = path.join(repoPath, '.editorconfig');
  if (!fs.existsSync(editorPath)) {
    return {};
  }

  const style: Partial<NonNullable<CodingSection['style']>> = {};
  const content = fs.readFileSync(editorPath, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('[')) {
      continue;
    }

    const [key, value] = trimmed.split('=').map((part) => part.trim());
    if (key === 'indent_size' && /^\d+$/.test(value)) {
      style.indent = Number(value);
    }
    if (key === 'end_of_line' && value === 'lf') {
      // no direct mapping
    }
  }

  return style;
}

function parsePrettier(repoPath: string): Partial<NonNullable<CodingSection['style']>> {
  const jsonCandidates = ['.prettierrc.json', '.prettierrc'];
  for (const name of jsonCandidates) {
    const filePath = path.join(repoPath, name);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const config = readJsonFile<{
      semi?: boolean;
      singleQuote?: boolean;
      tabWidth?: number;
      printWidth?: number;
      trailingComma?: string | boolean;
    }>(filePath);

    if (!config) {
      continue;
    }

    return styleFromPrettierConfig(config);
  }

  const packageJson = readJsonFile<{ prettier?: Record<string, unknown> }>(path.join(repoPath, 'package.json'));
  if (packageJson?.prettier && typeof packageJson.prettier === 'object') {
    const config = packageJson.prettier as {
      semi?: boolean;
      singleQuote?: boolean;
      tabWidth?: number;
      printWidth?: number;
      trailingComma?: string | boolean;
    };

    return styleFromPrettierConfig(config);
  }

  return {};
}

function styleFromPrettierConfig(config: {
  semi?: boolean;
  singleQuote?: boolean;
  tabWidth?: number;
  printWidth?: number;
  trailingComma?: string | boolean;
}): Partial<NonNullable<CodingSection['style']>> {
  return {
    semicolons: config.semi,
    quotes: config.singleQuote === false ? 'double' : config.singleQuote ? 'single' : undefined,
    indent: config.tabWidth,
    line_width: config.printWidth,
    trailing_comma: typeof config.trailingComma === 'string' ? config.trailingComma !== 'none' : config.trailingComma,
  };
}

function detectProjectName(repoPath: string): string {
  const packageJson = readJsonFile<{ name?: string }>(path.join(repoPath, 'package.json'));
  if (packageJson?.name) {
    return packageJson.name.replace(/^@/, '').split('/').pop() ?? packageJson.name;
  }

  return path.basename(repoPath);
}

function detectConventions(repoPath: string): string[] {
  const conventions: string[] = [];
  if (fs.existsSync(path.join(repoPath, '.editorconfig'))) {
    conventions.push('Uses .editorconfig');
  }
  if (fs.existsSync(path.join(repoPath, '.prettierrc')) || fs.existsSync(path.join(repoPath, '.prettierrc.json'))) {
    conventions.push('Uses Prettier');
  }
  if (fs.existsSync(path.join(repoPath, 'eslint.config.js')) || fs.existsSync(path.join(repoPath, '.eslintrc.json'))) {
    conventions.push('Uses ESLint');
  }
  if (fs.existsSync(path.join(repoPath, 'tsconfig.json'))) {
    conventions.push('TypeScript project');
  }
  return conventions;
}

export function analyzeRepository(options: AnalyzerOptions): GitAnalysisResult {
  const repoPath = path.resolve(options.repoPath);
  const maxFiles = options.maxFiles ?? 800;

  if (!fs.existsSync(repoPath)) {
    throw new Error(`Repository path not found: ${repoPath}`);
  }

  const files = collectFiles(repoPath, maxFiles);
  const primaryLanguages = detectLanguages(files);
  const frameworks = detectFrameworks(repoPath);
  const style = {
    ...parseEditorConfig(repoPath),
    ...parsePrettier(repoPath),
  };
  const conventions = detectConventions(repoPath);
  const now = new Date().toISOString();
  const projectName = detectProjectName(repoPath);
  const projectId = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    coding: {
      primary_languages: primaryLanguages,
      frameworks,
      style: Object.keys(style).length > 0 ? style : undefined,
      conventions,
      detected_from: {
        source: 'git',
        path: repoPath,
        analyzed_at: now,
      },
    },
    project: {
      id: projectId || 'project',
      name: projectName,
      status: 'active',
      stack: [...new Set([...primaryLanguages, ...frameworks])],
      conventions,
      repo_root: repoPath,
      updated_at: now,
    },
  };
}
