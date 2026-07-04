import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const repoSchemas = path.resolve(packageRoot, '../../schemas');
const target = path.join(packageRoot, 'schemas');

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(repoSchemas, target, { recursive: true });
