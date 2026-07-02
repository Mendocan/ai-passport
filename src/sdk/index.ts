export { AiPassport, type LoadOptions, type GrantSummary } from './passport-client.js';

/** SDK entry point — `import { Passport } from '@ai-passport-core/cli/sdk'` */
export { AiPassport as Passport } from './passport-client.js';

export type { PassportInfo, InitOptions, InitResult } from '../core/passport-manager.js';
export type { GrantRequest, PassportContext } from '../core/permission.js';
export type { PassportDocument, SectionId, GrantEntry } from '../types/passport.js';
