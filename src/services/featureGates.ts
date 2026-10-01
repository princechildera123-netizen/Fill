/**
 * Centralized Feature Gating Service
 *
 * Provides standardized gate checks:
 * - canProcessForm()
 * - canUseAdvancedMatching()
 * - canUseExpandedMemory()
 * - canCreateAdditionalProfile()
 *
 * Free users get useful core capabilities:
 * - Personal Vault
 * - Basic form understanding
 * - Basic semantic matching
 * - Free form allowance (configurable, default: 5 forms/month)
 * - Basic FILL Memory
 * - Basic preview/export
 *
 * Pro users get:
 * - Unlimited forms
 * - Advanced semantic matching
 * - Expanded FILL Memory
 * - Advanced document processing
 * - Multiple personal profiles
 * - Priority AI processing
 */

import { FeatureGateReason } from '../types/subscription';
import { MONETIZATION_CONFIG } from './monetizationConfig';
import { hasProAccess } from './revenueCat';
import { getUsageState } from './usageLimit';
import { loadLearnedMemory } from './memoryStorage';

/**
 * Checks if the user is allowed to process or import a new form.
 * Pro users: Unlimited.
 * Free users: Up to FREE_FORM_LIMIT (5 forms/month).
 */
export function canProcessForm(): FeatureGateReason {
  if (hasProAccess()) {
    return {
      allowed: true,
      feature: 'process_form',
    };
  }

  const usage = getUsageState();
  const limit = MONETIZATION_CONFIG.FREE_FORM_LIMIT;
  const current = usage.formsProcessedThisMonth;

  if (current >= limit) {
    return {
      allowed: false,
      feature: 'process_form',
      limit,
      current,
      reason: `You've used your ${limit} free forms this month. Upgrade to FILL Pro for unlimited forms.`,
    };
  }

  return {
    allowed: true,
    feature: 'process_form',
    limit,
    current,
  };
}

/**
 * Checks if advanced AI semantic matching is unlocked.
 * Pro users get deep Gemini 3.8 Flash semantic reasoning.
 * Free users get standard deterministic + synonym ontology + basic matching.
 */
export function canUseAdvancedMatching(): FeatureGateReason {
  if (hasProAccess()) {
    return {
      allowed: true,
      feature: 'advanced_matching',
    };
  }

  return {
    allowed: false,
    feature: 'advanced_matching',
    reason: 'Advanced semantic matching powered by Gemini AI is available on FILL Pro.',
  };
}

/**
 * Checks if expanded learned memory is available.
 * Free: up to FREE_MEMORY_LIMIT mappings (default: 10).
 * Pro: unlimited learned mappings.
 */
export function canUseExpandedMemory(): FeatureGateReason {
  if (hasProAccess()) {
    return {
      allowed: true,
      feature: 'expanded_memory',
    };
  }

  const memory = loadLearnedMemory();
  const limit = MONETIZATION_CONFIG.FREE_MEMORY_LIMIT;
  const current = memory.length;

  if (current >= limit) {
    return {
      allowed: false,
      feature: 'expanded_memory',
      limit,
      current,
      reason: `Free plan includes up to ${limit} learned associations. Upgrade to FILL Pro for unlimited FILL Memory.`,
    };
  }

  return {
    allowed: true,
    feature: 'expanded_memory',
    limit,
    current,
  };
}

/**
 * Checks if creating additional personal profiles is allowed.
 * Free: 1 profile. Pro: multiple profiles.
 */
export function canCreateAdditionalProfile(currentProfileCount = 1): FeatureGateReason {
  if (hasProAccess()) {
    return {
      allowed: true,
      feature: 'additional_profile',
    };
  }

  if (currentProfileCount >= MONETIZATION_CONFIG.FREE_MAX_PROFILES) {
    return {
      allowed: false,
      feature: 'additional_profile',
      limit: MONETIZATION_CONFIG.FREE_MAX_PROFILES,
      current: currentProfileCount,
      reason: 'Multiple personal profiles are a FILL Pro feature.',
    };
  }

  return {
    allowed: true,
    feature: 'additional_profile',
  };
}
