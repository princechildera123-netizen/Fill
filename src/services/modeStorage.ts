/**
 * FILL Mode Selection & State Persistence Service
 *
 * Supports two first-class ways to use FILL:
 * 1. 'documents': Upload and complete application PDFs, scans, images
 * 2. 'websites': Complete web forms via FILL Chrome Extension Companion
 *
 * Users can choose either one or both ('both' | 'documents' | 'websites').
 */

export type FillMode = 'documents' | 'websites' | 'both';

const FILL_MODE_PREF_KEY = 'fill_mode_preference_v1';
const FILL_CHROME_STATUS_KEY = 'fill_chrome_companion_status_v1';

export interface FillModePreferences {
  mode: FillMode;
  useDocuments: boolean;
  useWebsites: boolean;
  hasCompletedModeOnboarding: boolean;
}

/**
 * Loads current mode preferences
 */
export function loadModePreferences(): FillModePreferences {
  try {
    const raw = localStorage.getItem(FILL_MODE_PREF_KEY);
    if (!raw) {
      // Default to both enabled so existing users have access to all features seamlessly
      return {
        mode: 'both',
        useDocuments: true,
        useWebsites: true,
        hasCompletedModeOnboarding: false,
      };
    }
    const parsed = JSON.parse(raw);
    const useDocuments = parsed.useDocuments ?? (parsed.mode === 'documents' || parsed.mode === 'both');
    const useWebsites = parsed.useWebsites ?? (parsed.mode === 'websites' || parsed.mode === 'both');

    let mode: FillMode = 'both';
    if (useDocuments && !useWebsites) mode = 'documents';
    else if (!useDocuments && useWebsites) mode = 'websites';
    else mode = 'both';

    return {
      mode,
      useDocuments,
      useWebsites,
      hasCompletedModeOnboarding: Boolean(parsed.hasCompletedModeOnboarding),
    };
  } catch {
    return {
      mode: 'both',
      useDocuments: true,
      useWebsites: true,
      hasCompletedModeOnboarding: false,
    };
  }
}

/**
 * Saves mode preferences
 */
export function saveModePreferences(prefs: {
  useDocuments: boolean;
  useWebsites: boolean;
  hasCompletedModeOnboarding?: boolean;
}): FillModePreferences {
  const useDocs = Boolean(prefs.useDocuments);
  const useWeb = Boolean(prefs.useWebsites);

  // If user unselects both, default to both to prevent an empty dead state
  const effectiveDocs = !useDocs && !useWeb ? true : useDocs;
  const effectiveWeb = !useDocs && !useWeb ? true : useWeb;

  let mode: FillMode = 'both';
  if (effectiveDocs && !effectiveWeb) mode = 'documents';
  else if (!effectiveDocs && effectiveWeb) mode = 'websites';
  else mode = 'both';

  const fullPrefs: FillModePreferences = {
    mode,
    useDocuments: effectiveDocs,
    useWebsites: effectiveWeb,
    hasCompletedModeOnboarding: prefs.hasCompletedModeOnboarding ?? true,
  };

  try {
    localStorage.setItem(FILL_MODE_PREF_KEY, JSON.stringify(fullPrefs));
  } catch (err) {
    console.warn('Failed to save FILL mode preferences:', err);
  }

  return fullPrefs;
}

/**
 * Checks Chrome companion extension connection state
 * Note (Requirement 15): We do not show "Chrome Connected" unless we can genuinely verify
 * communication with the extension (via runtime postMessage or custom attribute).
 * Otherwise returns 'ready_to_connect'.
 */
export function checkChromeConnectionStatus(): 'connected' | 'ready_to_connect' {
  try {
    // Check if the page or window has received an extension handshake signal
    if (typeof window !== 'undefined' && (window as any).__FILL_EXTENSION_CONNECTED__) {
      return 'connected';
    }
    const manualConnected = localStorage.getItem(FILL_CHROME_STATUS_KEY) === 'connected';
    if (manualConnected) {
      return 'connected';
    }
  } catch {
    // Fallback
  }
  return 'ready_to_connect';
}

export function setChromeConnectionStatus(status: 'connected' | 'ready_to_connect'): void {
  try {
    localStorage.setItem(FILL_CHROME_STATUS_KEY, status);
  } catch {
    // Ignore
  }
}
