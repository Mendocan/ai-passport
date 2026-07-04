export { AiPassport, type LoadOptions, type GrantSummary } from './passport-client.js';

/** SDK entry point — `import { Passport } from '@ai-passport-core/cli/sdk'` */
export { AiPassport as Passport } from './passport-client.js';

export type { PassportInfo, InitOptions, InitResult, AuthorizeOptions, AuthorizeResult } from '../core/passport-manager.js';
export type { GrantRequest, PassportContext } from '../core/permission.js';
export type { TokenSummary } from '../core/auth-token.js';
export type { PassportDocument, SectionId, GrantEntry } from '../types/passport.js';
