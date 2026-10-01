import { VaultData } from '../types/fill';
import { INITIAL_EMPTY_VAULT, SAMPLE_STUDENT_VAULT } from './vaultSchema';

const VAULT_STORAGE_KEY = 'fill_vault_data_v1';
const ONBOARDING_COMPLETED_KEY = 'fill_onboarding_completed_v1';

export function loadVaultData(): VaultData {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) {
      // Default to sample student vault on first visit for effortless demo experience
      saveVaultData(SAMPLE_STUDENT_VAULT);
      return SAMPLE_STUDENT_VAULT;
    }
    const parsed = JSON.parse(raw);
    return {
      identity: { ...INITIAL_EMPTY_VAULT.identity, ...parsed.identity },
      contact: { ...INITIAL_EMPTY_VAULT.contact, ...parsed.contact },
      education: { ...INITIAL_EMPTY_VAULT.education, ...parsed.education },
      address: { ...INITIAL_EMPTY_VAULT.address, ...parsed.address },
      emergency: { ...INITIAL_EMPTY_VAULT.emergency, ...parsed.emergency },
    };
  } catch (err) {
    console.error('Error loading vault from storage:', err);
    return SAMPLE_STUDENT_VAULT;
  }
}

export function saveVaultData(data: VaultData): void {
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving vault to storage:', err);
  }
}

export function clearVaultData(): VaultData {
  saveVaultData(INITIAL_EMPTY_VAULT);
  return INITIAL_EMPTY_VAULT;
}

export function resetToSampleVault(): VaultData {
  saveVaultData(SAMPLE_STUDENT_VAULT);
  return SAMPLE_STUDENT_VAULT;
}

export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(completed: boolean): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, completed ? 'true' : 'false');
  } catch (err) {
    console.error('Error saving onboarding state:', err);
  }
}

export function exportVaultJSON(data: VaultData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FILL_Vault_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
