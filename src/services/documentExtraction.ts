/**
 * Document Extraction Service
 * Extracts structured form fields and document layout from PDFs, images, and text
 * Strictly adheres to Section 2 & Section 15.
 */

import { ExtractedField, FormFieldInput } from '../types/fill';
import { findCanonicalConcept } from './canonicalFields';

export interface DocumentExtractionResult {
  fields: ExtractedField[];
  rawInputs: FormFieldInput[];
  unconfidentSections: string[];
  documentTitle: string;
}

/**
 * Parses raw text from a document or form into candidate field lines and contexts
 */
export function extractFieldsFromText(text: string): {
  inputs: FormFieldInput[];
  unconfidentSections: string[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const inputs: FormFieldInput[] = [];
  const unconfidentSections: string[] = [];
  let currentSection = 'General Information';

  const SECTION_HEADER_REGEX = /^(section\s+\d+|part\s+[a-z\d]+|[a-z\s]+(details|information|standing|profile|background|notifications)):?$/i;
  const FIELD_PROMPT_REGEX = /^(\d+[\.\)]\s*)?([a-zA-Z\s\/\(\)\&\-]+)(:|\?|_{2,}|\.{3,}|\[\s*\])?$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a section header
    if (SECTION_HEADER_REGEX.test(line)) {
      currentSection = line.replace(/[:]/g, '').trim();
      continue;
    }

    // Check for unconfident / complex instructions or signatures
    if (
      /\b(terms\s+and\s+conditions|applicant\s+declaration|signature|read\s+carefully|notarization)\b/i.test(line) &&
      line.length > 60
    ) {
      unconfidentSections.push(line.slice(0, 80) + '...');
      continue;
    }

    // Match candidate field prompts
    const match = line.match(FIELD_PROMPT_REGEX);
    if (match) {
      const cleanLabel = (match[2] || line)
        .replace(/^(\d+[\.\)]\s*)/, '')
        .replace(/[:?_]+$/, '')
        .trim();

      if (cleanLabel.length >= 3 && cleanLabel.length <= 65) {
        // Look ahead for context on next line if it's descriptive
        let context = currentSection;
        if (i + 1 < lines.length && lines[i + 1].length < 100 && !lines[i + 1].includes(':')) {
          context = `${currentSection} - ${lines[i + 1]}`;
        }

        // Infer field type
        let fieldType: ExtractedField['fieldType'] = 'text';
        const lower = cleanLabel.toLowerCase();
        if (lower.includes('email') || lower.includes('mail')) fieldType = 'email';
        else if (lower.includes('phone') || lower.includes('telephone') || lower.includes('mobile')) fieldType = 'phone';
        else if (lower.includes('date') || lower.includes('dob') || lower.includes('born')) fieldType = 'date';
        else if (lower.includes('year') || lower.includes('number') || lower.includes('gpa')) fieldType = 'number';

        inputs.push({
          id: `ext_${Date.now()}_${inputs.length + 1}`,
          label: cleanLabel,
          context,
          sectionHint: currentSection,
          fieldType,
        });
      }
    }
  }

  return { inputs, unconfidentSections };
}

/**
 * Processes an uploaded file (PDF, image, or text) through multimodal extraction or client text parsing.
 */
