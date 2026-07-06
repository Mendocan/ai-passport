import type { MemoryRecord } from './types.js';

/** Days until effective confidence halves without re-verification. */
export const CONFIDENCE_HALF_LIFE_DAYS = 90;

const MS_PER_DAY = 86_400_000;

/**
 * Effective confidence after time decay from last verification (or update).
 * RFC 0007 phase D — confidence metadata.
 */
export function effectiveConfidence(record: MemoryRecord, now = Date.now()): number {
  const base = record.confidence ?? 0.5;
  const anchor = record.verified_at ?? record.updated_at;
  const days = Math.max(0, (now - new Date(anchor).getTime()) / MS_PER_DAY);
  const decay = 0.5 ** (days / CONFIDENCE_HALF_LIFE_DAYS);
  return Math.round(base * decay * 1000) / 1000;
}

export function withEffectiveConfidence<T extends MemoryRecord>(
  record: T,
  now = Date.now(),
): T & { effective_confidence: number } {
  return { ...record, effective_confidence: effectiveConfidence(record, now) };
}
