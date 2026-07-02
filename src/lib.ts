export { PASSPORT_VERSION, SECTION_IDS } from './types/passport.js';
export type {
  PassportDocument,
  SectionId,
  EncryptedPassportEnvelope,
  PassportMeta,
  GrantEntry,
} from './types/passport.js';

export { Passport } from './core/passport.js';
export { Vault } from './core/vault.js';
export { Permission, type PassportContext, type GrantRequest, GRANTABLE_SECTIONS } from './core/permission.js';
export { PassportManager } from './core/passport-manager.js';
export { AiPassport, type LoadOptions, type GrantSummary } from './sdk/passport-client.js';
export { createDefaultPassport, createDefaultIdentity, generatePassportId } from './core/identity.js';
export { startCursorMcpServer } from './integrations/cursor/mcp-server.js';

export { getPassportHome, getPassportPaths, passportExists } from './core/paths.js';
export { generateMasterKey, encryptSection, decryptSection } from './crypto/cipher.js';
export { hasMasterKey, loadMasterKey, storeMasterKey, getKeyStorageKind } from './crypto/keychain.js';
export { validatePassport, assertValidPassport } from './schema/validator.js';