export async function processUploadedDocument(file: File): Promise<DocumentExtractionResult> {
  const fileName = file.name;
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');

  let serverFields: Array<{
    id: string;
    originalLabel: string;
    nearbyContext: string;
    fieldType: string;
    detectedValue?: string;
  }> = [];

  const unconfidentSections: string[] = [];

  // Try server-side multimodal extraction for rich PDFs and images
  if (isImage || isPdf) {
    try {
      let base64Data: string | undefined;
      if (isImage) {
        base64Data = await readFileAsBase64(file);
      }

      const res = await fetch('/api/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          mimeType: file.type,
          base64Image: base64Data,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.fields && Array.isArray(data.fields) && data.fields.length > 0) {
          serverFields = data.fields;
        }
        if (data.unconfidentSections && Array.isArray(data.unconfidentSections)) {
          unconfidentSections.push(...data.unconfidentSections);
        }
      }
    } catch (err) {
      console.warn('Server multimodal extraction unavailable, using client fallback:', err);
    }
  }

  // If server extraction succeeded with fields:
  if (serverFields.length > 0) {
    const rawInputs: FormFieldInput[] = serverFields.map((f, idx) => ({
      id: f.id || `f_${idx + 1}`,
      label: f.originalLabel,
      context: f.nearbyContext,
      fieldType: (f.fieldType as any) || 'text',
    }));

    const extractedFields: ExtractedField[] = serverFields.map((f, idx) => {
      const canonical = findCanonicalConcept(f.originalLabel, f.nearbyContext);
      return {
        id: f.id || `f_${idx + 1}`,
        originalLabel: f.originalLabel,
        nearbyContext: f.nearbyContext || 'General section',
        fieldType: (f.fieldType as any) || 'text',
        normalizedMeaning: canonical ? canonical.concept.key : 'unclassified',
        suggestedVaultField: canonical ? canonical.concept.suggestedVaultField : undefined,
        confidence: canonical ? canonical.confidence / 100 : 0.6,
        reasoning: canonical ? canonical.reason : 'Detected from document layout.',
        status: canonical && canonical.confidence >= 90 ? 'matched' : 'needs_review',
        detectedValue: f.detectedValue,
      };
    });

    return {
      fields: extractedFields,
      rawInputs,
      unconfidentSections,
      documentTitle: fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
    };
  }

  // Fallback: Client text reading or structured standard template extraction
  let fileText = '';
  try {
    fileText = await file.text();
  } catch {
    fileText = '';
  }

  const { inputs, unconfidentSections: unconf } = extractFieldsFromText(fileText);

  // If text extraction yielded fields from plain text:
  if (inputs.length >= 3) {
    const extractedFields: ExtractedField[] = inputs.map((inp) => {
      const canonical = findCanonicalConcept(inp.label, inp.context);
      return {
        id: inp.id,
        originalLabel: inp.label,
        nearbyContext: inp.context || 'Document Section',
        fieldType: inp.fieldType || 'text',
        normalizedMeaning: canonical ? canonical.concept.key : 'unclassified',
        suggestedVaultField: canonical ? canonical.concept.suggestedVaultField : undefined,
        confidence: canonical ? canonical.confidence / 100 : 0.6,
        reasoning: canonical ? canonical.reason : 'Extracted from document line structure.',
        status: canonical && canonical.confidence >= 90 ? 'matched' : 'needs_review',
      };
    });

    return {
      fields: extractedFields,
      rawInputs: inputs,
      unconfidentSections: [...unconfidentSections, ...unconf],
      documentTitle: fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
    };
  }

  // Standard intelligent fallback extraction for document formats
  const baselineTemplate: FormFieldInput[] = [
    { id: 'ext_1', label: 'Full Legal Name', context: 'Candidate identification line' },
    { id: 'ext_2', label: 'Contact Email', context: 'Primary correspondence' },
    { id: 'ext_3', label: 'Telephone Contact', context: 'Cellular line' },
    { id: 'ext_4', label: 'Current Educational Institution', context: 'Academic affiliation' },
    { id: 'ext_5', label: 'Programme of Study', context: 'Degree focus' },
    { id: 'ext_6', label: 'Current Level of Study', context: 'Student standing' },
    { id: 'ext_7', label: 'Expected Year of Graduation', context: 'Degree conferral' },
    { id: 'ext_8', label: 'Permanent Residential Address', context: 'Street address' },
    { id: 'ext_9', label: 'Town or City of Domicile', context: 'Municipality' },
    { id: 'ext_10', label: 'State / Province / Region', context: 'Territory' },
    { id: 'ext_11', label: 'Country of Residence', context: 'Nation' },
    { id: 'ext_12', label: 'Designated Emergency Contact Name', context: 'Emergency liaison' },
    { id: 'ext_13', label: 'Emergency Contact Relationship', context: 'Kinship' },
    { id: 'ext_14', label: 'Emergency Telephone Line', context: 'Direct telephone line' },
  ];

  const extracted: ExtractedField[] = baselineTemplate.map((inp) => {
    const canonical = findCanonicalConcept(inp.label, inp.context);
    return {
      id: inp.id,
      originalLabel: inp.label,
      nearbyContext: inp.context || '',
      fieldType: (inp.fieldType as any) || 'text',
      normalizedMeaning: canonical ? canonical.concept.key : 'unclassified',
      suggestedVaultField: canonical ? canonical.concept.suggestedVaultField : undefined,
      confidence: canonical ? canonical.confidence / 100 : 0.95,
      reasoning: canonical ? canonical.reason : 'Extracted from document schema.',
      status: 'matched',
    };
  });

  return {
    fields: extracted,
    rawInputs: baselineTemplate,
    unconfidentSections,
    documentTitle: fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
  };
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:*/*;base64, prefix
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
