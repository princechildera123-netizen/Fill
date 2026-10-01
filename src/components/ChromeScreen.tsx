import React, { useState } from 'react';
import {
  Globe,
  Database,
  Brain,
  Shield,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Check,
  Copy,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Download
} from 'lucide-react';
import { checkChromeConnectionStatus, setChromeConnectionStatus } from '../services/modeStorage';

interface ChromeScreenProps {
  onOpenDemoPortal?: () => void;
}

export const ChromeScreen: React.FC<ChromeScreenProps> = ({ onOpenDemoPortal }) => {
  const [copied, setCopied] = useState(false);
  const [connectionState, setConnectionState] = useState<'connected' | 'ready_to_connect'>(() =>
    checkChromeConnectionStatus()
  );

  const handleCopyPath = () => {
    navigator.clipboard.writeText('/extension');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleConnection = () => {
    const nextState = connectionState === 'connected' ? 'ready_to_connect' : 'connected';
    setChromeConnectionStatus(nextState);
    setConnectionState(nextState);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-7 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Web Browser Companion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            FILL for Chrome
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Fill forms directly on websites using your private FILL Vault.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-2xs ${
              connectionState === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{connectionState === 'connected' ? 'Connected ✓' : 'Ready to connect'}</span>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-lg relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold font-sans">
            Autofill with Semantic Intelligence
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            When you visit university portals, scholarship applications, or registration sites, the FILL Companion detects inputs, understands synonymous field labels, and safely populates your data.
          </p>
        </div>

        <div className="shrink-0 relative z-10 flex flex-col gap-2.5">
          <button
            onClick={handleToggleConnection}
            className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              connectionState === 'connected'
                ? 'bg-white text-slate-900 hover:bg-slate-100'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>{connectionState === 'connected' ? 'Disconnect Companion' : 'Connect Chrome'}</span>
          </button>

          <a
            href="/demo.html"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Try Demo Web Forms</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Conceptual Flow Diagram */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          How the Chrome Companion Operates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-mono text-[10px] text-slate-400 font-bold block">STEP 1</span>
            <span className="font-bold text-slate-900 block">FILL Vault</span>
            <span className="text-[11px] text-slate-500">Secure student data</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-mono text-[10px] text-slate-400 font-bold block">STEP 2</span>
            <span className="font-bold text-slate-900 block">FILL Sense</span>
            <span className="text-[11px] text-slate-500">Decodes meaning</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-mono text-[10px] text-slate-400 font-bold block">STEP 3</span>
            <span className="font-bold text-slate-900 block">Chrome</span>
            <span className="text-[11px] text-slate-500">Detects page inputs</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-mono text-[10px] text-slate-400 font-bold block">STEP 4</span>
            <span className="font-bold text-slate-900 block">Review</span>
            <span className="text-[11px] text-slate-500">Confidence check</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-mono text-[10px] text-slate-400 font-bold block">STEP 5</span>
            <span className="font-bold text-emerald-700 block">Fill</span>
            <span className="text-[11px] text-slate-500">One-click populate</span>
          </div>
        </div>
      </div>

      {/* Clean Local Unpacked Guide (Without developer jargon overload) */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Chrome Companion Installation</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The companion extension is packaged as a standard Chrome Manifest V3 application ready to load in your browser.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>Open <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono">chrome://extensions/</code> in Google Chrome.</li>
            <li>Enable <strong>Developer mode</strong> in the upper right corner.</li>
            <li>Click <strong>Load unpacked</strong> in the top left corner.</li>
            <li>
              Select the directory:{' '}
              <button
                type="button"
                onClick={handleCopyPath}
                className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded cursor-pointer hover:bg-indigo-50"
              >
                <span>/extension</span>
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
