import React from 'react';
import { Shield, Lock, Brain, FileCheck, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface WelcomeModalProps {
  isOpen: boolean;
  onGetStarted: () => void;
  onLoadDemoData: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onGetStarted,
  onLoadDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="welcome-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto">
        {/* Top subtle banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-8 sm:px-8 sm:py-10 text-center relative">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
              <AppLogo size="lg" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 font-sans">
            Your information. One time.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Save your information once. Let FILL understand and prepare scholarship, university, and internship application forms for you.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* 3 Core Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Zero Cloud Vault</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Your personal vault is stored on your device. Never uploaded to remote servers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">FILL Sense</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Understands unfamiliar wording like &quot;Institution presently attended&quot; &rarr; School.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">FILL Guard</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Never fills uncertain data silently. You review and verify every mapped field.
              </p>
            </div>
          </div>

          {/* How FILL Works Flow */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              The FILL Lifecycle
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                Save once
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                Understand
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                Review
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                Learn & Fill
              </span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-800">Privacy Guarantee:</strong> When semantic matching analyzes document fields, FILL only sends field labels to understand their meaning — never your actual personal information.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="welcome-get-started-btn"
              onClick={onGetStarted}
              className="flex-1 py-3 px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="welcome-load-demo-btn"
              onClick={onLoadDemoData}
              className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Explore with Demo Student</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
