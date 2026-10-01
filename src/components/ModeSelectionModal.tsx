import React, { useState } from 'react';
import {
  FileText,
  Globe,
  Check,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { FillMode } from '../services/modeStorage';

interface ModeSelectionModalProps {
  isOpen: boolean;
  initialUseDocuments?: boolean;
  initialUseWebsites?: boolean;
  onConfirm: (selection: { useDocuments: boolean; useWebsites: boolean; mode: FillMode }) => void;
  onOpenDemo?: () => void;
  onClose?: () => void;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  isOpen,
  initialUseDocuments = true,
  initialUseWebsites = true,
  onConfirm,
  onOpenDemo,
  onClose,
}) => {
  const [useDocuments, setUseDocuments] = useState(initialUseDocuments);
  const [useWebsites, setUseWebsites] = useState(initialUseWebsites);

  if (!isOpen) return null;

  const handleSelectBoth = () => {
    setUseDocuments(true);
    setUseWebsites(true);
  };

  const handleToggleDocs = () => {
    // If turning off docs when websites is already off, switch websites on so at least one is selected
    if (useDocuments && !useWebsites) {
      setUseDocuments(false);
      setUseWebsites(true);
    } else {
      setUseDocuments(!useDocuments);
    }
  };

  const handleToggleWebsites = () => {
    // If turning off websites when docs is already off, switch docs on so at least one is selected
    if (useWebsites && !useDocuments) {
      setUseWebsites(false);
      setUseDocuments(true);
    } else {
      setUseWebsites(!useWebsites);
    }
  };

  const handleContinue = () => {
    let mode: FillMode = 'both';
    if (useDocuments && !useWebsites) mode = 'documents';
    else if (!useDocuments && useWebsites) mode = 'websites';
    else mode = 'both';

    onConfirm({
      useDocuments,
      useWebsites,
      mode,
    });
  };

  const isBothSelected = useDocuments && useWebsites;

  return (
    <div
      id="mode-selection-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15 mb-3">
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
            <span>Multi-Mode Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            How do you want to use FILL?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Choose how FILL helps you complete forms. You can change this anytime from Settings.
          </p>
        </div>

        {/* Selection Cards Container */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Fill Documents */}
            <div
              id="mode-card-documents"
              onClick={handleToggleDocs}
              className={`relative rounded-2xl p-5 border-2 text-left cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                useDocuments
                  ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      useDocuments
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      useDocuments
                        ? 'bg-indigo-600 text-white scale-105'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {useDocuments && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-sans">
                  📄 Fill Documents
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Upload PDFs, images, screenshots, or application forms and let FILL understand and complete them.
                </p>

                {/* Feature List */}
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Upload a document</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Understand what each field means</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Match information from your Vault</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Review before filling</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Export the completed form</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 pt-2">
                <span
                  className={`text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                    useDocuments ? 'text-indigo-700' : 'text-slate-500'
                  }`}
                >
                  <span>{useDocuments ? '✓ Selected' : 'Select Documents'}</span>
                </span>
              </div>
            </div>

            {/* Card 2: Fill Websites */}
            <div
              id="mode-card-websites"
              onClick={handleToggleWebsites}
              className={`relative rounded-2xl p-5 border-2 text-left cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                useWebsites
                  ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      useWebsites
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      useWebsites
                        ? 'bg-indigo-600 text-white scale-105'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {useWebsites && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-sans">
                  🌐 Fill Websites
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Connect FILL to Chrome and fill forms directly on websites.
                </p>

                {/* Feature List */}
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Detect webpage fields</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Understand different wording</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Match your Vault</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Review confidence</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Fill with one click</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 pt-2">
                <span
                  className={`text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                    useWebsites ? 'text-indigo-700' : 'text-slate-500'
                  }`}
                >
                  <span>{useWebsites ? '✓ Selected' : 'Select Websites'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick "Use Both" shortcut option */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-700">
                Want both workflows available side by side?
              </span>
            </div>
            <button
              type="button"
              onClick={handleSelectBoth}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isBothSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-800'
              }`}
            >
              {isBothSelected ? '✓ Both Active' : 'Use Both'}
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="mode-selection-continue-btn"
              type="button"
              onClick={handleContinue}
              className="flex-1 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
