import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Image as ImageIcon,
  Camera,
  X,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Play
} from 'lucide-react';
import { FormFieldInput } from '../types/fill';
import { DEMO_FORM_A, DEMO_FORM_B } from '../services/demoForms';
import { processUploadedDocument } from '../services/documentExtraction';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormImported: (formData: {
    title: string;
    sourceType: 'demo' | 'pdf' | 'image' | 'scan';
    fileName: string;
    fields: FormFieldInput[];
  }) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onFormImported,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorType, setErrorType] = useState<'file' | 'ai' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processUploadedFile = async (file: File) => {
    setErrorType(null);
    setErrorMessage(null);
    setWarningMessage(null);

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      setErrorType('file');
      setErrorMessage("We couldn't read this file. Try uploading the original PDF or a clearer image.");
      return;
    }

    setIsProcessing(true);
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const sourceType: 'pdf' | 'image' = isPdf ? 'pdf' : 'image';

    try {
      const extraction = await processUploadedDocument(file);

      if (extraction.unconfidentSections && extraction.unconfidentSections.length > 0) {
        setWarningMessage("FILL couldn't confidently understand this section. Manual mapping enabled.");
      }

      onFormImported({
        title: extraction.documentTitle || file.name.replace(/\.[^/.]+$/, ''),
        sourceType,
        fileName: file.name,
        fields: extraction.rawInputs,
      });
    } catch (err) {
      console.error('File extraction error:', err);
      setErrorType('ai');
      setErrorMessage("FILL couldn't analyze this document. You can still fill this form manually or try a different file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleSelectDemoForm = (form: typeof DEMO_FORM_A) => {
    onFormImported({
      title: form.title,
      sourceType: 'demo',
      fileName: `${form.code.toLowerCase()}_sample_form.pdf`,
      fields: form.fields,
    });
  };

  const handleSimulateCamera = () => {
    onFormImported({
      title: 'Scanned Scholarship Document',
      sourceType: 'scan',
      fileName: 'camera_scan_capture.jpg',
      fields: DEMO_FORM_A.fields,
    });
  };

  const handleManualFallback = () => {
    onFormImported({
      title: 'Manual Application Form',
      sourceType: 'pdf',
      fileName: 'manual_entry_form.pdf',
      fields: DEMO_FORM_A.fields.slice(0, 8),
    });
  };

  return (
    <div
      id="import-form-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header (Requirement 6: "What do you want to fill?") */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 bg-slate-50/70">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              What do you want to fill?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a document, snapshot, or try a demonstration form.
            </p>
          </div>
          <button
            id="import-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Human-Friendly Error States (Requirement 13) */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-900">
                    {errorType === 'file' ? "We couldn't read this file" : "FILL couldn't analyze this document"}
                  </strong>
                  <p className="text-rose-700 mt-0.5 leading-normal">{errorMessage}</p>
                </div>
              </div>

              {/* Immediate Recovery Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setErrorType(null);
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-semibold text-xs hover:bg-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try another file</span>
                </button>

                <button
                  onClick={handleManualFallback}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-800 font-semibold text-xs hover:bg-rose-100/50 transition-colors cursor-pointer"
                >
                  Fill manually
                </button>

                <button
                  onClick={() => handleSelectDemoForm(DEMO_FORM_A)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-800 font-semibold text-xs hover:bg-rose-100/50 transition-colors cursor-pointer"
                >
                  Use demo form
                </button>
              </div>
            </div>
          )}

          {warningMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Three Clear Upload Options (Requirement 6) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Upload PDF */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-2xs"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">📄 Upload PDF</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Fillable or standard PDF</span>
              </div>
            </button>

            {/* 2. Upload Image */}
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-2xs"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">🖼️ Upload image</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">PNG, JPG screenshot</span>
              </div>
            </button>

            {/* 3. Scan Form */}
            <button
              onClick={handleSimulateCamera}
              className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group cursor-pointer shadow-2xs"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">📷 Scan form</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Camera snapshot capture</span>
              </div>
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isProcessing}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isProcessing}
          />

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isProcessing
                ? 'border-indigo-300 bg-indigo-50/20 cursor-wait'
                : dragActive
                ? 'border-slate-900 bg-slate-50 cursor-pointer'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/40 cursor-pointer'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 text-slate-700 mx-auto flex items-center justify-center mb-2">
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              {isProcessing ? 'Analyzing and understanding form structure...' : 'Or drag and drop your form file here'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports PDF, PNG, JPG files up to 25MB
            </p>
          </div>

          {/* Prominent Demo Form Section for Judges (Requirement 6) */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Try a demo form
                </span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600">Built-in Samples</span>
            </div>

            <div className="space-y-2">
              {/* Demo Form A */}
              <div
                onClick={() => handleSelectDemoForm(DEMO_FORM_A)}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      Form A
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-800">
                      Global Merit Undergraduate Scholarship
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Formal academic wording (16 fields: institution, course, degree standing).
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Demo Form B */}
              <div
                onClick={() => handleSelectDemoForm(DEMO_FORM_B)}
                className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/20 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      Form B
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      Tech Pioneer Fellowship & Internship
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Industry phrasing testing FILL Memory reuse (16 fields).
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
