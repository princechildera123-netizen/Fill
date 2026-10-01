import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Brain,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  Eye,
  FileText,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Search,
  CheckCheck,
  Trash2,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';
import { MatchResult, VaultData, ConfidenceLevel, MatchSource } from '../types/fill';
import { VAULT_FIELD_DEFINITIONS, getVaultValueByKey, setVaultValueByKey } from '../services/vaultSchema';
import { recordLearnedMapping } from '../services/memoryStorage';
import { validateFormFields, ValidationResult } from '../services/formValidation';
import { canUseExpandedMemory } from '../services/featureGates';

interface ReviewScreenProps {
  documentTitle: string;
  sourceType?: string;
  fileName?: string;
  matches: MatchResult[];
  vault: VaultData;
  onUpdateMatches: (updated: MatchResult[]) => void;
  onUpdateVault: (updatedVault: VaultData) => void;
  onCompleteReview: () => void;
  onRenameForm?: (newTitle: string) => void;
  onOpenPaywall?: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  documentTitle,
  sourceType = 'pdf',
  fileName = 'form_document.pdf',
  matches,
  vault,
  onUpdateMatches,
  onUpdateVault,
  onCompleteReview,
  onRenameForm,
  onOpenPaywall,
}) => {
  // Navigation & Filtering
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'missing' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Field for Detailed Review Panel (Section 3)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Manual Override & Edit State (Section 4 & 16)
  const [isChoosingVaultField, setIsChoosingVaultField] = useState(false);
  const [customVaultKey, setCustomVaultKey] = useState<string>('');
  const [rememberMappingChoice, setRememberMappingChoice] = useState<boolean>(true);
  const [manualInputValue, setManualInputValue] = useState<string>('');
  const [isEditingManually, setIsEditingManually] = useState(false);

  // Missing Information Drawer/Modal State (Section 5)
  const [missingModalField, setMissingModalField] = useState<MatchResult | null>(null);
  const [newVaultInputValue, setNewVaultInputValue] = useState<string>('');
  const [targetVaultKeyForMissing, setTargetVaultKeyForMissing] = useState<string>('contact.email');

  // Confirmation Before Export Modal (Section 17)
  const [showExportConfirmation, setShowExportConfirmation] = useState(false);

  // Before / After Demo View Toggle (Section 14)
  const [demoViewMode, setDemoViewMode] = useState<'after' | 'before'>('after');

  // Form Renaming State (Section 13)
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleInputValue, setTitleInputValue] = useState(documentTitle);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Section 1: Calculate metrics
  const totalDetected = matches.length;
  const matchedCount = matches.filter(
    (m) => m.currentValue && m.status !== 'skipped' && !m.isSkipped
  ).length;
  const needsReviewCount = matches.filter(
    (m) => m.confidenceLevel === 'needs_review' && m.status !== 'confirmed' && !m.isSkipped
  ).length;
  const missingCount = matches.filter(
    (m) => (!m.currentValue || m.confidenceLevel === 'missing') && m.status !== 'skipped' && !m.isSkipped
  ).length;
  const highConfidenceCount = matches.filter(
    (m) => (m.confidenceLevel === 'high' || m.status === 'confirmed') && !m.isSkipped
  ).length;
  const progressPercent = totalDetected > 0 ? Math.round((matchedCount / totalDetected) * 100) : 0;

  // Section 6: Run Form Validation Pass
  const validation: ValidationResult = validateFormFields(matches);

  const activeField = matches.find((m) => m.id === selectedFieldId) || null;

  // Requirement 10: Fast Review candidate
  const unreviewedFields = matches.filter(
    (m) =>
      (m.confidenceLevel === 'needs_review' || !m.currentValue || m.confidenceLevel === 'missing') &&
      m.status !== 'confirmed' &&
      !m.isSkipped &&
      m.status !== 'skipped'
  );
  const fastReviewField = unreviewedFields[0] || null;

  // Keyboard shortcut: Press Enter to confirm fast review field
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.key === 'Enter' && fastReviewField && !isChoosingVaultField && !isEditingManually) {
        e.preventDefault();
        handleConfirmField(fastReviewField.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fastReviewField, isChoosingVaultField, isEditingManually]);

  // Actions
  const handleConfirmField = (fieldId: string) => {
    const updated = matches.map((m) => {
      if (m.id === fieldId) {
        if (m.matchedVaultKey && m.suggestedFieldTitle) {
          const memoryGate = canUseExpandedMemory();
          if (memoryGate.allowed) {
            recordLearnedMapping(m.originalLabel, m.matchedVaultKey, m.suggestedFieldTitle);
            triggerToast(`✓ FILL Memory updated: "${m.originalLabel}" → ${m.suggestedFieldTitle}`);
          } else {
            triggerToast('✓ Field confirmed (FILL Memory cap reached on Free plan)');
          }
        } else {
          triggerToast('✓ Field confirmed');
        }
        return {
          ...m,
          status: 'confirmed' as const,
          confidenceLevel: 'high' as ConfidenceLevel,
        };
      }
      return m;
    });
    onUpdateMatches(updated);
  };

  const handleConfirmAllHighConfidence = () => {
    const updated = matches.map((m) => {
      if (m.confidenceLevel === 'high' && m.status === 'unreviewed' && !m.isSkipped) {
        return { ...m, status: 'confirmed' as const };
      }
      return m;
    });
    onUpdateMatches(updated);
    triggerToast(`Confirmed ${highConfidenceCount} high-confidence matches`);
  };

  const handleSkipField = (fieldId: string) => {
    const updated = matches.map((m) => {
      if (m.id === fieldId) {
        return {
          ...m,
          status: 'skipped' as const,
          isSkipped: true,
        };
      }
      return m;
    });
    onUpdateMatches(updated);
    triggerToast('Field skipped');
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleClearAnswer = (fieldId: string) => {
    const updated = matches.map((m) => {
      if (m.id === fieldId) {
        return {
          ...m,
          currentValue: '',
          confidenceLevel: 'missing' as ConfidenceLevel,
          status: 'changed' as const,
          updatedForForm: true,
        };
      }
      return m;
    });
    onUpdateMatches(updated);
    triggerToast('Answer cleared for this form');
  };

  // Section 4: Manual Override - Choose Another Vault Field
  const handleSelectNewVaultField = (fieldId: string, vaultKey: string, remember: boolean) => {
    const chosenDef = VAULT_FIELD_DEFINITIONS.find((d) => d.key === vaultKey);
    const chosenTitle = chosenDef ? chosenDef.label : vaultKey;
    const value = getVaultValueByKey(vault, vaultKey);

    const updated = matches.map((m) => {
      if (m.id === fieldId) {
        if (remember) {
          const memoryGate = canUseExpandedMemory();
          if (memoryGate.allowed) {
            recordLearnedMapping(m.originalLabel, vaultKey, chosenTitle);
            triggerToast(`🧠 FILL Memory updated: "${m.originalLabel}" mapped to ${chosenTitle}. Learned for future forms.`);
          } else {
            triggerToast(`Field remapped. (FILL Memory storage limit reached on Free plan).`);
          }
        } else {
          triggerToast(`Field remapped to ${chosenTitle} for this form.`);
        }

        return {
          ...m,
          matchedVaultKey: vaultKey,
          suggestedFieldTitle: chosenTitle,
          currentValue: value,
          confidenceScore: 100,
          confidenceLevel: value ? ('high' as ConfidenceLevel) : ('missing' as ConfidenceLevel),
          status: 'confirmed' as const,
          manualOverride: true,
          updatedForForm: true,
          isFromMemory: remember,
          reasoning: `User explicitly remapped to ${chosenTitle}.`,
        };
      }
      return m;
    });

    onUpdateMatches(updated);
    setIsChoosingVaultField(false);
  };

  // Section 16: Manual Answer Entry
  const handleSaveManualAnswer = (fieldId: string, value: string, updateVaultPermanently: boolean) => {
    const trimmed = value.trim();
    const updated = matches.map((m) => {
      if (m.id === fieldId) {
        if (updateVaultPermanently && m.matchedVaultKey) {
          const updatedVault = setVaultValueByKey(vault, m.matchedVaultKey, trimmed);
          onUpdateVault(updatedVault);
          triggerToast(`Updated answer and saved permanently to Vault (${m.suggestedFieldTitle}).`);
        } else {
          triggerToast('Updated for this form.');
        }

        return {
          ...m,
          currentValue: trimmed,
          confidenceLevel: trimmed ? ('high' as ConfidenceLevel) : ('missing' as ConfidenceLevel),
          status: 'confirmed' as const,
          updatedForForm: true,
          manualOverride: true,
        };
      }
      return m;
    });

    onUpdateMatches(updated);
    setIsEditingManually(false);
    setManualInputValue('');
  };

  // Section 5: Add Missing Information to Vault
  const handleSaveMissingToVault = () => {
    if (!missingModalField) return;
    const key = targetVaultKeyForMissing || missingModalField.matchedVaultKey || 'contact.email';
    const val = newVaultInputValue.trim();
    if (!val) return;

    // Update permanent Vault
    const updatedVault = setVaultValueByKey(vault, key, val);
    onUpdateVault(updatedVault);

    const chosenDef = VAULT_FIELD_DEFINITIONS.find((d) => d.key === key);
    const chosenTitle = chosenDef ? chosenDef.label : key;

    // Record to memory
    recordLearnedMapping(missingModalField.originalLabel, key, chosenTitle);

    // Update form match
    const updatedMatches = matches.map((m) => {
      if (m.id === missingModalField.id) {
        return {
          ...m,
          matchedVaultKey: key,
          suggestedFieldTitle: chosenTitle,
          currentValue: val,
          confidenceLevel: 'high' as ConfidenceLevel,
          confidenceScore: 100,
          status: 'confirmed' as const,
          reasoning: `Added to Vault and verified: ${chosenTitle}`,
        };
      }
      return m;
    });

    onUpdateMatches(updatedMatches);
    triggerToast(`✓ Saved to Vault and populated into "${missingModalField.originalLabel}"!`);
    setMissingModalField(null);
    setNewVaultInputValue('');
  };

  // Section 13: Rename Form
  const handleSaveRename = () => {
    const trimmed = titleInputValue.trim();
    if (trimmed && onRenameForm) {
      onRenameForm(trimmed);
      triggerToast(`Form renamed to "${trimmed}"`);
    }
    setIsRenaming(false);
  };

  // Filter and search
  const filteredMatches = matches.filter((m) => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchLabel = m.originalLabel.toLowerCase().includes(q);
      const matchConcept = (m.suggestedFieldTitle || '').toLowerCase().includes(q);
      const matchVal = (m.currentValue || '').toLowerCase().includes(q);
      if (!matchLabel && !matchConcept && !matchVal) return false;
    }

    // Filter
    if (filter === 'all') return true;
    if (filter === 'needs_review') return m.confidenceLevel === 'needs_review' && m.status !== 'confirmed' && !m.isSkipped;
    if (filter === 'missing') return (!m.currentValue || m.confidenceLevel === 'missing') && m.status !== 'skipped' && !m.isSkipped;
    if (filter === 'high') return (m.confidenceLevel === 'high' || m.status === 'confirmed') && !m.isSkipped;
    return true;
  });

  // Group vault fields by category for Section 4 manual selection
  const categories = ['Identity', 'Contact', 'Education', 'Address', 'Emergency Contact'] as const;

  return (
    <div id="fill-form-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 max-w-md">
          <Brain className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header: Form Ready & Status Metrics */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Form Ready
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {sourceType.toUpperCase()} &bull; {fileName}
              </span>
            </div>

            {/* Editable Form Title (Section 13) */}
            <div className="flex items-center gap-2 pt-0.5">
              {isRenaming ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleInputValue}
                    onChange={(e) => setTitleInputValue(e.target.value)}
                    className="text-xl sm:text-2xl font-extrabold text-slate-900 px-2 py-1 rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveRename}
                    className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTitleInputValue(documentTitle);
                      setIsRenaming(false);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
                    {documentTitle}
                  </h1>
                  <button
                    onClick={() => setIsRenaming(true)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Rename form"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500">
              Review and verify detected field meanings. You stay in full control before final export.
            </p>
          </div>

          {/* Primary Action Button: Proceed to Export / Confirmation */}
          <div className="flex items-center gap-2.5 self-start lg:self-center">
            {needsReviewCount > 0 && (
              <button
                onClick={handleConfirmAllHighConfidence}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confirm All High Confidence</span>
              </button>
            )}

            <button
              id="workspace-export-btn"
              onClick={() => setShowExportConfirmation(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Export Completed Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Structured Metric Blocks (Section 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Detected Fields
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block mt-0.5">
              {totalDetected}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Matched from Vault
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 block mt-0.5">
              {matchedCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Needs Your Review
            </span>
            <span className={`text-xl sm:text-2xl font-extrabold block mt-0.5 ${needsReviewCount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
              {needsReviewCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
              Missing in Vault
            </span>
            <span className={`text-xl sm:text-2xl font-extrabold block mt-0.5 ${missingCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
              {missingCount}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Completion Progress</span>
            <span className="font-bold text-slate-900">{progressPercent}% complete</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Section 6: Validation Notice Banner if issues exist */}
        {validation.attentionCount > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  {validation.statusLabel}: {validation.summaryMessage}
                </span>
                <span className="text-[11px] text-amber-700">
                  You can review them now or proceed with an incomplete export.
                </span>
              </div>
            </div>
            <button
              onClick={() => setFilter('needs_review')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              Review {validation.attentionCount} {validation.attentionCount === 1 ? 'field' : 'fields'}
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout (Section 21) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Field Review UI & Filters */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search detected fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All ({totalDetected})
              </button>

              <button
                onClick={() => setFilter('needs_review')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filter === 'needs_review'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>🟡 Review ({needsReviewCount})</span>
              </button>

              <button
                onClick={() => setFilter('missing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filter === 'missing'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>🔴 Missing ({missingCount})</span>
              </button>

              <button
                onClick={() => setFilter('high')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filter === 'high'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>🟢 Matched ({highConfidenceCount})</span>
              </button>
            </div>
          </div>

          {/* Fast Review Experience (Requirement 10) */}
          {fastReviewField && (
            <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 border border-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Fast Review • Field {unreviewedFields.indexOf(fastReviewField) + 1} of {unreviewedFields.length}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  Press Enter to confirm
                </span>
              </div>

              {/* Requirement 8: The "Wow" Moment - Subtle memory notification */}
              {fastReviewField.isFromMemory && (
                <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-200 flex items-start gap-2.5">
                  <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold">🧠 FILL remembered this</strong>
                    <span className="text-indigo-200 text-[11px]">
                      &ldquo;{fastReviewField.originalLabel}&rdquo; &rarr; {fastReviewField.suggestedFieldTitle} ({fastReviewField.confidenceScore}% confidence). FILL remembered this mapping from a previous form.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">What the form asks</span>
                  <p className="text-sm font-extrabold text-white mt-0.5 truncate">&ldquo;{fastReviewField.originalLabel}&rdquo;</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">FILL thinks this means</span>
                  <p className="text-sm font-bold text-indigo-300 mt-0.5">{fastReviewField.suggestedFieldTitle}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Confidence</span>
                  <p className="text-sm font-bold mt-0.5 text-amber-300">
                    {fastReviewField.confidenceLevel === 'high' ? '🟢 High confidence' : fastReviewField.confidenceLevel === 'needs_review' ? '🟡 Needs review' : '🔴 Low confidence'} {fastReviewField.confidenceScore}%
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Answer</span>
                <div className="text-sm font-bold text-white bg-slate-800/90 px-3.5 py-2.5 rounded-xl border border-slate-700 mt-1">
                  {fastReviewField.currentValue || (
                    <span className="text-rose-400 italic font-normal">
                      [🔴 Missing information - Not found in Vault]
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => handleConfirmField(fastReviewField.id)}
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-extrabold hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4 text-slate-900" />
                  <span>Confirm</span>
                </button>

                <button
                  onClick={() => setSelectedFieldId(fastReviewField.id)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                >
                  Change
                </button>

                <button
                  onClick={() => handleSkipField(fastReviewField.id)}
                  className="px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                >
                  Skip
                </button>

                {!fastReviewField.currentValue && (
                  <button
                    onClick={() => {
                      setMissingModalField(fastReviewField);
                      setTargetVaultKeyForMissing(fastReviewField.matchedVaultKey || 'contact.email');
                      setNewVaultInputValue('');
                    }}
                    className="ml-auto px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Vault</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Field List */}
          <div className="space-y-3">
            {filteredMatches.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-500">No fields match this filter</p>
                <button
                  onClick={() => {
                    setFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredMatches.map((field) => {
                const isSkipped = field.status === 'skipped' || field.isSkipped;
                const isSelected = selectedFieldId === field.id;
                const isMissing = !field.currentValue || field.confidenceLevel === 'missing';
                const isNeedsReview = field.confidenceLevel === 'needs_review' && field.status !== 'confirmed';
                const isMatched = (field.confidenceLevel === 'high' || field.status === 'confirmed') && !isMissing;

                return (
                  <div
                    key={field.id}
                    id={`field-card-${field.id}`}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-slate-900 shadow-md ring-2 ring-slate-900/10'
                        : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    } ${isSkipped ? 'opacity-50 bg-slate-50/50' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left: Field Labels & Values */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Requirement 9: Status & Confidence Badges (Icon + Text + Percentage) */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {isMatched && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span>🟢 High confidence</span>
                              <span className="font-extrabold">{field.confidenceScore}%</span>
                            </span>
                          )}

                          {isNeedsReview && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                              <span>🟡 Needs review</span>
                              <span className="font-extrabold">{field.confidenceScore}%</span>
                            </span>
                          )}

                          {isMissing && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <span>🔴 Low confidence</span>
                              <span className="font-extrabold">{field.confidenceScore || 0}%</span>
                            </span>
                          )}

                          {isSkipped && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                              Skipped
                            </span>
                          )}

                          {/* Requirement 8: FILL Memory Notification */}
                          {field.isFromMemory && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Brain className="w-3 h-3 text-indigo-600" />
                              <span>🧠 FILL remembered this</span>
                            </span>
                          )}

                          {/* Section 16: Updated for this form */}
                          {field.updatedForForm && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Updated for this form
                            </span>
                          )}
                        </div>

                        {/* Subtle Memory Explanation */}
                        {field.isFromMemory && (
                          <div className="text-[11px] text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded-md border border-indigo-100 inline-flex items-center gap-1 mt-0.5">
                            <Brain className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>FILL remembered this mapping from a previous form.</span>
                          </div>
                        )}

                        {/* Field Label */}
                        <div>
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {field.originalLabel}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            FILL interpretation: <strong className="text-slate-700 font-semibold">{field.suggestedFieldTitle}</strong>
                          </span>
                        </div>

                        {/* Answer Value */}
                        <div className="pt-1">
                          <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                            Answer:
                          </span>
                          {isSkipped ? (
                            <span className="text-xs italic text-slate-400">[Skipped by user]</span>
                          ) : field.currentValue ? (
                            <span className="text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block mt-0.5">
                              {field.currentValue}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-rose-600 italic">
                              [No information available in Vault]
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Quick Actions */}
                      <div
                        className="flex items-center gap-1.5 self-start sm:self-center shrink-0 pt-2 sm:pt-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isNeedsReview && (
                          <button
                            onClick={() => handleConfirmField(field.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Confirm this match"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}

                        {isMissing && (
                          <button
                            onClick={() => {
                              setMissingModalField(field);
                              setTargetVaultKeyForMissing(field.matchedVaultKey || 'contact.email');
                              setNewVaultInputValue('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Add missing value to Vault"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Vault</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedFieldId(field.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                          title="Open field details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleSkipField(field.id)}
                          className="px-2 py-1.5 rounded-xl text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
                          title="Skip field"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Interactive Document Preview & Detail Panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 3 & 4: Detailed Review Panel (when a field is selected) */}
          {activeField ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-900 shadow-md space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Field Details</h3>
                    <p className="text-[11px] text-slate-500">Transparent AI match reasoning</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedFieldId(null);
                    setIsChoosingVaultField(false);
                    setIsEditingManually(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Question */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  What the form asks:
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  &ldquo;{activeField.originalLabel}&rdquo;
                </p>
              </div>

              {/* FILL Interpretation */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  What FILL thinks it means:
                </span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-800">
                  {activeField.suggestedFieldTitle}
                </span>
              </div>

              {/* Suggested Answer */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Suggested answer:
                </span>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {activeField.currentValue || (
                    <span className="text-rose-600 italic">No value in Vault</span>
                  )}
                </p>
              </div>

              {/* Confidence & Source */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Confidence
                  </span>
                  <span className="font-extrabold text-slate-900 block mt-0.5">
                    {activeField.confidenceLevel === 'high' ? '🟢 High confidence' : activeField.confidenceLevel === 'needs_review' ? '🟡 Needs review' : '🔴 Low confidence'} {activeField.confidenceScore}%
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Source
                  </span>
                  <span className="font-bold text-indigo-700 capitalize">
                    {activeField.isFromMemory
                      ? 'FILL Memory'
                      : activeField.source === 'semantic_ai'
                      ? 'Semantic Matching'
                      : 'Deterministic Match'}
                  </span>
                </div>
              </div>

              {/* Why this match? */}
              <div className="space-y-1 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Why this match?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeField.reasoning ||
                    `FILL interpreted "${activeField.originalLabel}" as corresponding to ${activeField.suggestedFieldTitle}.`}
                </p>
              </div>

              {/* Section 4: Manual Override Buttons */}
              {!isChoosingVaultField && !isEditingManually && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleConfirmField(activeField.id)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Match</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsChoosingVaultField(true);
                        setCustomVaultKey(activeField.matchedVaultKey || 'identity.firstName');
                      }}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FolderPlus className="w-4 h-4 text-slate-500" />
                      <span>Change Field</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsEditingManually(true);
                        setManualInputValue(activeField.currentValue || '');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Enter Manually</span>
                    </button>

                    <button
                      onClick={() => handleClearAnswer(activeField.id)}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Answer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Section 4: Choose Another Vault Field Drawer */}
              {isChoosingVaultField && (
                <div className="space-y-3 pt-2 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Choose another Vault field:
                    </span>
                    <button
                      onClick={() => setIsChoosingVaultField(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Grouped Select */}
                  <select
                    value={customVaultKey}
                    onChange={(e) => setCustomVaultKey(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {categories.map((cat) => (
                      <optgroup key={cat} label={cat}>
                        {VAULT_FIELD_DEFINITIONS.filter((d) => d.category === cat).map((def) => {
                          const val = getVaultValueByKey(vault, def.key);
                          return (
                            <option key={def.key} value={def.key}>
                              {def.label} {val ? `(${val})` : '(Empty in Vault)'}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>

                  {/* Section 4: "Remember this mapping?" Option */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      Remember this mapping?
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="remember-mapping"
                          checked={rememberMappingChoice === true}
                          onChange={() => setRememberMappingChoice(true)}
                          className="accent-slate-900"
                        />
                        <span>Remember (Update FILL Memory)</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="remember-mapping"
                          checked={rememberMappingChoice === false}
                          onChange={() => setRememberMappingChoice(false)}
                          className="accent-slate-900"
                        />
                        <span>Don&apos;t remember</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleSelectNewVaultField(activeField.id, customVaultKey, rememberMappingChoice)
                    }
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer transition-colors shadow-2xs"
                  >
                    Apply New Mapping
                  </button>
                </div>
              )}

              {/* Section 16: Enter Manually Drawer */}
              {isEditingManually && (
                <div className="space-y-3 pt-2 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Enter answer manually:
                    </span>
                    <button
                      onClick={() => setIsEditingManually(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <input
                    type="text"
                    value={manualInputValue}
                    onChange={(e) => setManualInputValue(e.target.value)}
                    placeholder="Enter answer for this field..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    autoFocus
                  />

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={() => handleSaveManualAnswer(activeField.id, manualInputValue, false)}
                      className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-2xs"
                    >
                      Save for this form only
                    </button>

                    {activeField.matchedVaultKey && (
                      <button
                        onClick={() => handleSaveManualAnswer(activeField.id, manualInputValue, true)}
                        className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 cursor-pointer transition-colors"
                      >
                        Update Vault Permanently
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Prompt to click a field */
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Field Details Panel</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select any field from the list to see why FILL chose that match, change the mapping, or enter answers manually.
              </p>
            </div>
          )}

          {/* Section 14: Live Document Preview & Before/After Demo Toggle */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Header & Demo Toggle */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Document Preview
                </span>
              </div>

              {/* Section 14: Before FILL / After FILL Demo Selector */}
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setDemoViewMode('after')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    demoViewMode === 'after'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  After FILL
                </button>
                <button
                  onClick={() => setDemoViewMode('before')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    demoViewMode === 'before'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Before FILL
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto font-sans">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Official Application
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {documentTitle}
                </h4>
              </div>

              {demoViewMode === 'before' ? (
                /* Before FILL: Blank empty fields */
                <div className="space-y-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
                    Demo Mode: Demonstrating original blank form before FILL automation.
                  </div>
                  {matches.map((m) => (
                    <div key={m.id} className="border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        {m.originalLabel}
                      </span>
                      <div className="w-full h-7 mt-1 rounded bg-slate-50 border border-dashed border-slate-300" />
                    </div>
                  ))}
                </div>
              ) : (
                /* After FILL: Populated values */
                <div className="space-y-3">
                  {matches.map((m) => {
                    const isSkipped = m.status === 'skipped' || m.isSkipped;
                    return (
                      <div key={m.id} className="border-b border-slate-100 pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">
                            {m.originalLabel}
                          </span>
                          {m.status === 'confirmed' && (
                            <span className="text-[9px] font-bold text-emerald-600">✓ Verified</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-900 mt-0.5">
                          {isSkipped ? (
                            <span className="text-slate-400 italic">[Skipped]</span>
                          ) : m.currentValue ? (
                            <span className="text-slate-900">{m.currentValue}</span>
                          ) : (
                            <span className="text-rose-500 italic">[Missing information]</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Modal for "Add Missing Information to Vault" */}
      {missingModalField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add to Vault</h3>
                  <p className="text-[11px] text-slate-500">Fill missing profile data once</p>
                </div>
              </div>
              <button
                onClick={() => setMissingModalField(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              FILL could not find an answer for <strong className="text-slate-900">&ldquo;{missingModalField.originalLabel}&rdquo;</strong> in your Vault. Enter it below to save it permanently and populate this form:
            </p>

            {/* Target Vault Key Selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Vault Field:
              </label>
              <select
                value={targetVaultKeyForMissing}
                onChange={(e) => setTargetVaultKeyForMissing(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900"
              >
                {categories.map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {VAULT_FIELD_DEFINITIONS.filter((d) => d.category === cat).map((def) => (
                      <option key={def.key} value={def.key}>
                        {def.label} ({cat})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Input Value */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Value to save:
              </label>
              <input
                type="text"
                placeholder="e.g. parent.morgan@example.com"
                value={newVaultInputValue}
                onChange={(e) => setNewVaultInputValue(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                autoFocus
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMissingModalField(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMissingToVault}
                disabled={!newVaultInputValue.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Save to Vault & Populate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 17: Compact Confirmation Screen Before Export */}
      {showExportConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900 font-sans">Almost done</h3>
              <p className="text-xs text-slate-500">
                Ready to prepare and export your completed application document.
              </p>
            </div>

            {/* Metrics List (Section 17) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Fields detected:</span>
                <span className="font-bold text-slate-900">{totalDetected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Fields completed:</span>
                <span className="font-bold text-slate-900">{matchedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">High-confidence matches:</span>
                <span className="font-bold text-emerald-700">{highConfidenceCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">User-reviewed matches:</span>
                <span className="font-bold text-indigo-700">
                  {matches.filter((m) => m.status === 'confirmed').length}
                </span>
              </div>
              {missingCount > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-rose-700">
                  <span className="font-semibold">Unfilled fields (Incomplete export):</span>
                  <span className="font-bold">{missingCount}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                id="confirmation-export-btn"
                onClick={() => {
                  setShowExportConfirmation(false);
                  onCompleteReview();
                }}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Export completed form</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowExportConfirmation(false)}
                className="w-full py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Go back and review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
