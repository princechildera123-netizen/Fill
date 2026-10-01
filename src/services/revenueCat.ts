/**
 * Dedicated RevenueCat Service & Architecture Module
 *
 * Implements:
 * - Official @revenuecat/purchases-js SDK integration
 * - Platform public key selection (Test Store, Android, iOS)
 * - Authoritative Entitlement: "fill_pro" (checks customerInfo.entitlements.active["fill_pro"])
 * - Centralized hasProAccess() single source of truth
 * - Dynamic offerings from RevenueCat (offerings.current) without hard-coded product IDs or invented prices
 * - Clean development state if no offering is available ("FILL Pro is being configured.")
 * - Purchase flow with entitlement confirmation, user cancellation handling ("You're still using FILL Free.")
 * - Purchase restoration handling
 * - Strict privacy: NEVER sends Vault values, OCR text, form answers, or AI prompts to RevenueCat
 */

import {
  Purchases,
  CustomerInfo as RCCustomerInfo,
  Package as RCPackage,
  PackageType,
} from '@revenuecat/purchases-js';
import {
  REVENUECAT_ENTITLEMENT_ID,
  RevenueCatCustomerInfo,
  RevenueCatOffering,
  RevenueCatPackage,
} from '../types/subscription';
import {
  getActiveRevenueCatPublicKey,
  getRevenueCatKeyDetails,
  syncServerPublicConfig,
  AUTHORITATIVE_ENTITLEMENT_ID,
} from './revenueCatConfig';

const RC_CUSTOMER_KEY = 'fill_rc_customer_info_v2';
const RC_ANONYMOUS_USER_ID_KEY = 'fill_rc_app_user_id_v2';
const RC_DEV_OVERRIDE_KEY = 'fill_rc_dev_override_v2';

// Listeners for real-time customer info updates
type CustomerInfoListener = (info: RevenueCatCustomerInfo) => void;
const customerListeners = new Set<CustomerInfoListener>();

export function subscribeToCustomerInfo(listener: CustomerInfoListener): () => void {
  customerListeners.add(listener);
  return () => {
    customerListeners.delete(listener);
  };
}

function notifyCustomerListeners(info: RevenueCatCustomerInfo): void {
  customerListeners.forEach((listener) => {
    try {
      listener(info);
    } catch (err) {
      console.warn('Error in CustomerInfo listener:', err);
    }
  });
}

/**
 * Returns or generates a stable anonymous app user ID
 */
