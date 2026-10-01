/**
 * Form Generator & Output Service
 * Compiles matched and reviewed field values into structured, printable, and exportable formats
 * Adheres to Requirement 7, 8, 9 & Section 16 & Section 9.
 */

import { jsPDF } from 'jspdf';
import { FormDocument, MatchResult } from '../types/fill';

export interface GeneratedFormSummary {
  totalDetected: number;
  matchedCount: number;
  reviewedCount: number;
  missingCount: number;
  unreviewedCount: number;
  completionRate: number;
  isReady: boolean;
}

export interface GeneratedOutputPackage {
  meta: {
    formId: string;
    formTitle: string;
    fileName: string;
    generatedAt: string;
    completionPercentage: number;
    exportFormat: 'fill_form_package_v1';
  };
  summary: GeneratedFormSummary;
  fields: Array<{
    fieldId: string;
    label: string;
    value: string;
    canonicalConcept: string;
    vaultKey: string | null;
    confidence: number;
    matchSource: string;
    status: string;
  }>;
}

/**
 * Calculates official summary stats for completed form output
 */
export function calculateFormSummary(matches: MatchResult[]): GeneratedFormSummary {
  const totalDetected = matches.length;
  let matchedCount = 0;
  let reviewedCount = 0;
  let missingCount = 0;
  let unreviewedCount = 0;

  for (const m of matches) {
    if (m.status === 'skipped' || m.isSkipped) {
      continue;
    }

    if (m.confidenceLevel === 'missing' && !m.currentValue) {
      missingCount++;
    } else if (m.status === 'confirmed') {
      reviewedCount++;
      matchedCount++;
    } else if (m.currentValue) {
      matchedCount++;
    } else {
      unreviewedCount++;
    }
  }

  const filledCount = matches.filter((m) => Boolean(m.currentValue && m.status !== 'skipped' && !m.isSkipped)).length;
  const completionRate = totalDetected > 0 ? Math.round((filledCount / totalDetected) * 100) : 0;
  const isReady = missingCount === 0 && unreviewedCount === 0;

  return {
    totalDetected,
    matchedCount,
    reviewedCount,
    missingCount,
    unreviewedCount,
    completionRate,
    isReady,
  };
}

/**
 * Generates an exportable JSON package of the completed application
 */
export function generateFormOutputPackage(form: FormDocument): GeneratedOutputPackage {
  const summary = calculateFormSummary(form.fields);

  return {
    meta: {
      formId: form.id,
      formTitle: form.title,
      fileName: form.fileName,
      generatedAt: new Date().toISOString(),
      completionPercentage: summary.completionRate,
      exportFormat: 'fill_form_package_v1',
    },
    summary,
    fields: form.fields.map((f) => ({
      fieldId: f.id,
      label: f.originalLabel,
      value: f.currentValue || '',
      canonicalConcept: f.normalizedMeaning || f.suggestedFieldTitle,
      vaultKey: f.matchedVaultKey,
      confidence: f.confidenceScore,
      matchSource: f.source,
      status: f.status,
    })),
  };
}

/**
 * Generates and downloads a real, beautifully formatted completed PDF document using jsPDF.
 * Preserves document metadata, structured field layout, and formal styling.
 */
