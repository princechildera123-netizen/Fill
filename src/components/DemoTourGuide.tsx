import React from 'react';
import { Sparkles, Brain, CheckCircle2, ArrowRight, X, Play } from 'lucide-react';

interface DemoTourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFormA: () => void;
  onStartFormB: () => void;
}

export const DemoTourGuide: React.FC<DemoTourGuideProps> = ({
  isOpen,
  onClose,
  onStartFormA,
  onStartFormB,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="demo-tour-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>2-Minute Interactive Walkthrough</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-3 font-sans">
            Experience FILL Sense & Memory
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            See how FILL eliminates repetitive application forms by understanding meaning rather than simple keyword matching.
          </p>
        </div>

        {/* 2 Step Demonstration Sequence */}
        <div className="p-6 space-y-4">
          {/* Step 1: Form A */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  Form A: Global Merit Scholarship
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Formal Phrasing</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Analyze the scholarship form. Watch FILL match fields like <em>&quot;Programme of Study&quot;</em> to your course. When you review and confirm, <strong>FILL Memory</strong> records this semantic relationship.
            </p>
            <div className="pl-8 pt-1">
              <button
                id="tour-launch-form-a-btn"
                onClick={() => {
                  onClose();
                  onStartFormA();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Launch Form A Demo</span>
              </button>
            </div>
          </div>

          {/* Step 2: Form B */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  Form B: Tech Pioneer Fellowship
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-indigo-600">FILL Memory in Action</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Now open Form B with entirely different wording: <em>&quot;Institution presently attended&quot;</em> and <em>&quot;Major / Academic Focus&quot;</em>. Notice how FILL displays:
              <br />
              <span className="inline-flex items-center gap-1 font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200 mt-1">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                &quot;FILL remembered this field&quot;
              </span>
            </p>
            <div className="pl-8 pt-1">
              <button
                id="tour-launch-form-b-btn"
                onClick={() => {
                  onClose();
                  onStartFormB();
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Launch Form B Demo</span>
              </button>
            </div>
          </div>

          {/* Privacy Footnote */}
          <div className="text-[11px] text-slate-500 pt-1 text-center">
            Both demo forms are pre-packaged. No actual documents need to be uploaded.
          </div>
        </div>
      </div>
    </div>
  );
};
