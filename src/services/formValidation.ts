/**
 * Form Validation Service
 * Conforms to Requirement 6: Form Validation
 *
 * Checks:
 * - Missing values on fields that are not explicitly skipped
 * - Unreviewed low-confidence fields
 * - Email format validation
 * - Phone format validation
 * - Missing required information
 */

import { MatchResult } from '../types/fill';

export interface ValidationIssue {
  fieldId: string;
  label: string;
  type: 'missing' | 'unreviewed' | 'invalid_email' | 'invalid_phone' | 'format';
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  canExport: boolean;
  isIncomplete: boolean;
  attentionCount: number;
  statusLabel: 'Ready to export' | 'Review required' | 'Incomplete export';
  summaryMessage: string;
  issues: ValidationIssue[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MIN_DIGITS = 7;

export function validateFormFields(matches: MatchResult[]): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const m of matches) {
    if (m.status === 'skipped' || m.isSkipped) {
      continue;
    }

    const val = (m.currentValue || '').trim();
    const labelLower = m.originalLabel.toLowerCase();
    const isEmailField = labelLower.includes('email') || labelLower.includes('e-mail') || m.matchedVaultKey?.includes('email');
    const isPhoneField = labelLower.includes('phone') || labelLower.includes('telephone') || labelLower.includes('mobile') || labelLower.includes('cell') || m.matchedVaultKey?.includes('phone');

    // 1. Missing Value Check
    if (!val) {
      issues.push({
        fieldId: m.id,
        label: m.originalLabel,
        type: 'missing',
        message: 'No answer provided or matched from Vault',
        severity: 'warning',
      });
      continue;
    }

    // 2. Email format validation
    if (isEmailField && val) {
      if (!EMAIL_REGEX.test(val)) {
        issues.push({
          fieldId: m.id,
          label: m.originalLabel,
          type: 'invalid_email',
          message: `"${val}" does not look like a valid email address`,
          severity: 'error',
        });
      }
    }

    // 3. Phone format validation
    if (isPhoneField && val) {
      const digits = val.replace(/\D/g, '');
      if (digits.length < PHONE_MIN_DIGITS) {
        issues.push({
          fieldId: m.id,
          label: m.originalLabel,
          type: 'invalid_phone',
          message: `Phone number should have at least ${PHONE_MIN_DIGITS} digits`,
          severity: 'warning',
        });
      }
    }

    // 4. Unreviewed low-confidence check
    if (m.confidenceLevel === 'needs_review' && m.status !== 'confirmed') {
      issues.push({
        fieldId: m.id,
        label: m.originalLabel,
        type: 'unreviewed',
        message: 'Uncertain match requires user confirmation',
        severity: 'warning',
      });
    }
  }

  const attentionCount = issues.length;
  const hasErrors = issues.some((i) => i.severity === 'error');
  const hasMissing = issues.some((i) => i.type === 'missing');

  let statusLabel: ValidationResult['statusLabel'] = 'Ready to export';
  let summaryMessage = 'All form answers have been verified and are ready to export.';

  if (attentionCount > 0) {
    statusLabel = 'Review required';
    summaryMessage = attentionCount === 1
      ? '1 field still needs your attention.'
      : `${attentionCount} fields still need your attention.`;
  }

  const isIncomplete = hasMissing;
  const isValid = !hasErrors && attentionCount === 0;

  return {
    isValid,
    canExport: true, // Export is never hard-blocked if user chooses incomplete export
    isIncomplete,
    attentionCount,
    statusLabel: attentionCount > 0 ? (isIncomplete ? 'Review required' : 'Review required') : 'Ready to export',
    summaryMessage,
    issues,
  };
}
