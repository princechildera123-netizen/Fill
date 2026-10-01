/**
 * RevenueCat Centralized Configuration Service
 *
 * Implements:
 * - Centralized public API key resolution based on platform and environment
 *   - Development / Test Store: REVENUECAT_PUBLIC_API_KEY (or VITE_REVENUECAT_PUBLIC_API_KEY)
 *   - Android native: VITE_REVENUECAT_ANDROID_PUBLIC_KEY
 *   - iOS native: VITE_REVENUECAT_IOS_PUBLIC_KEY
 * - Safe environment variable retrieval
 * - Strict security: Never allows RevenueCat secret keys (sk_...) in client code
 * - Platform detection for native hybrid (Capacitor/Cordova) vs web/test store
 */

export type RevenueCatPlatform = 'test_store' | 'android' | 'ios' | 'web';

export interface RevenueCatConfigDetails {
  platform: RevenueCatPlatform;
  apiKey: string;
  keySource: string;
  hasKey: boolean;
  isTestStore: boolean;
  entitlementId: string;
}

export const AUTHORITATIVE_ENTITLEMENT_ID = 'fill_pro';

// In-memory cache for public config if fetched from server API
let runtimePublicConfigCache: Record<string, string> | null = null;

/**
 * Checks if a key is a valid non-placeholder, non-secret public key
 */
function isValidPublicKey(key: unknown): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (
    trimmed === '' ||
    trimmed === 'MY_REVENUECAT_KEY' ||
    trimmed === 'rc_web_placeholder_key' ||
    trimmed === 'goog_placeholder_key' ||
    trimmed === 'appl_placeholder_key'
  ) {
    return false;
  }

  // Security enforcement: NEVER accept secret keys on client
  if (trimmed.startsWith('sk_') || trimmed.includes('secret')) {
    console.error(
      'SECURITY WARNING: Secret RevenueCat key detected in client configuration! RevenueCat secret keys (sk_...) must NEVER be exposed in client code.'
    );
    return false;
  }

  return true;
}

/**
 * Safely reads an environment variable across Vite import.meta.env, process.env, or runtime cache
 */
function readEnv(varName: string): string {
  // 1. Check runtime cache from server bootstrap if available
  if (runtimePublicConfigCache && runtimePublicConfigCache[varName]) {
    return runtimePublicConfigCache[varName];
  }

  // 2. Check import.meta.env (Vite client environment)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const val = (import.meta.env as Record<string, any>)[varName];
    if (typeof val === 'string' && val) {
      return val.trim();
    }
  }

  // 3. Check process.env (Node / SSR / Define replacement)
  if (typeof process !== 'undefined' && process.env) {
    const val = process.env[varName];
    if (typeof val === 'string' && val) {
      return val.trim();
    }
  }

  // 4. Check global window object if injected
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    const val = (window as any).__ENV__[varName];
    if (typeof val === 'string' && val) {
      return val.trim();
    }
  }

  return '';
}

/**
 * Detects the current running platform (native Android, native iOS, or Web/Test Store)
 */
export function getRevenueCatPlatform(): RevenueCatPlatform {
  if (typeof window !== 'undefined') {
    const win = window as any;
    // Check Capacitor platform
    if (win.Capacitor?.getPlatform?.() === 'android' || win.isAndroidNative) {
      return 'android';
    }
    if (win.Capacitor?.getPlatform?.() === 'ios' || win.isIOSNative) {
      return 'ios';
    }
  }

  // Default to Test Store development in Web browser / AI Studio preview
  return 'test_store';
}

/**
 * Authoritative selection of the RevenueCat public API key based on the current platform
 */
export function getRevenueCatKeyDetails(): {
  apiKey: string;
  platform: RevenueCatPlatform;
  keySource: string;
} {
  const platform = getRevenueCatPlatform();

  // 1. Android Native
  if (platform === 'android') {
    const androidKey = readEnv('VITE_REVENUECAT_ANDROID_PUBLIC_KEY');
    if (isValidPublicKey(androidKey)) {
      return {
        apiKey: androidKey,
        platform: 'android',
        keySource: 'VITE_REVENUECAT_ANDROID_PUBLIC_KEY',
      };
    }
  }

  // 2. iOS Native
  if (platform === 'ios') {
    const iosKey = readEnv('VITE_REVENUECAT_IOS_PUBLIC_KEY');
    if (isValidPublicKey(iosKey)) {
      return {
        apiKey: iosKey,
        platform: 'ios',
        keySource: 'VITE_REVENUECAT_IOS_PUBLIC_KEY',
      };
    }
  }

  // 3. Test Store / Web Development (Default)
  // Check REVENUECAT_PUBLIC_API_KEY first, then VITE_REVENUECAT_PUBLIC_API_KEY
  const testStoreKey =
    readEnv('REVENUECAT_PUBLIC_API_KEY') ||
    readEnv('VITE_REVENUECAT_PUBLIC_API_KEY');

  if (isValidPublicKey(testStoreKey)) {
    return {
      apiKey: testStoreKey,
      platform: 'test_store',
      keySource: readEnv('REVENUECAT_PUBLIC_API_KEY')
        ? 'REVENUECAT_PUBLIC_API_KEY'
        : 'VITE_REVENUECAT_PUBLIC_API_KEY',
    };
  }

  return {
    apiKey: '',
    platform: 'test_store',
    keySource: 'NONE',
  };
}

/**
 * Returns the active RevenueCat public API key for SDK initialization
 */
export function getActiveRevenueCatPublicKey(): string {
  return getRevenueCatKeyDetails().apiKey;
}

/**
 * Returns complete configuration metadata for developer diagnostic UI
 */
export function getRevenueCatConfigSummary(): RevenueCatConfigDetails {
  const details = getRevenueCatKeyDetails();
  return {
    platform: details.platform,
    apiKey: details.apiKey ? 'Configured (Hidden)' : 'Not Configured',
    keySource: details.keySource,
    hasKey: Boolean(details.apiKey),
    isTestStore: details.platform === 'test_store',
    entitlementId: AUTHORITATIVE_ENTITLEMENT_ID,
  };
}

/**
 * Optionally syncs public keys from server-side endpoint if available
 */
export async function syncServerPublicConfig(): Promise<void> {
  try {
    const res = await fetch('/api/revenuecat-public-config');
    if (res.ok) {
      const data = await res.json();
      runtimePublicConfigCache = {
        REVENUECAT_PUBLIC_API_KEY: data.REVENUECAT_PUBLIC_API_KEY || '',
        VITE_REVENUECAT_PUBLIC_API_KEY: data.REVENUECAT_PUBLIC_API_KEY || data.VITE_REVENUECAT_PUBLIC_API_KEY || '',
        VITE_REVENUECAT_ANDROID_PUBLIC_KEY: data.VITE_REVENUECAT_ANDROID_PUBLIC_KEY || '',
        VITE_REVENUECAT_IOS_PUBLIC_KEY: data.VITE_REVENUECAT_IOS_PUBLIC_KEY || '',
      };
    }
  } catch {
    // Non-blocking
  }
}