export async function exportFormAsPDF(form: FormDocument): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkSlate = [15, 23, 42]; // #0f172a
  const midSlate = [71, 85, 105]; // #475569
  const lightSlate = [241, 245, 249]; // #f1f5f9
  const accentIndigo = [79, 70, 229]; // #4f46e5

  let currentY = 22;

  // Top Accent Bar
  doc.setFillColor(accentIndigo[0], accentIndigo[1], accentIndigo[2]);
  doc.rect(margin, currentY, contentWidth, 2, 'F');
  currentY += 8;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(form.title, margin, currentY);
  currentY += 6;

  // Subheader / Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(midSlate[0], midSlate[1], midSlate[2]);
  doc.text('Prepared with FILL — Privacy-first Intelligent Form Completion', margin, currentY);

  // Right-aligned status stamp
  const summary = calculateFormSummary(form.fields);
  const statusStamp = `${summary.completionRate}% Completed • ${summary.matchedCount}/${summary.totalDetected} Fields`;
  doc.setFont('helvetica', 'bold');
  doc.text(statusStamp, pageWidth - margin, currentY, { align: 'right' });
  currentY += 6;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Metadata block
  doc.setFillColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(midSlate[0], midSlate[1], midSlate[2]);
  doc.text(`Original File: ${form.fileName}`, margin + 4, currentY + 5.5);
  doc.text(`Source Type: ${form.sourceType.toUpperCase()} Document`, margin + 4, currentY + 10.5);

  const exportDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`Prepared: ${exportDate}`, pageWidth - margin - 4, currentY + 5.5, { align: 'right' });
  doc.text(`Status: Verified by Applicant`, pageWidth - margin - 4, currentY + 10.5, { align: 'right' });

  currentY += 20;

  // Table Header
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('FORM FIELD QUESTION', margin + 3, currentY + 4.8);
  doc.text('PREPARED APPLICANT ANSWER', margin + 85, currentY + 4.8);
  doc.text('STATUS', pageWidth - margin - 3, currentY + 4.8, { align: 'right' });

  currentY += 7;

  // Field Rows
  form.fields.forEach((field, index) => {
    // Page overflow protection
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;

      // Repeat Table Header
      doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.rect(margin, currentY, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('FORM FIELD QUESTION', margin + 3, currentY + 4.8);
      doc.text('PREPARED APPLICANT ANSWER', margin + 85, currentY + 4.8);
      doc.text('STATUS', pageWidth - margin - 3, currentY + 4.8, { align: 'right' });
      currentY += 7;
    }

    // Row alternating background
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, 10, 'F');
    }

    // Border line bottom
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 10, pageWidth - margin, currentY + 10);

    // Left Column: Original Form Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    const cleanLabel = doc.splitTextToSize(field.originalLabel, 78);
    doc.text(cleanLabel, margin + 3, currentY + 4.5);

    // Context / Interpretation subtitle
    if (field.suggestedFieldTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(midSlate[0], midSlate[1], midSlate[2]);
      doc.text(`FILL: ${field.suggestedFieldTitle}`, margin + 3, currentY + 8);
    }

    // Middle Column: Prepared Answer
    const isSkipped = field.status === 'skipped' || field.isSkipped;
    const answerVal = isSkipped ? '[Skipped]' : (field.currentValue || '[Not Provided]');

    doc.setFont('helvetica', isSkipped ? 'italic' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(isSkipped ? 148 : darkSlate[0], isSkipped ? 163 : darkSlate[1], isSkipped ? 184 : darkSlate[2]);
    const cleanAnswer = doc.splitTextToSize(answerVal, 75);
    doc.text(cleanAnswer, margin + 85, currentY + 6);

    // Right Column: Confidence / Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    if (field.status === 'confirmed') {
      doc.setTextColor(16, 185, 129); // emerald
      doc.text('VERIFIED', pageWidth - margin - 3, currentY + 6, { align: 'right' });
    } else if (field.confidenceScore >= 90) {
      doc.setTextColor(79, 70, 229); // indigo
      doc.text(`${field.confidenceScore}%`, pageWidth - margin - 3, currentY + 6, { align: 'right' });
    } else if (isSkipped) {
      doc.setTextColor(148, 163, 184); // slate
      doc.text('SKIPPED', pageWidth - margin - 3, currentY + 6, { align: 'right' });
    } else {
      doc.setTextColor(245, 158, 11); // amber
      doc.text(`${field.confidenceScore}%`, pageWidth - margin - 3, currentY + 6, { align: 'right' });
    }

    currentY += 10;
  });

  // Footer notes & signature space
  currentY += 8;
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 25;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(midSlate[0], midSlate[1], midSlate[2]);
  doc.text('I hereby confirm that the information provided above is accurate, verified, and ready for official submission.', margin, currentY);

  currentY += 12;
  // Signature line
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, currentY, margin + 60, currentY);
  doc.line(pageWidth - margin - 60, currentY, pageWidth - margin, currentY);
  currentY += 4;
  doc.setFontSize(7);
  doc.text('Applicant Signature', margin, currentY);
  doc.text('Date', pageWidth - margin - 60, currentY);

  // Save the document
  const safeName = form.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`FILL_${safeName}_Completed.pdf`);
}

/**
 * Downloads the completed form as a JSON file package
 */
export function exportFormAsJSON(form: FormDocument): void {
  const pkg = generateFormOutputPackage(form);
  const jsonStr = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = form.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `FILL_${safeName}_Completed_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies structured summary text of the form to the clipboard
 */
export async function copyFormSummaryToClipboard(form: FormDocument): Promise<boolean> {
  try {
    const summary = calculateFormSummary(form.fields);
    let text = `========================================\n`;
    text += `${form.title.toUpperCase()}\n`;
    text += `Prepared by FILL — Your information. One time.\n`;
    text += `Completion: ${summary.completionRate}% (${summary.matchedCount}/${summary.totalDetected} fields completed)\n`;
    text += `========================================\n\n`;

    for (const f of form.fields) {
      if (f.status === 'skipped' || f.isSkipped) continue;
      text += `${f.originalLabel}:\n  ${f.currentValue || '[Empty]'}\n\n`;
    }

    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Shares the form using the Web Share API or fallbacks
 */
export async function shareFormSummary(form: FormDocument): Promise<'shared' | 'copied' | 'error'> {
  const summary = calculateFormSummary(form.fields);
  const shareData = {
    title: `FILL: ${form.title}`,
    text: `Completed "${form.title}" with FILL (${summary.completionRate}% complete).`,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return 'shared';
    } catch {
      // User cancelled or share failed, fallback to copy
    }
  }

  const copied = await copyFormSummaryToClipboard(form);
  return copied ? 'copied' : 'error';
}
