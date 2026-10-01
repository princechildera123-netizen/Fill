/**
 * Centralized Usage Limit Tracking Service
 * Tracks form processing usage on a per-calendar-month basis.
 * Clean, predictable persistence with automatic monthly resets.
 */

import { UsageState } from '../types/subscription';
import { MONETIZATION_CONFIG } from './monetizationConfig';

const USAGE_STORAGE_KEY = 'fill_usage_state_v1';

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getUsageState(): UsageState {
  const currentMonth = getCurrentMonthKey();
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) {
      return {
        formsProcessedThisMonth: 0,
        monthKey: currentMonth,
        lastUpdated: Date.now(),
      };
    }

    const parsed: UsageState = JSON.parse(raw);
    // Automatic monthly reset when a new calendar month starts
    if (parsed.monthKey !== currentMonth) {
      const resetState: UsageState = {
        formsProcessedThisMonth: 0,
        monthKey: currentMonth,
        lastUpdated: Date.now(),
      };
      saveUsageState(resetState);
      return resetState;
    }

    return parsed;
  } catch (err) {
    console.warn('Error reading usage state, resetting to zero:', err);
    return {
      formsProcessedThisMonth: 0,
      monthKey: currentMonth,
      lastUpdated: Date.now(),
    };
  }
}

export function saveUsageState(state: UsageState): void {
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving usage state:', err);
  }
}

/**
 * Increments the form counter when a form is processed or imported
 */
export function recordFormProcessed(): UsageState {
  const current = getUsageState();
  const updated: UsageState = {
    ...current,
    formsProcessedThisMonth: current.formsProcessedThisMonth + 1,
    lastUpdated: Date.now(),
  };
  saveUsageState(updated);
  return updated;
}

/**
 * Resets usage for development testing or debugging
 */
export function resetMonthlyUsage(): UsageState {
  const resetState: UsageState = {
    formsProcessedThisMonth: 0,
    monthKey: getCurrentMonthKey(),
    lastUpdated: Date.now(),
  };
  saveUsageState(resetState);
  return resetState;
}

/**
 * Sets usage count manually for development simulation
 */
export function setDevUsageCount(count: number): UsageState {
  const updated: UsageState = {
    formsProcessedThisMonth: Math.max(0, count),
    monthKey: getCurrentMonthKey(),
    lastUpdated: Date.now(),
  };
  saveUsageState(updated);
  return updated;
}
