import React, { useState } from 'react';
import {
  FilePlus2,
  Database,
  Globe,
  Brain,
  FileCheck2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Laptop,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { FormDocument, VaultData, LearnedMapping } from '../types/fill';
import { calculateVaultCompleteness } from '../services/vaultSchema';
import { checkChromeConnectionStatus } from '../services/modeStorage';
import { hasProAccess } from '../services/revenueCat';
import { getUsageState } from '../services/usageLimit';
import { MONETIZATION_CONFIG } from '../services/monetizationConfig';
import { AuthUser } from '../services/authClient';

interface DashboardScreenProps {
  user: AuthUser;
  vault: VaultData;
  recentForms: FormDocument[];
  learnedMemory: LearnedMapping[];
  onFillDocument: () => void;
  onOpenChromeConnect: () => void;
  onNavigateToVault: () => void;
  onNavigateToForms: () => void;
  onNavigateToMemory: () => void;
  onSelectForm: (form: FormDocument) => void;
  onStartDemoA: () => void;
  onStartDemoB: () => void;
  onOpenPaywall?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  vault,
  recentForms,
  learnedMemory,
  onFillDocument,
  onOpenChromeConnect,
  onNavigateToVault,
  onNavigateToForms,
  onNavigateToMemory,
  onSelectForm,
  onStartDemoA,
  onStartDemoB,
  onOpenPaywall,
}) => {
  const { filledCount, totalCount, percentage } = calculateVaultCompleteness(vault);
  const chromeStatus = checkChromeConnectionStatus();
  const isPro = hasProAccess();
  const usage = getUsageState();
  const formsUsed = usage.formsProcessedThisMonth;
  const freeLimit = MONETIZATION_CONFIG.FREE_FORM_LIMIT;
  const remaining = Math.max(0, freeLimit - formsUsed);
  const isAtLimit = formsUsed >= freeLimit;

  // Real emptiness check
  const isVaultEmpty = filledCount === 0;
  const isHistoryEmpty = recentForms.length === 0;
  const isMemoryEmpty = learnedMemory.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-7 animate-in fade-in duration-200">
      {/* 1. Header with greeting and user account state */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Good to see you, {user.fullName.split(' ')[0]}.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Your personal information workspace is active and secure.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted Vault • Local Sovereignty</span>
          </div>
        </div>
      </div>

      {/* 2. Main Two Workflow Actions (Section 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Action */}
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-white/15">
              <span>📄 Document Workflow</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-sans">
              Fill a Document
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Upload scholarship, fellowship, or collegiate application forms (PDF or image). FILL extracts fields and prepares the answers.
            </p>
          </div>
          <div className="mt-6 pt-2 relative z-10">
            <button
              onClick={onFillDocument}
              className="w-full py-3.5 px-5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ring-2 ring-white/20"
            >
              <FilePlus2 className="w-4 h-4 text-slate-900" />
              <span>Fill a Document</span>
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Website Action */}
        <div className="rounded-3xl bg-white text-slate-900 p-6 sm:p-7 shadow-xl shadow-slate-900/5 border-2 border-indigo-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>Website Workflow</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-sans text-slate-900">
              Fill a Website
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Fill application forms directly in Google Chrome. The companion detects in-page fields and populates them safely with one click.
            </p>
          </div>
          <div className="mt-6 pt-2 relative z-10">
            <button
              onClick={onOpenChromeConnect}
              className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                chromeStatus === 'connected'
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>
                {chromeStatus === 'connected' ? 'Open Chrome Companion' : 'Connect Chrome'}
              </span>
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-indigo-50/60 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* 3. Real Status Cards Grid (Section 6) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card: Forms Completed */}
        <div
          onClick={onNavigateToForms}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-1"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Forms Completed</span>
          <p className="text-2xl font-extrabold text-slate-900 font-sans">{recentForms.length}</p>
          <span className="text-[11px] text-slate-400">
            {recentForms.length === 0 ? 'No completed forms yet' : `${recentForms.length} saved in history`}
          </span>
        </div>

        {/* Card: Vault Fields */}
        <div
          onClick={onNavigateToVault}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-1"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Vault Fields</span>
          <p className="text-2xl font-extrabold text-indigo-700 font-sans">{filledCount} / {totalCount}</p>
          <span className="text-[11px] text-slate-400">{percentage}% profile completed</span>
        </div>

        {/* Card: Memory Mappings */}
        <div
          onClick={onNavigateToMemory}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-1"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Memory Mappings</span>
          <p className="text-2xl font-extrabold text-slate-900 font-sans">{learnedMemory.length}</p>
          <span className="text-[11px] text-slate-400">
            {learnedMemory.length === 0 ? 'Learning on demand' : `${learnedMemory.length} learned associations`}
          </span>
        </div>

        {/* Card: Chrome Companion */}
        <div
          onClick={onOpenChromeConnect}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer space-y-1"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Chrome Status</span>
          <p className="text-sm font-extrabold text-slate-900 font-sans flex items-center gap-1.5 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                chromeStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{chromeStatus === 'connected' ? 'Connected ✓' : 'Ready to connect'}</span>
          </p>
          <span className="text-[11px] text-slate-400">Companion extension</span>
        </div>
      </div>

      {/* 4. Vault Completeness & Setup Banner */}
      <div
        onClick={onNavigateToVault}
        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-slate-300 transition-colors group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Personal Vault Overview
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {percentage}% ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isVaultEmpty
                ? 'Your Vault is empty. Add your academic and contact details to begin.'
                : `${filledCount} information fields saved (out of ${totalCount} standard fields).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden hidden md:block">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 80 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 flex items-center gap-1">
            <span>{isVaultEmpty ? 'Set up Vault' : 'View & Edit Vault'}</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>

      {/* 5. Real Recent Forms Section (Empty state or list) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Applications
          </h3>
          {recentForms.length > 0 && (
            <button
              onClick={onNavigateToForms}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({recentForms.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isHistoryEmpty ? (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">Your FILL workspace is ready.</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No completed forms yet. Fill your first academic scholarship, grant, or university application form.
              </p>
            </div>
            <button
              onClick={onFillDocument}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Fill your first form</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentForms.slice(0, 4).map((form) => (
              <div
                key={form.id}
                onClick={() => onSelectForm(form)}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {form.sourceType}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(form.lastModifiedAt || form.importedAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                    {form.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {form.fields ? form.fields.filter((m) => Boolean(m.currentValue)).length : 0} fields matched ({form.completionRate}% complete)
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Demo Launcher Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-indigo-50/40 p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Interactive Competition Demo Forms
            </span>
          </div>
          <span className="text-[11px] text-indigo-700 font-semibold">Zero Setup Needed</span>
        </div>

        <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
          Experience semantic understanding across forms. Confirm one field in <strong>Form A</strong>, and observe <strong>Form B</strong> recognize the meaning automatically via FILL Memory!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onStartDemoA}
            className="p-3.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Form A</span>
              <h4 className="text-xs font-bold text-slate-900 mt-1">Global Merit Scholarship</h4>
              <span className="text-[11px] text-slate-500">Standard academic phrasing</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={onStartDemoB}
            className="p-3.5 bg-white hover:bg-slate-50 rounded-xl border border-indigo-200/80 bg-indigo-50/20 text-left transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">Form B (Memory Test)</span>
              <h4 className="text-xs font-bold text-slate-900 mt-1">Commonwealth Fellowship</h4>
              <span className="text-[11px] text-slate-500">Recognizes learned phrasing automatically</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};
