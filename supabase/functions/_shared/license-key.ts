/**
 * License key generation for Brokz products.
 *
 * Format: `BRKZ-XXXX-XXXX-XXXX-XXXX-XXXX` (20 chars + prefix, 5 groups).
 * Alphabet deliberately excludes the easily-confused characters 0/O/I/1.
 *
 * Uses `crypto.getRandomValues` (CSPRNG) available on the Deno Edge
 * runtime. Do NOT use Math.random here — keys are revenue-linked secrets.
 *
 * DB uniqueness is enforced by `licenses.license_key UNIQUE`; the
 * generator should NEVER be trusted as sole source of uniqueness.
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateLicenseKey(): string {
  const buf = crypto.getRandomValues(new Uint8Array(20));
  const chars = Array.from(buf, (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `BRKZ-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}-${chars.slice(12, 16)}-${chars.slice(16, 20)}`;
}

/**
 * Redact a license key for logging/UI display: keep only the prefix and
 * last group. e.g. `BRKZ-****-****-****-****-ABCD`.
 */
export function maskLicenseKey(key: string): string {
  const parts = key.split('-');
  if (parts.length !== 6) return 'BRKZ-****-****-****-****-****';
  const [prefix, , , , , tail] = parts;
  return `${prefix}-****-****-****-****-${tail}`;
}
