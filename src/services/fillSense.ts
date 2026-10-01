/**
 * FILL Sense Intelligent Semantic Matching Engine
 *
 * Implements the hybrid semantic matching layers:
 * Layer 0: FILL Memory (Previously confirmed mappings - Section 8 & 10)
 * Layer 1: Canonical Ontology & Synonym Rules (Section 3)
 * Layer 2: Server-Side Gemini 3.8 Flash with Minimal Context (Section 4 & 14)
 * Layer 3: Deterministic & Heuristic Fallback (Section 13)
 *
 * Values are ALWAYS dynamically retrieved from the user's active Vault (Section 9 safety mandate).
 */

import {
  FormFieldInput,
  MatchResult,
  VaultData,
} from '../types/fill';
import { findCanonicalConcept } from './canonicalFields';
import { findLearnedMapping } from './memoryStorage';
import { querySemanticAi } from './geminiClient';
import { lookupVaultValue, lookupFieldTitle } from './vaultLookup';
import { calculateConfidence } from './confidenceEngine';

/**
 * Executes hybrid semantic matching across all form fields
 */
export async function matchFormFields(
  rawFields: FormFieldInput[],
  vault: VaultData
): Promise<MatchResult[]> {
  interface IntermediateMatch {
    input: FormFieldInput;
    canonicalKey: string | null;
    fieldTitle: string;
    source: MatchResult['source'];
    reasoning: string;
    isFromMemory?: boolean;
    exactCanonicalMatch?: boolean;
    strongSynonymMatch?: boolean;
    contextualAgreement?: boolean;
    aiScore?: number;
  }

  const intermediate: IntermediateMatch[] = [];
  const neededForAi: FormFieldInput[] = [];

  // Pass 1: FILL Memory & Canonical Ontology
  for (const field of rawFields) {
    // 1. Check FILL Memory FIRST (Section 8 mandate)
    const remembered = findLearnedMapping(field.label);
    if (remembered) {
      const canonicalKey = remembered.confirmedVaultField || remembered.vaultKey || remembered.normalizedMeaning;
      const title = remembered.vaultFieldTitle || lookupFieldTitle(canonicalKey);

      intermediate.push({
        input: field,
        canonicalKey,
        fieldTitle: title,
        source: 'learned',
        reasoning: `FILL remembered this field! Previously confirmed for: "${remembered.originalLabel || remembered.sourcePhrase}".`,
        isFromMemory: true,
      });
      continue;
    }

    // 2. Check Canonical Field Ontology and Synonym Rules (Section 3)
    const canonical = findCanonicalConcept(field.label, field.context);
    if (canonical && canonical.confidence >= 90) {
      intermediate.push({
        input: field,
        canonicalKey: canonical.concept.vaultKey,
        fieldTitle: canonical.concept.label,
        source: 'deterministic',
        reasoning: canonical.reason,
        exactCanonicalMatch: canonical.isExact,
        strongSynonymMatch: !canonical.isExact,
        contextualAgreement: Boolean(field.context && field.context.length > 0),
      });
      continue;
    }

    // Pass to Layer 2
    neededForAi.push(field);
  }

  // Pass 2: Gemini 3.8 Flash Semantic AI (Layer 2) with strict data minimization
  if (neededForAi.length > 0) {
    const aiResponse = await querySemanticAi(neededForAi);

    for (const field of neededForAi) {
      const aiMatch = aiResponse.results.get(field.id);
      if (aiMatch && aiMatch.category) {
        intermediate.push({
          input: field,
          canonicalKey: aiMatch.category,
          fieldTitle: lookupFieldTitle(aiMatch.category),
          source: 'semantic',
          reasoning: aiMatch.short_reason,
          aiScore: aiMatch.confidence,
          contextualAgreement: Boolean(field.context),
        });
        continue;
      }

      // Layer 3: Heuristic Fallback (Section 13)
      const tokenFallback = findCanonicalConcept(field.label, field.context);
      if (tokenFallback) {
        intermediate.push({
          input: field,
          canonicalKey: tokenFallback.concept.vaultKey,
          fieldTitle: tokenFallback.concept.label,
          source: 'fallback',
          reasoning: tokenFallback.reason,
          strongSynonymMatch: true,
        });
      } else {
        intermediate.push({
          input: field,
          canonicalKey: null,
          fieldTitle: 'Unclassified Field',
          source: 'fallback',
          reasoning: "FILL couldn't confidently understand this section. Please assign a Vault item manually.",
        });
      }
    }
  }

  // Pass 3: Dynamic Vault Value Lookup & Transparent Confidence Calculation
  const finalResults: MatchResult[] = intermediate.map((item) => {
    // Dynamic live lookup from Vault (Section 9)
    const vaultValue = item.canonicalKey ? lookupVaultValue(vault, item.canonicalKey) : '';
    const hasVaultValue = Boolean(vaultValue && vaultValue.trim().length > 0);

    // Calculate transparent score based on real signals (Section 6)
    const evaluation = calculateConfidence({
      learnedMapping: item.isFromMemory,
      exactCanonicalMatch: item.exactCanonicalMatch,
      strongSynonymMatch: item.strongSynonymMatch,
      semanticAiScore: item.aiScore,
      contextualAgreement: item.contextualAgreement,
      hasVaultValue: item.canonicalKey ? hasVaultValue : false,
      conflictingSignals: !item.canonicalKey,
    });

    return {
      id: item.input.id,
      formFieldId: item.input.id,
      originalLabel: item.input.label,
      matchedVaultKey: item.canonicalKey,
      vaultFieldId: item.canonicalKey,
      suggestedFieldTitle: item.fieldTitle,
      currentValue: vaultValue,
      value: vaultValue,
      confidenceScore: evaluation.score,
      confidence: evaluation.score,
      confidenceLevel: evaluation.level,
      source: item.source,
      reasoning: item.reasoning,
      reason: item.reasoning,
      requiresReview: evaluation.requiresReview,
      status: evaluation.level === 'high' ? 'confirmed' : 'unreviewed',
      isFromMemory: item.isFromMemory,
      normalizedMeaning: item.canonicalKey || undefined,
      nearbyContext: item.input.context,
    };
  });

  return finalResults;
}

export const performHybridMatch = matchFormFields;
