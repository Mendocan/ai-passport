import fs from 'node:fs';
import { createRequire } from 'node:module';

import { getSchemaPath } from '../core/paths.js';
import type { PassportDocument } from '../types/passport.js';
import type { ErrorObject, ValidateFunction } from 'ajv';

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ajv2020 = require('ajv/dist/2020') as new (opts?: object) => { compile: (schema: object) => ValidateFunction };
const addFormats = require('ajv-formats') as (ajv: object) => void;

let validator: ValidateFunction | undefined;

function getValidator(): ValidateFunction {
  if (validator) {
    return validator;
  }

  const schema = JSON.parse(fs.readFileSync(getSchemaPath(), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const compiled = ajv.compile(schema);
  validator = compiled;
  return compiled;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassport(document: PassportDocument): ValidationResult {
  const validate = getValidator();
  const valid = validate(document) === true;

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors ?? []).map((error: ErrorObject) => {
    const path = error.instancePath || '/';
    return `${path}: ${error.message ?? 'invalid value'}`;
  });

  return { valid: false, errors };
}

export function assertValidPassport(document: PassportDocument): void {
  const result = validatePassport(document);
  if (!result.valid) {
    throw new Error(`Invalid passport document:\n${result.errors.map((e) => `  - ${e}`).join('\n')}`);
  }
}
