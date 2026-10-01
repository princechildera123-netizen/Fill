/**
 * FILL Memory Service
 * Persistent learned mappings across forms and sessions
 *
 * SAFETY MANDATE (Section 9):
 * FILL Memory ONLY learns field-to-concept mappings (e.g. "Institution presently attended" -> education.school).
 * It NEVER stores static values. Values are always retrieved dynamically from the user's active Vault.
 */

import { LearnedMapping } from '../types/fill';
import { normalizeLabelString } from './canonicalFields';

const MEMORY_STORAGE_KEY = 'fill_memory_mappings_v2';

export function normalizePhrase(raw: string): string {
  return normalizeLabelString(raw);
}

// Initial seed: starts clean or with standard historical confirmations
const INITIAL_MEMORY_SEED: LearnedMapping[] = [
  {
    id: 'mem_seed_1',
    sourcePhrase: 'current educational institution',
    normalizedMeaning: 'education.school',
    confirmedVaultField: 'education.school',
    confirmationCount: 1,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    // Compatibility fields
    normalizedLabel: 'current educational institution',
    originalLabel: 'Current Educational Institution',
    vaultKey: 'education.school',
    vaultFieldTitle: 'School / Institution',
    confirmedAt: Date.now() - 86400000 * 2,
    useCount: 1,
  },
  {
    id: 'mem_seed_2',
    sourcePhrase: 'programme of study',
    normalizedMeaning: 'education.course',
    confirmedVaultField: 'education.course',
    confirmationCount: 1,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    // Compatibility fields
    normalizedLabel: 'programme of study',
    originalLabel: 'Programme of Study',
    vaultKey: 'education.course',
    vaultFieldTitle: 'Course / Program',
    confirmedAt: Date.now() - 86400000,
    useCount: 1,
  },
];

export function loadLearnedMemory(): LearnedMapping[] {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) {
      saveLearnedMemory(INITIAL_MEMORY_SEED);
      return INITIAL_MEMORY_SEED;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MEMORY_SEED;
  } catch (err) {
    console.error('Error reading FILL memory:', err);
    return INITIAL_MEMORY_SEED;
  }
}

export function saveLearnedMemory(mappings: LearnedMapping[]): void {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(mappings));
  } catch (err) {
    console.error('Error saving FILL memory:', err);
  }
}

/**
 * Saves or increments a confirmed mapping in FILL Memory
 */
export function recordLearnedMapping(
  sourcePhrase: string,
  confirmedVaultField: string,
  vaultFieldTitle?: string,
  normalizedMeaning?: string
): LearnedMapping {
  const norm = normalizePhrase(sourcePhrase);
  const memory = loadLearnedMemory();
  const meaning = normalizedMeaning || confirmedVaultField;
  const title = vaultFieldTitle || confirmedVaultField;

  const existingIdx = memory.findIndex(
    (m) => normalizePhrase(m.sourcePhrase || m.originalLabel || '') === norm
  );

  const now = Date.now();

  if (existingIdx >= 0) {
    const existing = memory[existingIdx];
    existing.confirmedVaultField = confirmedVaultField;
    existing.vaultKey = confirmedVaultField;
    existing.normalizedMeaning = meaning;
    existing.vaultFieldTitle = title;
    existing.confirmationCount = (existing.confirmationCount || existing.useCount || 0) + 1;
    existing.useCount = existing.confirmationCount;
    existing.updatedAt = now;
    existing.confirmedAt = now;
    saveLearnedMemory(memory);
    return existing;
  }

  const newMapping: LearnedMapping = {
    id: `mem_${now}_${Math.random().toString(36).substring(2, 7)}`,
    sourcePhrase,
    normalizedMeaning: meaning,
    confirmedVaultField,
    confirmationCount: 1,
    createdAt: now,
    updatedAt: now,
    // Backward compatibility aliases
    normalizedLabel: norm,
    originalLabel: sourcePhrase,
    vaultKey: confirmedVaultField,
    vaultFieldTitle: title,
    confirmedAt: now,
    useCount: 1,
  };

  memory.unshift(newMapping);
  saveLearnedMemory(memory);
  return newMapping;
}

/**
 * Consults FILL Memory for exact match or strong semantic synonym clusters
 * before calling external AI.
 */
export function findLearnedMapping(rawLabel: string): LearnedMapping | null {
  const norm = normalizePhrase(rawLabel);
  if (!norm) return null;

  const memory = loadLearnedMemory();

  // 1. Exact phrase match
  const exact = memory.find(
    (m) => normalizePhrase(m.sourcePhrase || m.originalLabel || '') === norm
  );
  if (exact) {
    exact.confirmationCount = (exact.confirmationCount || exact.useCount || 0) + 1;
    exact.useCount = exact.confirmationCount;
    exact.updatedAt = Date.now();
    saveLearnedMemory(memory);
    return exact;
  }

  // 2. High semantic token overlap & known synonym clusters
  // Specifically supports the WOW Demo Form B: "Institution presently attended" -> recognized as education.school
  const normTokens = new Set(norm.split(' ').filter((w) => w.length > 2));
  if (normTokens.size === 0) return null;

  for (const m of memory) {
    const memPhrase = normalizePhrase(m.sourcePhrase || m.originalLabel || '');
    const memTokens = new Set(memPhrase.split(' ').filter((w) => w.length > 2));

    // Jaccard similarity
    let commonCount = 0;
    normTokens.forEach((t) => {
      if (memTokens.has(t)) commonCount++;
    });
    const unionSize = new Set([...normTokens, ...memTokens]).size;
    const similarity = commonCount / unionSize;

    if (similarity >= 0.5) {
      m.confirmationCount = (m.confirmationCount || m.useCount || 0) + 1;
      m.useCount = m.confirmationCount;
      m.updatedAt = Date.now();
      saveLearnedMemory(memory);
      return m;
    }

    // Educational Institution cluster (WOW Demo Form A <-> Form B)
    const hasSchoolConcept =
      normTokens.has('institution') ||
      normTokens.has('school') ||
      normTokens.has('university') ||
      normTokens.has('college');
    const hasEnrollmentConcept =
      normTokens.has('attended') ||
      normTokens.has('presently') ||
      normTokens.has('currently') ||
      normTokens.has('enrolled') ||
      normTokens.has('study');

    if (
      hasSchoolConcept &&
      hasEnrollmentConcept &&
      (m.confirmedVaultField === 'education.school' || m.vaultKey === 'education.school')
    ) {
      m.confirmationCount = (m.confirmationCount || m.useCount || 0) + 1;
      m.useCount = m.confirmationCount;
      m.updatedAt = Date.now();
      saveLearnedMemory(memory);
      return m;
    }

    // Program / Major / Course cluster
    const hasProgramConcept =
      normTokens.has('course') ||
      normTokens.has('programme') ||
      normTokens.has('program') ||
      normTokens.has('major') ||
      normTokens.has('curriculum');
    if (
      hasProgramConcept &&
      (m.confirmedVaultField === 'education.course' || m.vaultKey === 'education.course')
    ) {
      m.confirmationCount = (m.confirmationCount || m.useCount || 0) + 1;
      m.useCount = m.confirmationCount;
      m.updatedAt = Date.now();
      saveLearnedMemory(memory);
      return m;
    }
  }

  return null;
}

export function deleteLearnedMapping(id: string): void {
  const memory = loadLearnedMemory().filter((m) => m.id !== id);
  saveLearnedMemory(memory);
}

export function clearAllMemory(): void {
  saveLearnedMemory([]);
}
