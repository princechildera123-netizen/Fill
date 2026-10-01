import React from 'react';
import {
  FilePlus2,
  ArrowRight,
  Database,
  FileCheck2,
  Clock,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Brain,
  FileText,
  Zap,
  Globe,
  Layers,
  Laptop
} from 'lucide-react';
import { FormDocument, VaultData } from '../types/fill';
import { calculateVaultCompleteness } from '../services/vaultSchema';
import { AppLogo } from './AppLogo';
import { hasProAccess } from '../services/revenueCat';
import { getUsageState } from '../services/usageLimit';
import { MONETIZATION_CONFIG } from '../services/monetizationConfig';
import { checkChromeConnectionStatus } from '../services/modeStorage';

interface HomeScreenProps {
  vault: VaultData;
  recentForms: FormDocument[];
  onFillAForm: () => void;
  onConnectChrome: () => void;
  onChangeMode?: () => void;
  onNavigateToVault: () => void;
  onNavigateToForms: () => void;
  onSelectForm: (form: FormDocument) => void;
  onStartDemoA: () => void;
  onStartDemoB: () => void;
  onOpenPaywall?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  vault,
  recentForms,
  onFillAForm,
  onConnectChrome,
  onChangeMode,
  onNavigateToVault,
  onNavigateToForms,
  onSelectForm,
  onStartDemoA,
  onStartDemoB,
  onOpenPaywall,
}) => {
  const { filledCount, totalCount, percentage } = calculateVaultCompleteness(vault);
  const isPro = hasProAccess();
  const usage = getUsageState();
  const formsUsed = usage.formsProcessedThisMonth;
  const freeLimit = MONETIZATION_CONFIG.FREE_FORM_LIMIT;
  const remaining = Math.max(0, freeLimit - formsUsed);
  const isAtLimit = formsUsed >= freeLimit;
  const isNearLimit = !isAtLimit && remaining <= 2;
  const chromeStatus = checkChromeConnectionStatus();

  return (
    <div id="fill-home-screen" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-7 animate-in fade-in duration-200">
      {/* Brand Header & Compact Value Proposition */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <AppLogo size="md" showTagline={true} />
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 font-medium max-w-md">
            Save your information once. FILL understands the next form.
          </p>
        </div>

        {/* Client-side privacy badge & Workflow selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {onChangeMode && (
            <button
              onClick={onChangeMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Change your FILL workflow mode"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Choose Mode</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Local Vault • No Cloud Upload</span>
          </div>
        </div>
      </div>

      {/* Primary Actions: TWO FIRST-CLASS WORKFLOW MODES (Requirement 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: 📄 Documents Mode */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7 shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col justify-between group">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-white/15">
                <FileText className="w-3.5 h-3.5 text-indigo-300" />
                <span>Documents Mode</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Ready
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
              📄 Fill Documents
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Upload and complete a form. Import any PDF, application image, or snapshot and let FILL decode field meaning.
            </p>
          </div>

          <div className="mt-6 pt-2 relative z-10">
            <button
              id="home-fill-document-btn"
              onClick={onFillAForm}
              className="w-full py-3.5 px-5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ring-2 ring-white/20"
            >
              <FilePlus2 className="w-4 h-4 text-slate-900" />
              <span>Fill a Document</span>
            </button>
          </div>

          {/* Subtle gradient effect */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: 🌐 Websites Mode */}
        <div className="relative overflow-hidden rounded-3xl bg-white text-slate-900 p-6 sm:p-7 shadow-xl shadow-slate-900/5 border-2 border-indigo-100 hover:border-indigo-200 flex flex-col justify-between group transition-colors">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Websites Mode</span>
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  chromeStatus === 'connected'
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-600 bg-slate-100 border border-slate-200'
                }`}
              >
                {chromeStatus === 'connected' ? 'Connected ✓' : 'Ready to connect'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
              🌐 Fill Websites
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Fill forms directly on websites. Connect the Chrome Companion to detect in-page fields and populate with one click.
            </p>
          </div>

          <div className="mt-6 pt-2 relative z-10 flex flex-col gap-2">
            <button
              id="home-connect-chrome-btn"
              onClick={onConnectChrome}
              className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                chromeStatus === 'connected'
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>
                {chromeStatus === 'connected' ? 'Open Chrome Companion' : 'Connect Chrome'}
              </span>
            </button>
          </div>

          {/* Subtle gradient effect */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-indigo-50/60 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Requirement 10: Subtle Usage Indicator on Home (Free vs Pro) */}
      {!isPro ? (
        <div
          id="home-free-usage-banner"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isAtLimit
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  {isAtLimit
                    ? "You've used your 5 free forms this month."
                    : isNearLimit
                    ? `${remaining} forms remaining this month`
                    : `${formsUsed} of ${freeLimit} forms used`}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  FILL Free
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isAtLimit
                  ? 'Need to fill another document? Upgrade to Pro for unlimited forms and priority AI.'
                  : 'Save your information once. FILL completes your next forms effortlessly.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={onOpenPaywall}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isAtLimit
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Upgrade to FILL Pro</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          id="home-pro-status-banner"
          className="bg-white rounded-2xl p-3.5 border border-indigo-100 shadow-2xs flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">FILL Pro</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-600 font-medium">Unlimited forms</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Active Entitlement
          </span>
        </div>
      )}

      {/* Secondary Information: Your Vault Status */}
      <div
        id="home-vault-card"
        onClick={onNavigateToVault}
        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
              <Database className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Your Vault
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {percentage}% ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {filledCount} information fields saved (out of {totalCount} core fields).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Progress indicator */}
            <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden hidden md:block">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage >= 80 ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 flex items-center gap-1">
              <span>View & Edit Vault</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Demo Form Quick Launcher for Judges */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-indigo-50/40 p-5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Try a Demo Form (Competition Walkthrough)
            </span>
          </div>
          <span className="text-[11px] text-indigo-700 font-semibold">Instant Experience</span>
        </div>

        <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
          See FILL understand varied phrasing across two real forms. Confirm one uncertain field in <strong>Form A</strong>, and observe <strong>Form B</strong> recognize the meaning automatically via FILL Memory!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="home-demo-form-a-btn"
            onClick={onStartDemoA}
            className="p-3.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/90 text-left transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                Form A
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                Global Merit Scholarship
              </h4>
              <span className="text-[11px] text-slate-500">16 formal academic fields</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            id="home-demo-form-b-btn"
            onClick={onStartDemoB}
            className="p-3.5 bg-white hover:bg-slate-50 rounded-xl border border-indigo-200/80 bg-indigo-50/20 text-left transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Form B (FILL Memory Test)
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                Tech Pioneer Fellowship
              </h4>
              <span className="text-[11px] text-slate-500">Recognizes learned phrasing automatically</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Chrome Extension Test Link */}
        <div className="mt-3 pt-3 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-950 font-medium">
            <span>🧩 Chrome Extension Companion available:</span>
            <span className="text-slate-600">Test live web forms in the interactive portal</span>
          </div>
          <a
            href="/demo.html"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 shrink-0"
          >
            <span>Open Companion Web Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Recent Forms Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Forms
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

        {recentForms.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">No forms yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your first form and let FILL understand it.
              </p>
            </div>
            <button
              onClick={onFillAForm}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>FILL a form</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentForms.slice(0, 3).map((form) => {
              const statusColor =
                form.status === 'ready'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : form.status === 'exported'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : form.status === 'needs_review'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              const formattedDate = new Date(form.importedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={form.id}
                  id={`recent-form-item-${form.id}`}
                  onClick={() => onSelectForm(form)}
                  className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {form.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <span>&bull;</span>
                        <span>{form.fields.length} fields</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusColor}`}
                    >
                      {form.status === 'ready'
                        ? 'Ready'
                        : form.status === 'exported'
                        ? 'Exported'
                        : form.status === 'needs_review'
                        ? 'Needs Review'
                        : 'In Progress'}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {form.completionRate}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* How FILL Operates Compact Explanation */}
      <div className="border-t border-slate-200/80 pt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          How FILL Operates
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-black text-slate-400">01</span>
            <h5 className="text-xs font-bold text-slate-900 mt-1">Import Any Document</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
              Upload fillable PDFs, paper scans, or screenshots of application forms.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-black text-slate-400">02</span>
            <h5 className="text-xs font-bold text-slate-900 mt-1">Semantic FILL Sense</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
              Understands varied phrasing (&quot;Institution presently attended&quot; &rarr; School) with client-governed privacy.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-black text-slate-400">03</span>
            <h5 className="text-xs font-bold text-slate-900 mt-1">Review & Verify</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
              FILL Guard flags uncertain fields. You confirm every match before final export.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

