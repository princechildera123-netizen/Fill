/**
 * FILL Intelligence Pipeline Coordinator
 *
 * Implements the complete 9-stage intelligent form lifecycle:
 * IMPORT
 * → EXTRACT
 * → DETECT FIELDS
 * → UNDERSTAND MEANING
 * → MATCH TO VAULT
 * → CALCULATE CONFIDENCE
 * → REVIEW
 * → LEARN
 * → GENERATE OUTPUT
 */

import {
  FormFieldInput,
  MatchResult,
  ExtractedField,
  FormDocument,
  VaultData,
  PipelineProgressEvent,
} from '../types/fill';
import { findCanonicalConcept } from './canonicalFields';
import { findLearnedMapping, recordLearnedMapping } from './memoryStorage';
import { querySemanticAi } from './geminiClient';
import { lookupVaultValue, lookupFieldTitle } from './vaultLookup';
import { calculateConfidence, getConfidenceThresholds } from './confidenceEngine';
import { processUploadedDocument } from './documentExtraction';
import { calculateFormSummary, generateFormOutputPackage } from './formGenerator';

export type PipelineProgressCallback = (event: PipelineProgressEvent) => void;

export interface PipelineExecutionOptions {
  sourceType: 'demo' | 'pdf' | 'image' | 'scan';
  fileName: string;
  documentTitle?: string;
  rawInputs?: FormFieldInput[];
  uploadedFile?: File;
  onProgress?: PipelineProgressCallback;
}

export interface PipelineExecutionResult {
  formDocument: FormDocument;
  extractedFields: ExtractedField[];
  unconfidentSections: string[];
  stagesCompleted: string[];
}

/**
 * Runs the primary intelligent pipeline from Input to Matched Vault Document
 */
