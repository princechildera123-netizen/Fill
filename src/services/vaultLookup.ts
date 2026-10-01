/**
 * Dynamic Vault Lookup Service
 * Resolves canonical field keys to dynamic user values in the active Vault.
 * Enforces Section 9: Memory never stores values; values are always retrieved fresh from the Vault.
 */

import { VaultData } from '../types/fill';
import { getVaultValueByKey, VAULT_FIELD_DEFINITIONS } from './vaultSchema';

// Alias mapping between conceptual keys and actual vault structure
const CANONICAL_VAULT_ALIASES: Record<string, string> = {
  'education.program': 'education.course',
  'education.programme': 'education.course',
  'education.graduationYear': 'education.gradYear',
  'identity.dateOfBirth': 'identity.dob',
  'identity.birthDate': 'identity.dob',
  'identity.legalName': 'identity.fullName',
};

/**
 * Normalizes any canonical field key into the exact VaultData storage path
 */
export function resolveVaultKey(key: string | null): string | null {
  if (!key) return null;
  return CANONICAL_VAULT_ALIASES[key] || key;
}

/**
 * Retrieves the current, live value from the active Vault for any canonical or schema key
 */
export function lookupVaultValue(vault: VaultData, key: string | null): string {
  if (!key) return '';
  const resolvedKey = resolveVaultKey(key);
  return getVaultValueByKey(vault, resolvedKey);
}

/**
 * Retrieves user-friendly display metadata for any vault or canonical key
 */
export function lookupFieldTitle(key: string | null): string {
  if (!key) return 'Unassigned Field';
  const resolvedKey = resolveVaultKey(key);

  const def = VAULT_FIELD_DEFINITIONS.find((d) => d.key === resolvedKey);
  if (def) return def.label;

  // Pretty print fallback
  const parts = (resolvedKey || '').split('.');
  const raw = parts[parts.length - 1] || key;
  return raw.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}
