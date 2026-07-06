import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** npm package version (@ai-passport-core/cli). */
export const CLI_VERSION: string = require('../../package.json').version;