export async function runFillIntelligencePipeline(
  options: PipelineExecutionOptions,
  vault: VaultData
): Promise<PipelineExecutionResult> {
  const { onProgress } = options;
  const stagesCompleted: string[] = [];

  const emit = (event: PipelineProgressEvent) => {
    stagesCompleted.push(event.stage);
    if (onProgress) {
      onProgress(event);
    }
  };

  // ----------------------------------------------------
  // STAGE 1 & 2: IMPORT & EXTRACT
  // ----------------------------------------------------
  emit({
    stage: 'import',
    label: 'Importing document...',
    progressPercent: 10,
    details: `Source: ${options.sourceType.toUpperCase()} - ${options.fileName}`,
  });

  let rawInputs: FormFieldInput[] = [];
  let unconfidentSections: string[] = [];
  let docTitle = options.documentTitle || options.fileName.replace(/\.[^/.]+$/, '');

  if (options.uploadedFile) {
    emit({
      stage: 'extract',
      label: 'Extracting document layout and fields...',
      progressPercent: 25,
      details: 'Analyzing text blocks, tables, and bounding contexts',
    });

    const docResult = await processUploadedDocument(options.uploadedFile);
    rawInputs = docResult.rawInputs;
    unconfidentSections = docResult.unconfidentSections;
    if (!options.documentTitle && docResult.documentTitle) {
      docTitle = docResult.documentTitle;
    }
  } else if (options.rawInputs && options.rawInputs.length > 0) {
    rawInputs = options.rawInputs;
  }

  // ----------------------------------------------------
  // STAGE 3: DETECT FIELDS
  // ----------------------------------------------------
  emit({
    stage: 'detect_fields',
    label: `Detected ${rawInputs.length} interactive fields`,
    progressPercent: 40,
    details: `Mapped document regions into candidate inputs`,
  });

  const extractedFields: ExtractedField[] = [];
  const fieldsNeedingAi: FormFieldInput[] = [];

  // ----------------------------------------------------
  // STAGE 4: UNDERSTAND MEANING (Hybrid: Memory -> Canonical -> AI)
  // ----------------------------------------------------
  emit({
    stage: 'understand_meaning',
    label: 'Understanding semantic field meaning...',
    progressPercent: 60,
    details: 'Consulting FILL Memory and canonical concepts',
  });

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

  const intermediateMatches: IntermediateMatch[] = [];

  for (const field of rawInputs) {
    // Step 4A: Consult FILL Memory FIRST (Section 8 mandate)
    const remembered = findLearnedMapping(field.label);
    if (remembered) {
      const canonicalKey = remembered.confirmedVaultField || remembered.vaultKey || remembered.normalizedMeaning;
      const title = remembered.vaultFieldTitle || lookupFieldTitle(canonicalKey);

      intermediateMatches.push({
        input: field,
        canonicalKey,
        fieldTitle: title,
        source: 'learned',
        reasoning: `FILL remembered this field! Previously confirmed for: "${remembered.originalLabel || remembered.sourcePhrase}".`,
        isFromMemory: true,
      });
      continue;
    }

    // Step 4B: Consult Canonical Ontology & Synonyms (Section 3)
    const canonical = findCanonicalConcept(field.label, field.context);
    if (canonical && canonical.confidence >= 90) {
      intermediateMatches.push({
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

    // Otherwise mark for Gemini Semantic AI or fallback
    fieldsNeedingAi.push(field);
  }

  // Step 4C: Query Server-side Gemini for unmapped or ambiguous fields (Section 4)
  if (fieldsNeedingAi.length > 0) {
    const aiResponse = await querySemanticAi(fieldsNeedingAi);

    for (const field of fieldsNeedingAi) {
      const aiMatch = aiResponse.results.get(field.id);
      if (aiMatch && aiMatch.category) {
        intermediateMatches.push({
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

      // Step 4D: Safe Heuristic / Token fallback (Section 13)
      const tokenFallback = findCanonicalConcept(field.label, field.context);
      if (tokenFallback) {
        intermediateMatches.push({
          input: field,
          canonicalKey: tokenFallback.concept.vaultKey,
          fieldTitle: tokenFallback.concept.label,
          source: 'fallback',
          reasoning: tokenFallback.reason,
          strongSynonymMatch: true,
        });
      } else {
        intermediateMatches.push({
          input: field,
          canonicalKey: null,
          fieldTitle: 'Unclassified Field',
          source: 'fallback',
          reasoning: "FILL couldn't confidently understand this section. Please assign a Vault item manually.",
        });
      }
    }
  }

  // ----------------------------------------------------
  // STAGE 5 & 6: MATCH TO VAULT & CALCULATE CONFIDENCE
  // ----------------------------------------------------
  emit({
    stage: 'match_to_vault',
    label: 'Matching values with local FILL Vault...',
    progressPercent: 80,
    details: 'Dynamic retrieval & FILL Guard confidence scoring',
  });

  const finalMatchResults: MatchResult[] = intermediateMatches.map((item) => {
    // Dynamic Vault retrieval (Section 9 safety mandate)
    const currentValue = item.canonicalKey ? lookupVaultValue(vault, item.canonicalKey) : '';
    const hasVaultValue = Boolean(currentValue && currentValue.trim().length > 0);

    // Calculate transparent confidence
    const evaluation = calculateConfidence({
      learnedMapping: item.isFromMemory,
      exactCanonicalMatch: item.exactCanonicalMatch,
      strongSynonymMatch: item.strongSynonymMatch,
      semanticAiScore: item.aiScore,
      contextualAgreement: item.contextualAgreement,
      hasVaultValue: item.canonicalKey ? hasVaultValue : false,
      conflictingSignals: !item.canonicalKey,
    });

    const matchRes: MatchResult = {
      id: item.input.id,
      formFieldId: item.input.id,
      originalLabel: item.input.label,
      matchedVaultKey: item.canonicalKey,
      vaultFieldId: item.canonicalKey,
      suggestedFieldTitle: item.fieldTitle,
      currentValue,
      value: currentValue,
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

    // Populate extracted fields model as well
    extractedFields.push({
      id: item.input.id,
      originalLabel: item.input.label,
      nearbyContext: item.input.context || '',
      fieldType: (item.input.fieldType as any) || 'text',
      normalizedMeaning: item.canonicalKey || 'unmatched',
      detectedValue: currentValue,
      suggestedVaultField: item.canonicalKey || undefined,
      confidence: evaluation.score / 100,
      reasoning: item.reasoning,
      status: evaluation.level === 'high' ? 'matched' : evaluation.level === 'missing' ? 'missing' : 'needs_review',
    });

    return matchRes;
  });

  // ----------------------------------------------------
  // STAGE 7: REVIEW READY
  // ----------------------------------------------------
  emit({
    stage: 'review',
    label: 'Ready for applicant review',
    progressPercent: 95,
    details: `${finalMatchResults.filter((m) => m.confidenceLevel === 'high').length} high confidence matches, ${finalMatchResults.filter((m) => m.confidenceLevel === 'needs_review').length} need review`,
  });

  // Calculate summary and completion rate
  const summary = calculateFormSummary(finalMatchResults);

  const formDoc: FormDocument = {
    id: `form_${Date.now()}`,
    title: docTitle,
    fileName: options.fileName,
    sourceType: options.sourceType,
    importedAt: new Date().toISOString(),
    status: summary.unreviewedCount > 0 || summary.missingCount > 0 ? 'needs_review' : 'ready',
    fields: finalMatchResults,
    completionRate: summary.completionRate,
    summary: {
      total: summary.totalDetected,
      matched: summary.matchedCount,
      reviewed: summary.reviewedCount,
      needsReview: summary.unreviewedCount,
      missing: summary.missingCount,
    },
  };

  emit({
    stage: 'generate_output',
    label: 'Form pipeline complete',
    progressPercent: 100,
    details: 'Structure cached and ready for review',
  });

  return {
    formDocument: formDoc,
    extractedFields,
    unconfidentSections,
    stagesCompleted,
  };
}

/**
 * Learns a confirmed mapping from user review action (Stage 8)
 */
export function recordReviewConfirmation(
  originalLabel: string,
  vaultKey: string,
  fieldTitle: string
): void {
  recordLearnedMapping(originalLabel, vaultKey, fieldTitle);
}
