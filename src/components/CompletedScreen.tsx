import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Printer,
  Copy,
  PlusCircle,
  FileText,
  ShieldCheck,
  Check,
  Share2,
  BookmarkCheck,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { FormDocument, MatchResult } from '../types/fill';
import { exportFormAsPDF, exportFormAsJSON, copyFormSummaryToClipboard, shareFormSummary } from '../services/formGenerator';
import { saveFormDocument } from '../services/historyStorage';

interface CompletedScreenProps {
  form: FormDocument;
  onFillAnotherForm: () => void;
  onNavigateToHistory: () => void;
  onBackToReview?: () => void;
  onUpdateForm?: (updated: FormDocument) => void;
}

export const CompletedScreen: React.FC<CompletedScreenProps> = ({
  form,
  onFillAnotherForm,
  onNavigateToHistory,
  onBackToReview,
  onUpdateForm,
}) => {
  const [copied, setCopied] = useState(false);
  const [savedToFill, setSavedToFill] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Section 16: Inline Editing in Preview
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const matchedCount = form.fields.filter(
    (f) => f.currentValue && f.status !== 'skipped' && !f.isSkipped
  ).length;
  const reviewedCount = form.fields.filter((f) => f.status === 'confirmed').length;
  const missingCount = form.fields.filter(
    (f) => (!f.currentValue || f.confidenceLevel === 'missing') && f.status !== 'skipped' && !f.isSkipped
  ).length;

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      await exportFormAsPDF(form);
      triggerToast('✓ Completed PDF downloaded successfully');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      triggerToast('Could not generate PDF. Please try Print/Save as PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveToFill = () => {
    const updated: FormDocument = {
      ...form,
      status: 'exported',
      lastModifiedAt: new Date().toISOString(),
    };
    saveFormDocument(updated);
    if (onUpdateForm) {
      onUpdateForm(updated);
    }
    setSavedToFill(true);
    triggerToast('✓ Form successfully saved in Forms History');
  };

  const handleShare = async () => {
    const res = await shareFormSummary(form);
    if (res === 'shared') {
      triggerToast('Shared successfully!');
    } else if (res === 'copied') {
      triggerToast('Summary copied to clipboard for sharing!');
    } else {
      triggerToast('Share not supported on this browser.');
    }
  };

  const handleCopyClipboard = async () => {
    const ok = await copyFormSummaryToClipboard(form);
    if (ok) {
      setCopied(true);
      triggerToast('✓ Answers copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Section 16: Save Edit in Completed Preview
  const handleSaveInlineEdit = (fieldId: string) => {
    const updatedFields = form.fields.map((f) => {
      if (f.id === fieldId) {
        return {
          ...f,
          currentValue: editInputValue.trim(),
          updatedForForm: true,
          status: 'confirmed' as const,
        };
      }
      return f;
    });

    const updatedDoc: FormDocument = {
      ...form,
      fields: updatedFields,
      lastModifiedAt: new Date().toISOString(),
    };

    saveFormDocument(updatedDoc);
    if (onUpdateForm) {
      onUpdateForm(updatedDoc);
    }
    setEditingFieldId(null);
    triggerToast('✓ Field updated for this form');
  };

  const isImageSource = form.sourceType === 'image' || form.sourceType === 'scan';

  return (
    <div id="fill-completed-screen" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Your form is ready (Section 8) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs text-center relative overflow-hidden">
        {onBackToReview && (
          <button
            onClick={onBackToReview}
            className="absolute left-6 top-6 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Review Fields</span>
          </button>
        )}

        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          Your form is ready.
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {form.title}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6 pt-6 border-t border-slate-100 text-left">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Completion
            </span>
            <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
              {form.completionRate}%
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Matched Fields
            </span>
            <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
              {matchedCount} / {form.fields.length}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Verified
            </span>
            <span className="text-xl font-extrabold text-emerald-600 block mt-0.5">
              {reviewedCount}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Missing
            </span>
            <span className={`text-xl font-extrabold block mt-0.5 ${missingCount > 0 ? 'text-amber-500' : 'text-slate-900'}`}>
              {missingCount}
            </span>
          </div>
        </div>

        {/* Section 8: Action Buttons Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mt-7">
          <button
            id="completed-export-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Download completed PDF"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPDF ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>

          <button
            id="completed-save-fill-btn"
            onClick={handleSaveToFill}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs flex items-center gap-2 cursor-pointer ${
              savedToFill
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Save to Forms History"
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <span>{savedToFill ? 'Saved to FILL ✓' : 'Save to FILL'}</span>
          </button>

          <button
            id="completed-share-btn"
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            title="Share completed form summary"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            <span>Share</span>
          </button>

          <button
            onClick={handleCopyClipboard}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Copy answers to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={() => exportFormAsJSON(form)}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Download JSON data package"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onFillAnotherForm}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>+ Fill Another Form</span>
          </button>
        </div>

        {/* Section 19: Privacy Assurance */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>FILL prepares your form. Forms are never automatically submitted to third-party websites.</span>
        </div>
      </div>

      {/* Section 9: Image-Based Form Notice if applicable */}
      {isImageSource && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 text-xs text-amber-900">
            <h4 className="font-bold">Image-Based Document Detected</h4>
            <p className="text-amber-700">
              For scanned photos or screenshot forms, FILL extracts the fields and generates this official structured document. Original image pixels are preserved untouched, and the completed form can be printed or exported as a clean PDF.
            </p>
          </div>
        </div>
      )}

      {/* Realistic Document Preview (Section 7) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Document Preview (Official Layout)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>{form.fileName}</span>
            <span>&bull;</span>
            <button
              onClick={() => window.print()}
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>
          </div>
        </div>

        {/* Formal Document Sheet */}
        <div className="p-8 sm:p-12 font-sans space-y-8 max-w-3xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Official Application Document
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {form.title}
              </h2>
            </div>
            <div className="text-right sm:self-end text-xs text-slate-500 font-mono">
              Date: {new Date(form.importedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Form Fields Rendered as Formal Sections with Section 16 Inline Edit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {form.fields.map((field) => {
              const isSkipped = field.status === 'skipped' || field.isSkipped;
              const isEditing = editingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  className={`border-b border-slate-200 pb-2 relative group ${
                    isSkipped ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {field.originalLabel}
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingFieldId(field.id);
                          setEditInputValue(field.currentValue || '');
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer transition-opacity"
                        title="Edit answer before export"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {/* Section 16: Inline Edit Mode */}
                  {isEditing ? (
                    <div className="mt-1 space-y-1.5 animate-in fade-in">
                      <input
                        type="text"
                        value={editInputValue}
                        onChange={(e) => setEditInputValue(e.target.value)}
                        className="w-full text-xs font-semibold px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        autoFocus
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSaveInlineEdit(field.id)}
                          className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-slate-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingFieldId(null)}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-slate-900 mt-0.5 flex items-center justify-between">
                      {isSkipped ? (
                        <span className="italic text-slate-400">[Skipped by applicant]</span>
                      ) : field.currentValue ? (
                        <span>{field.currentValue}</span>
                      ) : (
                        <span className="italic text-rose-500">[Missing information]</span>
                      )}

                      {/* Section 16 Badge */}
                      {field.updatedForForm && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          Updated for this form
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Document Sign-off Footer */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
            <span>Prepared with FILL &bull; Privacy-first Intelligent Form Completion</span>
            <span>Applicant verified &bull; Ready for final submission</span>
          </div>
        </div>
      </div>

      {/* Raw Structured Data Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <span>View Structured Mapping Payload (JSON)</span>
          {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRawJson && (
          <pre className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72">
            {JSON.stringify(
              {
                id: form.id,
                title: form.title,
                sourceType: form.sourceType,
                completionRate: `${form.completionRate}%`,
                fields: form.fields.map((f) => ({
                  formLabel: f.originalLabel,
                  vaultKey: f.matchedVaultKey,
                  answer: f.currentValue,
                  score: f.confidenceScore,
                  status: f.status,
                  isFromMemory: f.isFromMemory,
                  updatedForForm: f.updatedForForm,
                })),
              },
              null,
              2
            )}
          </pre>
        )}
      </div>
    </div>
  );
};
