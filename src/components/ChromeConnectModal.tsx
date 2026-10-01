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
  X
} from 'lucide-react';
import { checkChromeConnectionStatus, setChromeConnectionStatus } from '../services/modeStorage';

interface ChromeConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDemoPortal?: () => void;
}

export const ChromeConnectModal: React.FC<ChromeConnectModalProps> = ({
  isOpen,
  onClose,
  onOpenDemoPortal,
}) => {
  const [copied, setCopied] = useState(false);
  const [connectionState, setConnectionState] = useState<'connected' | 'ready_to_connect'>(() =>
    checkChromeConnectionStatus()
  );

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText('/extension');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateConnection = () => {
    const nextState = connectionState === 'connected' ? 'ready_to_connect' : 'connected';
    setChromeConnectionStatus(nextState);
    setConnectionState(nextState);
  };

  return (
    <div
      id="chrome-connect-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15 mb-3">
            <Globe className="w-3.5 h-3.5 text-indigo-300" />
            <span>Website Mode</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
            Connect FILL to Chrome
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            FILL can help you complete forms directly on websites using the same Vault, Sense, Memory, and Guard that power the FILL app.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Visual Conceptual Pipeline Explanation (Requirement 4) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              One Shared Intelligence Flow
            </h3>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex flex-col items-center gap-1">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono text-[11px]">1</span>
                <span>FILL Vault</span>
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="flex flex-col items-center gap-1">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono text-[11px]">2</span>
                <span>FILL Sense</span>
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="flex flex-col items-center gap-1">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono text-[11px]">3</span>
                <span>Chrome</span>
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="flex flex-col items-center gap-1">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono text-[11px]">4</span>
                <span>Review</span>
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="flex flex-col items-center gap-1">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono text-[11px]">5</span>
                <span>Fill</span>
              </span>
            </div>
          </div>

          {/* Genuine Availability & Local Setup Instructions (Requirement 4 & 15) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Chrome Companion Status</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionState === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-700">
                  {connectionState === 'connected' ? 'Connected ✓' : 'Ready to connect'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                To load the companion in Google Chrome:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>
                  Open <code className="bg-slate-100 text-slate-900 px-1 py-0.5 rounded font-mono">chrome://extensions/</code> in Chrome.
                </li>
                <li>Toggle on <strong>&quot;Developer mode&quot;</strong> in the top-right corner.</li>
                <li>Click <strong>&quot;Load unpacked&quot;</strong> in the top-left corner.</li>
                <li>
                  Select the extension folder:{' '}
                  <button
                    type="button"
                    onClick={handleCopyPath}
                    className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    <span>/extension</span>
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </li>
              </ol>
            </div>
          </div>

          {/* Interactive Test Portal Link */}
          <div className="flex items-center justify-between p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-950 block">
                Interactive Scholarship Forms Demo
              </span>
              <span className="text-[11px] text-slate-600">
                Test Form A (*Current educational institution*) & Form B (*Institution presently attended*)
              </span>
            </div>
            <a
              href="/demo.html"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors shrink-0"
            >
              <span>Try Demo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleSimulateConnection}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                connectionState === 'connected'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>
                {connectionState === 'connected' ? 'Toggle Disconnect' : 'Connect Chrome'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
