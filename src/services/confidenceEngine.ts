/**
 * Centralized Confidence Engine
 * Transparent, signal-based confidence scoring model with central threshold configuration
 */

import { ConfidenceLevel, MatchSource } from '../types/fill';

export interface ConfidenceThresholds {
  highMin: number; // default: 90
  reviewMin: number; // default: 70
  lowMax: number; // default: 69
}

export const DEFAULT_CONFIDENCE_THRESHOLDS: ConfidenceThresholds = {
  highMin: 90,
  reviewMin: 70,
  lowMax: 69,
};

// Global configurable thresholds instance
let activeThresholds: ConfidenceThresholds = { ...DEFAULT_CONFIDENCE_THRESHOLDS };

export function getConfidenceThresholds(): ConfidenceThresholds {
  return { ...activeThresholds };
}

export function setConfidenceThresholds(thresholds: Partial<ConfidenceThresholds>): void {
  activeThresholds = { ...activeThresholds, ...thresholds };
}

export interface ConfidenceCalculationSignals {
  exactCanonicalMatch?: boolean; // +98-99%
  strongSynonymMatch?: boolean; // +93-96%
  learnedMapping?: boolean; // +96-98%
  semanticAiScore?: number; // 0.0 - 1.0 (e.g. 0.88 -> 88)
  contextualAgreement?: boolean; // +3% to +5%
  conflictingSignals?: boolean; // drops into 55-68%
  hasVaultValue?: boolean; // if false, marks as missing
}

export interface ConfidenceEvaluation {
  score: number; // 0 to 100
  level: ConfidenceLevel;
  requiresReview: boolean;
  signalsBreakdown: string[];
}

export function calculateConfidence(
  signals: ConfidenceCalculationSignals,
  thresholds: ConfidenceThresholds = activeThresholds
): ConfidenceEvaluation {
  const breakdown: string[] = [];
  let baseScore = 50;

  // Signal 1: Learned Memory takes highest authority for previously verified mappings
  if (signals.learnedMapping) {
    baseScore = 97;
    breakdown.push('FILL Memory verified pattern (+97)');
  }
  // Signal 2: Exact Canonical Field Match
  else if (signals.exactCanonicalMatch) {
    baseScore = 98;
    breakdown.push('Exact canonical terminology match (+98)');
  }
  // Signal 3: Strong Synonym Rules
  else if (signals.strongSynonymMatch) {
    baseScore = 94;
    breakdown.push('Strong domain synonym match (+94)');
  }
  // Signal 4: Semantic AI (Gemini)
  else if (typeof signals.semanticAiScore === 'number') {
    const rawAiScore = Math.round(signals.semanticAiScore > 1 ? signals.semanticAiScore : signals.semanticAiScore * 100);
    baseScore = Math.max(50, Math.min(95, rawAiScore));
    breakdown.push(`Gemini semantic reasoning confidence (${baseScore}%)`);
  }

  // Modifier: Contextual Agreement
  if (signals.contextualAgreement) {
    const bonus = 3;
    baseScore = Math.min(99, baseScore + bonus);
    breakdown.push(`Surrounding section context matches (+${bonus}%)`);
  }

  // Modifier: Conflicting Signals
  if (signals.conflictingSignals) {
    baseScore = Math.max(45, Math.min(68, baseScore - 25));
    breakdown.push('Ambiguous or conflicting phrasing detected (-25%)');
  }

  // Bound score strictly between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore)));

  // Determine Confidence Level and Review Requirement
  let level: ConfidenceLevel = 'high';
  let requiresReview = false;

  if (signals.hasVaultValue === false) {
    level = 'missing';
    requiresReview = true;
    breakdown.push('Missing value in personal Vault');
  } else if (finalScore >= thresholds.highMin) {
    level = 'high';
    requiresReview = false;
  } else if (finalScore >= thresholds.reviewMin) {
    level = 'needs_review';
    requiresReview = true;
  } else {
    level = 'low';
    requiresReview = true;
  }

  return {
    score: finalScore,
    level,
    requiresReview,
    signalsBreakdown: breakdown,
  };
}

/**
 * Returns user-facing label and styling attributes for confidence indicators
 */
export function getConfidenceBadgeMeta(level: ConfidenceLevel, score?: number): {
  label: string;
  badgeClass: string;
  dotColor: string;
  iconName: 'high' | 'review' | 'low' | 'missing';
} {
  switch (level) {
    case 'high':
      return {
        label: score ? `${score}% High Confidence` : 'High Confidence',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
        iconName: 'high',
      };
    case 'needs_review':
      return {
        label: score ? `${score}% Needs Review` : '🟡 Needs your review',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500',
        iconName: 'review',
      };
    case 'low':
      return {
        label: score ? `${score}% Low Confidence` : 'Low Confidence',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotColor: 'bg-rose-500',
        iconName: 'low',
      };
    case 'missing':
      return {
        label: 'Missing in Vault',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotColor: 'bg-slate-400',
        iconName: 'missing',
      };
  }
}
