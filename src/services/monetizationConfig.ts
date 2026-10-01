/**
 * Centralized Monetization & Usage Configuration
 *
 * Keeps limits configurable in one single source of truth.
 * Easily modifiable for production or campaign adjustments.
 */

export const MONETIZATION_CONFIG = {
  // Free tier form limit per calendar month
  FREE_FORM_LIMIT: 5,

  // Free tier learned memory cap (Pro has unlimited)
  FREE_MEMORY_LIMIT: 10,

  // Free tier profile limit
  FREE_MAX_PROFILES: 1,

  // RevenueCat entitlement identifier for Pro access (authoritative: fill_pro)
  ENTITLEMENT_ID: 'fill_pro',

  // Default web offerings fallback / template (used when testing without live RevenueCat project keys)
  DEFAULT_OFFERING_ID: 'default',

  // Monthly and Annual default package IDs
  PACKAGES: {
    MONTHLY: {
      id: '$rc_monthly',
      productId: 'fill_pro_monthly',
      title: 'FILL Pro Monthly',
      description: 'Unlimited forms, advanced matching, expanded memory',
      price: 4.99,
      priceString: '$4.99 / mo',
      currencyCode: 'USD',
    },
    ANNUAL: {
      id: '$rc_annual',
      productId: 'fill_pro_annual',
      title: 'FILL Pro Annual',
      description: 'Unlimited form completion with annual billing',
      price: 39.99,
      priceString: '$39.99 / yr',
      currencyCode: 'USD',
      savingsNote: 'Save 33% compared to monthly',
    },
  },
} as const;

export type MonetizationConfig = typeof MONETIZATION_CONFIG;