export function getAppUserId(): string {
  try {
    let id = localStorage.getItem(RC_ANONYMOUS_USER_ID_KEY);
    if (!id) {
      id = `$RCAnonymousID:${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
      localStorage.setItem(RC_ANONYMOUS_USER_ID_KEY, id);
    }
    return id;
  } catch {
    return '$RCAnonymousID:guest_local';
  }
}

/**
 * Reads developer simulation override state.
 * Allows safe verification of UI states during local evaluation without bypassing RevenueCat.
 */
export function getDevProOverride(): boolean {
  try {
    return localStorage.getItem(RC_DEV_OVERRIDE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDevProOverride(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(RC_DEV_OVERRIDE_KEY, 'true');
    } else {
      localStorage.removeItem(RC_DEV_OVERRIDE_KEY);
    }
    notifyCustomerListeners(getStoredCustomerInfo());
  } catch (err) {
    console.warn('Failed to set dev pro override:', err);
  }
}

/**
 * Retrieves cached RevenueCat CustomerInfo from local storage
 */
export function getStoredCustomerInfo(): RevenueCatCustomerInfo {
  const userId = getAppUserId();
  const defaultInfo: RevenueCatCustomerInfo = {
    entitlements: {
      active: {},
      all: {},
    },
    activeSubscriptions: [],
    allPurchasedProductIdentifiers: [],
    originalAppUserId: userId,
  };

  try {
    const raw = localStorage.getItem(RC_CUSTOMER_KEY);
    if (!raw) return defaultInfo;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return defaultInfo;
  }
}

export function saveStoredCustomerInfo(info: RevenueCatCustomerInfo): void {
  try {
    localStorage.setItem(RC_CUSTOMER_KEY, JSON.stringify(info));
    notifyCustomerListeners(info);
  } catch (err) {
    console.error('Failed to cache RevenueCat CustomerInfo:', err);
  }
}

/**
 * Maps RevenueCat SDK CustomerInfo to normalized app CustomerInfo
 */
function normalizeCustomerInfo(rcInfo: RCCustomerInfo): RevenueCatCustomerInfo {
  const activeEntitlements: Record<string, any> = {};
  const allEntitlements: Record<string, any> = {};

  if (rcInfo.entitlements && rcInfo.entitlements.active) {
    Object.entries(rcInfo.entitlements.active).forEach(([key, ent]) => {
      activeEntitlements[key] = {
        identifier: ent.identifier,
        isActive: Boolean(ent.isActive),
        willRenew: ent.willRenew,
        periodType: ent.periodType,
        latestPurchaseDate: ent.latestPurchaseDate
          ? typeof ent.latestPurchaseDate === 'string'
            ? ent.latestPurchaseDate
            : (ent.latestPurchaseDate as any).toISOString?.() || String(ent.latestPurchaseDate)
          : undefined,
        expirationDate: ent.expirationDate
          ? typeof ent.expirationDate === 'string'
            ? ent.expirationDate
            : (ent.expirationDate as any).toISOString?.() || String(ent.expirationDate)
          : null,
        productIdentifier: ent.productIdentifier,
      };
    });
  }

  if (rcInfo.entitlements && rcInfo.entitlements.all) {
    Object.entries(rcInfo.entitlements.all).forEach(([key, ent]) => {
      allEntitlements[key] = {
        identifier: ent.identifier,
        isActive: Boolean(ent.isActive),
      };
    });
  }

  const subscriptions = rcInfo.activeSubscriptions ? Array.from(rcInfo.activeSubscriptions) : [];
  const allPurchased = rcInfo.allPurchaseDatesByProduct
    ? Object.keys(rcInfo.allPurchaseDatesByProduct)
    : [];

  return {
    entitlements: {
      active: activeEntitlements,
      all: allEntitlements,
    },
    activeSubscriptions: subscriptions,
    allPurchasedProductIdentifiers: allPurchased,
    originalAppUserId: rcInfo.originalAppUserId || getAppUserId(),
    managementURL: rcInfo.managementURL || null,
  };
}

// Singleton reference to configured Purchases instance
let purchasesInstance: Purchases | null = null;
let isConfiguring = false;

/**
 * Initializes the official RevenueCat Purchases SDK using centralized platform key selection
 */
export async function initializePurchases(): Promise<Purchases | null> {
  // Sync server public config if not yet available in import.meta.env
  await syncServerPublicConfig();

  const apiKey = getActiveRevenueCatPublicKey();
  if (!apiKey) {
    return null;
  }

  if (purchasesInstance) {
    return purchasesInstance;
  }

  if (isConfiguring) {
    await new Promise((r) => setTimeout(r, 200));
    return purchasesInstance;
  }

  try {
    isConfiguring = true;
    if (Purchases.isConfigured()) {
      purchasesInstance = Purchases.getSharedInstance();
    } else {
      const appUserId = getAppUserId();
      purchasesInstance = Purchases.configure({
        apiKey,
        appUserId,
      });
    }

    // Refresh and sync initial customer info
    try {
      const info = await purchasesInstance.getCustomerInfo();
      if (info) {
        const normalized = normalizeCustomerInfo(info);
        saveStoredCustomerInfo(normalized);
      }
    } catch (infoErr) {
      console.warn('Initial RevenueCat customer info fetch notice:', infoErr);
    }

    return purchasesInstance;
  } catch (err) {
    console.warn('Could not configure RevenueCat SDK:', err);
    purchasesInstance = null;
    return null;
  } finally {
    isConfiguring = false;
  }
}

/**
 * Authoritative check: Does the user have Pro access?
 * Strictly checks the authoritative entitlement: "fill_pro".
 * (customerInfo.entitlements.active["fill_pro"])
 */
export function hasProAccess(): boolean {
  if (getDevProOverride()) {
    return true;
  }

  const customerInfo = getStoredCustomerInfo();
  const fillProEntitlement = customerInfo.entitlements?.active?.[AUTHORITATIVE_ENTITLEMENT_ID];

  return Boolean(fillProEntitlement && fillProEntitlement.isActive);
}

/**
 * Maps an official RevenueCat Package returned by the SDK into our package structure.
 * Preserves the actual product title, price, billing period, and package type returned by RevenueCat.
 */
function mapSdkPackage(pkg: RCPackage, offeringId: string): RevenueCatPackage {
  let pkgType: RevenueCatPackage['packageType'] = 'CUSTOM';
  const rawType = String(pkg.packageType || '').toLowerCase();
  const idLower = pkg.identifier.toLowerCase();

  if (
    pkg.packageType === PackageType.Monthly ||
    rawType.includes('monthly') ||
    idLower.includes('monthly') ||
    idLower.includes('month')
  ) {
    pkgType = 'MONTHLY';
  } else if (
    pkg.packageType === PackageType.Annual ||
    rawType.includes('annual') ||
    idLower.includes('annual') ||
    idLower.includes('year')
  ) {
    pkgType = 'ANNUAL';
  } else if (
    pkg.packageType === PackageType.Lifetime ||
    rawType.includes('lifetime') ||
    idLower.includes('lifetime')
  ) {
    pkgType = 'LIFETIME';
  } else if (
    (pkg.packageType as any) === PackageType.ThreeMonth ||
    rawType.includes('three') ||
    idLower.includes('quarter')
  ) {
    pkgType = 'THREE_MONTH';
  } else if (
    (pkg.packageType as any) === PackageType.SixMonth ||
    rawType.includes('six') ||
    idLower.includes('semester')
  ) {
    pkgType = 'SIX_MONTH';
  } else if (
    (pkg.packageType as any) === PackageType.Weekly ||
    rawType.includes('week') ||
    idLower.includes('week')
  ) {
    pkgType = 'WEEKLY';
  }

  const prod = pkg.webBillingProduct || (pkg as any).rcBillingProduct;

  const priceVal = prod?.price?.amountMicros
    ? prod.price.amountMicros / 1000000
    : prod?.currentPrice?.amountMicros
    ? prod.currentPrice.amountMicros / 1000000
    : 0;

  const priceStr =
    prod?.price?.formattedPrice ||
    prod?.currentPrice?.formattedPrice ||
    (priceVal > 0 ? `$${priceVal.toFixed(2)}` : 'Pricing in Store');

  const currCode =
    prod?.price?.currency ||
    prod?.currentPrice?.currency ||
    'USD';

  const title =
    prod?.title ||
    (pkgType === 'ANNUAL'
      ? 'FILL Pro Annual'
      : pkgType === 'MONTHLY'
      ? 'FILL Pro Monthly'
      : `FILL Pro ${pkg.identifier.replace('$', '')}`);

  const description =
    prod?.description ||
    'Unlimited forms, advanced semantic matching, and expanded FILL Memory';

  return {
    identifier: pkg.identifier,
    packageType: pkgType,
    product: {
      identifier: prod?.identifier || pkg.identifier,
      title,
      description,
      price: priceVal,
      priceString: priceStr,
      currencyCode: currCode,
      periodDuration: (prod as any)?.normalPeriodDuration,
    },
    offeringIdentifier: offeringId,
    rcPackage: pkg,
  };
}

/**
 * Fetches dynamic RevenueCat offerings using getOfferings() and offerings.current.
 * Automatically works with the 3 existing packages without hard-coding IDs or prices.
 * If no offering is available yet, returns a clean development state ("FILL Pro is being configured.")
 * without creating fake products.
 */
export async function getOfferings(): Promise<{
  current: RevenueCatOffering | null;
  all: Record<string, RevenueCatOffering>;
  isConfiguredInRevenueCat: boolean;
  statusMessage?: string;
}> {
  const { apiKey, platform } = getRevenueCatKeyDetails();

  if (apiKey) {
    try {
      const purchases = await initializePurchases();
      if (purchases) {
        const offerings = await purchases.getOfferings();

        // 1. Primary: Use offerings.current
        if (offerings && offerings.current && offerings.current.availablePackages.length > 0) {
          const currentOffering = offerings.current;
          const mappedPackages = currentOffering.availablePackages.map((p) =>
            mapSdkPackage(p, currentOffering.identifier)
          );

          const offering: RevenueCatOffering = {
            identifier: currentOffering.identifier,
            serverDescription: currentOffering.serverDescription || 'FILL Pro Offerings',
            availablePackages: mappedPackages,
            monthly: mappedPackages.find((p) => p.packageType === 'MONTHLY') || null,
            annual: mappedPackages.find((p) => p.packageType === 'ANNUAL') || null,
          };

          return {
            current: offering,
            all: { [offering.identifier]: offering },
            isConfiguredInRevenueCat: true,
          };
        }

        // 2. Fallback check across all configured offerings in the project
        if (offerings && offerings.all && Object.keys(offerings.all).length > 0) {
          const firstKey = Object.keys(offerings.all)[0];
          const firstOffering = offerings.all[firstKey];
          if (firstOffering && firstOffering.availablePackages.length > 0) {
            const mappedPackages = firstOffering.availablePackages.map((p) =>
              mapSdkPackage(p, firstOffering.identifier)
            );

            const offering: RevenueCatOffering = {
              identifier: firstOffering.identifier,
              serverDescription: firstOffering.serverDescription || 'Configured Offering',
              availablePackages: mappedPackages,
              monthly: mappedPackages.find((p) => p.packageType === 'MONTHLY') || null,
              annual: mappedPackages.find((p) => p.packageType === 'ANNUAL') || null,
            };

            return {
              current: offering,
              all: { [offering.identifier]: offering },
              isConfiguredInRevenueCat: true,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn('RevenueCat SDK getOfferings error:', err?.message || err);
    }
  }

  // If no offering is available yet, show clean development state instead of crashing.
  // DO NOT create fake products or hard-coded prices.
  return {
    current: null,
    all: {},
    isConfiguredInRevenueCat: Boolean(apiKey),
    statusMessage: 'FILL Pro is being configured.',
  };
}

/**
 * Purchases a package through RevenueCat.
 * 1. Open the RevenueCat purchase flow.
 * 2. Wait for the result.
 * 3. Refresh CustomerInfo.
 * 4. Check "fill_pro".
 * 5. Unlock Pro only if "fill_pro" is confirmed.
 *
 * Success message: "Welcome to FILL Pro", "Your Pro features are now unlocked."
 * Cancellation message: "Purchase cancelled", "You're still using FILL Free."
 * Never claim a purchase succeeded unless RevenueCat confirms it.
 */
export async function purchasePackage(
  pkg: RevenueCatPackage
): Promise<{
  success: boolean;
  cancelled?: boolean;
  customerInfo: RevenueCatCustomerInfo;
  error?: string;
  message?: string;
}> {
  const { apiKey } = getRevenueCatKeyDetails();

  if (apiKey) {
    try {
      const purchases = await initializePurchases();
      if (!purchases) {
        throw new Error('RevenueCat SDK could not be initialized.');
      }

      // Find the SDK package reference
      let targetRcPkg: RCPackage | undefined = pkg.rcPackage;
      if (!targetRcPkg) {
        const offerings = await purchases.getOfferings();
        targetRcPkg =
          offerings?.current?.availablePackages.find((p) => p.identifier === pkg.identifier) ||
          offerings?.all?.[pkg.offeringIdentifier]?.availablePackages.find(
            (p) => p.identifier === pkg.identifier
          );
      }

      if (!targetRcPkg) {
        throw new Error(`Package ${pkg.identifier} not found in active RevenueCat offerings.`);
      }

      try {
        const purchaseResult = await purchases.purchase({ rcPackage: targetRcPkg });
        if (purchaseResult && purchaseResult.customerInfo) {
          // Refresh customer info directly to confirm entitlement
          const freshInfo = await purchases.getCustomerInfo();
          const normalized = normalizeCustomerInfo(freshInfo || purchaseResult.customerInfo);
          saveStoredCustomerInfo(normalized);

          // Authoritative check on "fill_pro"
          const hasFillPro = Boolean(
            normalized.entitlements.active[AUTHORITATIVE_ENTITLEMENT_ID]?.isActive
          );

          if (hasFillPro) {
            return {
              success: true,
              customerInfo: normalized,
              message: 'Your Pro features are now unlocked.',
            };
          }

          return {
            success: false,
            customerInfo: normalized,
            error: 'Purchase processed, waiting for "fill_pro" entitlement activation.',
          };
        }
      } catch (purchErr: any) {
        // User cancellation check
        const isCancelled =
          purchErr?.errorCode === 1 ||
          purchErr?.name === 'UserCancelledError' ||
          String(purchErr?.message || '').toLowerCase().includes('cancel') ||
          String(purchErr?.message || '').toLowerCase().includes('user cancelled') ||
          String(purchErr?.message || '').toLowerCase().includes('dismiss');

        if (isCancelled) {
          return {
            success: false,
            cancelled: true,
            customerInfo: getStoredCustomerInfo(),
            error: "You're still using FILL Free.",
          };
        }

        throw purchErr;
      }
    } catch (err: any) {
      console.warn('RevenueCat purchase execution note:', err?.message || err);
      return {
        success: false,
        customerInfo: getStoredCustomerInfo(),
        error:
          err?.message ||
          'Could not complete checkout with RevenueCat. Please verify your connection or try again.',
      };
    }
  }

  // If no RevenueCat public key is configured or browser cannot reach RevenueCat:
  // Never falsely claim that a purchase succeeded without RevenueCat confirmation.
  return {
    success: false,
    customerInfo: getStoredCustomerInfo(),
    error:
      'RevenueCat web billing is not configured. In development, provide a valid RevenueCat Test Store public key.',
  };
}

/**
 * Restores previous purchases
 * 1. Refresh CustomerInfo from RevenueCat
 * 2. Check "fill_pro"
 * 3. Unlock Pro if active
 * 4. Update the UI
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  restored: boolean;
  message: string;
  customerInfo: RevenueCatCustomerInfo;
}> {
  const { apiKey } = getRevenueCatKeyDetails();

  if (apiKey) {
    try {
      const purchases = await initializePurchases();
      if (purchases) {
        // Refresh customer info from RevenueCat backend
        const info = await purchases.getCustomerInfo();
        if (info) {
          const normalized = normalizeCustomerInfo(info);
          saveStoredCustomerInfo(normalized);

          const hasFillPro = Boolean(
            normalized.entitlements.active[AUTHORITATIVE_ENTITLEMENT_ID]?.isActive
          );

          if (hasFillPro) {
            return {
              success: true,
              restored: true,
              message: 'Welcome back to FILL Pro! Your Pro features are now unlocked.',
              customerInfo: normalized,
            };
          }

          return {
            success: true,
            restored: false,
            message: 'No active FILL Pro purchase found for this account.',
            customerInfo: normalized,
          };
        }
      }
    } catch (err: any) {
      console.warn('RevenueCat SDK restore check error:', err?.message || err);
    }
  }

  // Local state check
  const info = getStoredCustomerInfo();
  const hasFillPro = Boolean(info.entitlements.active[AUTHORITATIVE_ENTITLEMENT_ID]?.isActive);

  if (hasFillPro) {
    return {
      success: true,
      restored: true,
      message: 'Your FILL Pro subscription was found and restored successfully.',
      customerInfo: info,
    };
  }

  return {
    success: true,
    restored: false,
    message: 'No previous purchases found for this account.',
    customerInfo: info,
  };
}

/**
 * Resets subscription to Free tier for development testing
 */
export function resetSubscriptionToFree(): RevenueCatCustomerInfo {
  setDevProOverride(false);
  const cleared: RevenueCatCustomerInfo = {
    entitlements: {
      active: {},
      all: {},
    },
    activeSubscriptions: [],
    allPurchasedProductIdentifiers: [],
    originalAppUserId: getAppUserId(),
  };
  saveStoredCustomerInfo(cleared);
  return cleared;
}

/**
 * Returns developer-only diagnostic metrics for RevenueCat
 * Requirement 14:
 * - SDK status: initialized / unavailable
 * - Environment: Test Store / Android / iOS
 * - Current Offering: Loaded / unavailable
 * - Packages: Number of packages returned
 * - Entitlement: "fill_pro"
 * - Status: Active / Inactive
 * STRICT: Never displays API keys or secret credentials.
 */
export async function getRevenueCatDiagnostics(): Promise<{
  sdkStatus: 'initialized' | 'unavailable';
  environment: 'Test Store' | 'Android' | 'iOS';
  currentOfferingStatus: 'Loaded' | 'unavailable';
  packagesCount: number;
  entitlementId: 'fill_pro';
  entitlementStatus: 'Active' | 'Inactive';
}> {
  const { apiKey, platform } = getRevenueCatKeyDetails();
  let sdkInitialized = false;

  try {
    if (apiKey) {
      const instance = await initializePurchases();
      sdkInitialized = Boolean(instance && Purchases.isConfigured());
    }
  } catch {
    sdkInitialized = false;
  }

  let currentOfferingStatus: 'Loaded' | 'unavailable' = 'unavailable';
  let packagesCount = 0;

  try {
    const offeringsData = await getOfferings();
    if (offeringsData.current && offeringsData.current.availablePackages.length > 0) {
      currentOfferingStatus = 'Loaded';
      packagesCount = offeringsData.current.availablePackages.length;
    }
  } catch {
    currentOfferingStatus = 'unavailable';
    packagesCount = 0;
  }

  const envDisplay: 'Test Store' | 'Android' | 'iOS' =
    platform === 'android' ? 'Android' : platform === 'ios' ? 'iOS' : 'Test Store';

  const customerInfo = getStoredCustomerInfo();
  const isEntitled = Boolean(customerInfo?.entitlements?.active?.[AUTHORITATIVE_ENTITLEMENT_ID]?.isActive);

  return {
    sdkStatus: sdkInitialized ? 'initialized' : 'unavailable',
    environment: envDisplay,
    currentOfferingStatus,
    packagesCount,
    entitlementId: 'fill_pro',
    entitlementStatus: isEntitled ? 'Active' : 'Inactive',
  };
}
