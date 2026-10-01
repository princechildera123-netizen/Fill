/**
 * RevenueCat & FILL Monetization Domain Models
 * Subscription tiers, entitlement constants, and package structures.
 */

export const REVENUECAT_ENTITLEMENT_ID = 'fill_pro';

export type SubscriptionTier = 'free' | 'pro';

export interface RevenueCatCustomerInfo {
  entitlements: {
    active: Record<
      string,
      {
        identifier: string;
        isActive: boolean;
        willRenew?: boolean;
        periodType?: 'normal' | 'trial' | 'intro' | string;
        latestPurchaseDate?: string;
        expirationDate?: string | null;
        productIdentifier?: string;
      }
    >;
    all: Record<string, unknown>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  originalAppUserId: string;
  managementURL?: string | null;
}

export interface RevenueCatPackage {
  identifier: string;
  packageType: 'MONTHLY' | 'ANNUAL' | 'LIFETIME' | 'THREE_MONTH' | 'SIX_MONTH' | 'WEEKLY' | 'CUSTOM' | string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
    periodDuration?: string;
  };
  offeringIdentifier: string;
  rcPackage?: any;
}

export interface RevenueCatOffering {
  identifier: string;
  serverDescription: string;
  availablePackages: RevenueCatPackage[];
  monthly?: RevenueCatPackage | null;
  annual?: RevenueCatPackage | null;
}

export interface UsageState {
  formsProcessedThisMonth: number;
  monthKey: string; // e.g. "2026-09"
  lastUpdated: number;
}

export interface FeatureGateReason {
  allowed: boolean;
  feature: 'process_form' | 'advanced_matching' | 'expanded_memory' | 'additional_profile';
  reason?: string;
  limit?: number;
  current?: number;
}

export interface RevenueCatDiagnostics {
  sdkStatus: 'initialized' | 'unavailable';
  environment: 'Test Store' | 'Android' | 'iOS';
  currentOfferingStatus: 'Loaded' | 'unavailable';
  packagesCount: number;
  entitlementId: 'fill_pro';
  entitlementStatus: 'Active' | 'Inactive';
}
