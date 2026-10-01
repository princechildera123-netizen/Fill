import React, { useEffect, useState } from 'react';
import {
  FileSearch,
  Scan,
  Brain,
  CheckCircle2,
  Database,
  ShieldCheck,
  Check,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { FormFieldInput } from '../types/fill';

interface VisionScreenProps {
  documentTitle: string;
  fields: FormFieldInput[];
  onAnalysisComplete: () => void;
}

export const VisionScreen: React.FC<VisionScreenProps> = ({
  documentTitle,
  fields,
  onAnalysisComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [revealedCount, setRevealedCount] = useState<number>(0);

  // Exact 6 Processing Stages requested in Requirement 7:
  // Reading form -> Detecting fields -> Understanding meaning -> Matching information -> Checking confidence -> Form ready
  const stages = [
    { title: 'Reading form', desc: 'Analyzing layout, page geometry & input structures', icon: FileSearch },
    { title: 'Detecting fields', desc: `Identified ${fields.length} candidate application inputs`, icon: Scan },
    { title: 'Understanding meaning', desc: 'FILL Sense semantic semantic evaluation', icon: Brain },
    { title: 'Matching information', desc: 'Correlating with user local Vault repository', icon: Database },
    { title: 'Checking confidence', desc: 'FILL Guard reliability analysis & memory checks', icon: ShieldCheck },
    { title: 'Form ready', desc: 'Preparing interactive review workspace', icon: FileCheck },
  ];

  useEffect(() => {
    // Stage 0: Reading form (0 - 600ms)
    const t0 = setTimeout(() => {
      setCurrentStep(1); // Detecting fields
      // Stream detected field pills
      const interval = setInterval(() => {
        setRevealedCount((prev) => {
          if (prev >= fields.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 55);
    }, 600);

    // Stage 2: Understanding meaning (600 - 1500ms)
    const t1 = setTimeout(() => {
      setCurrentStep(2);
    }, 1500);

    // Stage 3: Matching information (1500 - 2400ms)
    const t2 = setTimeout(() => {
      setCurrentStep(3);
    }, 2400);

    // Stage 4: Checking confidence (2400 - 3200ms)
    const t3 = setTimeout(() => {
      setCurrentStep(4);
    }, 3200);

    // Stage 5: Form ready (3200 - 3900ms)
    const t4 = setTimeout(() => {
      setCurrentStep(5);
    }, 3900);

    // Complete and handoff
    const t5 = setTimeout(() => {
      onAnalysisComplete();
    }, 4500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [fields.length, onAnalysisComplete]);

  return (
    <div id="fill-vision-screen" className="max-w-2xl mx-auto px-4 py-10 pb-24 text-center animate-in fade-in duration-200">
      {/* Central Visual Graphic */}
      <div className="relative w-18 h-18 mx-auto mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-slate-900/10 animate-ping opacity-60" />
        <div className="relative w-18 h-18 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl border border-slate-800">
          <Brain className="w-9 h-9 animate-pulse text-indigo-300" />
        </div>
      </div>

      <div className="space-y-1.5 mb-7">
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>FILL Sense Intelligence</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          {currentStep === 5 ? 'Form Ready!' : 'Analyzing your form...'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto truncate font-medium">
          {documentTitle}
        </p>
      </div>

      {/* 6 Stage Processing Flow (Requirement 7) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs mb-6 text-left space-y-2.5">
        {stages.map((stage, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          const Icon = stage.icon;

          return (
            <div
              key={stage.title}
              className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all ${
                isCurrent
                  ? 'bg-slate-50 border border-slate-200/90 shadow-2xs'
                  : isDone
                  ? 'opacity-85'
                  : 'opacity-35'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : isCurrent
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{stage.title}</h4>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider animate-pulse">
                      In progress...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detected Field Stream Preview */}
      <div className="text-left bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Detected Fields ({Math.min(revealedCount, fields.length)} of {fields.length})
          </h4>
          <span className="text-[11px] text-slate-400">Live Stream</span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
          {fields.slice(0, revealedCount || 3).map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-800 border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[180px]">{f.label}</span>
            </span>
          ))}
          {revealedCount < fields.length && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 italic">
              Scanning remaining fields...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
