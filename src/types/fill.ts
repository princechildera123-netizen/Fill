/**
 * FILL Data Types & Domain Models
 * Privacy-first intelligent form completion architecture
 */

export type ConfidenceLevel = 'high' | 'needs_review' | 'low' | 'missing';

export type MatchSource = 'deterministic' | 'semantic' | 'semantic_ai' | 'learned' | 'learned_memory' | 'fallback' | 'manual';

export type ReviewStatus = 'unreviewed' | 'confirmed' | 'changed' | 'skipped';

export interface VaultIdentity {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  dob: string; // YYYY-MM-DD
}

export interface VaultContact {
  email: string;
  phone: string;
}

export interface VaultEducation {
  school: string;
  course: string;
  level: string; // e.g. Undergraduate, High School, Postgraduate
  gradYear: string;
}

export interface VaultAddress {
  country: string;
  state: string;
  city: string;
  street: string;
}

export interface VaultEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface VaultData {
  identity: VaultIdentity;
  contact: VaultContact;
  education: VaultEducation;
  address: VaultAddress;
  emergency: VaultEmergencyContact;
}

export interface VaultFieldMeta {
  key: string; // dot notation, e.g. "education.school"
  category: 'Identity' | 'Contact' | 'Education' | 'Address' | 'Emergency Contact';
  label: string;
  description: string;
  placeholder: string;
  type?: 'text' | 'email' | 'tel' | 'date';
}

export interface FormFieldInput {
  id: string;
  label: string;
  context?: string;
  sectionHint?: string;
  fieldType?: 'text' | 'email' | 'tel' | 'phone' | 'date' | 'select' | 'checkbox' | 'number';
}

/** Structured Extracted Field as required by Section 2 */
export interface ExtractedField {
  id: string;
  originalLabel: string;
  nearbyContext: string;
  fieldType: 'text' | 'email' | 'phone' | 'tel' | 'date' | 'select' | 'checkbox' | 'number';
  normalizedMeaning: string;
  detectedValue?: string;
  suggestedVaultField?: string;
  confidence: number;
  reasoning: string;
  status: 'matched' | 'needs_review' | 'missing' | 'unmatched';
}

/** Match Result object with transparent scoring and reasoning */
export interface MatchResult {
  id: string;
  formFieldId?: string; // alias for id
  originalLabel: string;
  matchedVaultKey: string | null;
  vaultFieldId?: string | null; // alias for matchedVaultKey
  suggestedFieldTitle: string;
  currentValue: string;
  value?: string; // alias for currentValue
  confidenceScore: number; // 0 to 100
  confidence?: number; // 0 to 100 or 0.0 to 1.0
  confidenceLevel: ConfidenceLevel;
  source: MatchSource;
  reasoning: string;
  reason?: string; // alias for reasoning
  requiresReview?: boolean;
  status: ReviewStatus;
  isFromMemory?: boolean;
  normalizedMeaning?: string;
  nearbyContext?: string;
  updatedForForm?: boolean; // Section 16: "Updated for this form"
  manualOverride?: boolean; // Section 4: User manually entered/picked
  isSkipped?: boolean; // Section 2: User skipped field
  validationError?: string; // Section 6: Validation warning or format issue
  originalValueBeforeEdit?: string; // To detect local edits
}

/** Persistent Learned Mapping Model conforming to Section 8 & 9 */
export interface LearnedMapping {
  id: string;
  sourcePhrase: string; // original and normalized phrase
  normalizedMeaning: string; // e.g. "education.school"
  confirmedVaultField: string; // e.g. "education.school"
  confirmationCount: number;
  createdAt: number;
  updatedAt: number;

  // Compatibility aliases
  normalizedLabel?: string;
  originalLabel?: string;
  vaultKey?: string;
  vaultFieldTitle?: string;
  confirmedAt?: number;
  useCount?: number;
}

export type FormStatus =
  | 'imported'
  | 'analyzing'
  | 'review'
  | 'ready'
  | 'exported'
  | 'needs_review'
  | 'in_progress';

export interface FormDocument {
  id: string;
  title: string;
  sourceType: 'demo' | 'pdf' | 'image' | 'scan';
  fileName: string;
  importedAt: number | string;
  lastModifiedAt?: number | string;
  status: FormStatus;
  fields: MatchResult[];
  completionRate: number;
  summary?: {
    total: number;
    matched: number;
    reviewed: number;
    needsReview: number;
    missing: number;
  };
  validationErrorsCount?: number;
  notes?: string;
}

export interface SemanticMatchResponseItem {
  id?: string;
  category?: string;
  label?: string;
  matchedVaultKey?: string | null;
  confidence: number; // 0 to 1
  short_reason?: string;
  reasoning?: string;
}

export type PipelineStage =
  | 'import'
  | 'extract'
  | 'detect_fields'
  | 'understand_meaning'
  | 'match_to_vault'
  | 'calculate_confidence'
  | 'review'
  | 'learn'
  | 'generate_output';

export interface PipelineProgressEvent {
  stage: PipelineStage;
  label: string;
  progressPercent: number;
  details?: string;
}
