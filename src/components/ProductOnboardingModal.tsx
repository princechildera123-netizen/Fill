import React, { useState } from 'react';
import {
  Shield,
  Brain,
  Database,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  FileText,
  Globe,
  Lock,
  ChevronLeft,
  GraduationCap,
  Layers,
  Laptop
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { VaultData } from '../types/fill';
import { setVaultValueByKey } from '../services/vaultSchema';

export interface OnboardingData {
  useCases: string[];
  mode: 'documents' | 'websites' | 'both';
  name: string;
  email: string;
  school: string;
  course: string;
}

interface ProductOnboardingModalProps {
  isOpen: boolean;
  vault: VaultData;
  onUpdateVault: (updated: VaultData) => void;
  onFinishOnboarding: (choice: 'documents' | 'websites' | 'both') => void;
  onClose: () => void;
}

export const ProductOnboardingModal: React.FC<ProductOnboardingModalProps> = ({
  isOpen,
  vault,
  onUpdateVault,
  onFinishOnboarding,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Step 2 State
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([
    'applications',
    'documents',
    'websites',
  ]);
  const [selectedMode, setSelectedMode] = useState<'documents' | 'websites' | 'both'>('both');

  // Step 3 Vault Setup State
  const [name, setName] = useState(
    [vault.identity.firstName, vault.identity.lastName].filter(Boolean).join(' ') || ''
  );
  const [email, setEmail] = useState(vault.contact.email || '');
  const [school, setSchool] = useState(vault.education.school || '');
  const [course, setCourse] = useState(vault.education.course || '');

  if (!isOpen) return null;

  const toggleUseCase = (id: string) => {
    if (selectedUseCases.includes(id)) {
      if (selectedUseCases.length > 1) {
        setSelectedUseCases(selectedUseCases.filter((item) => item !== id));
      }
    } else {
      setSelectedUseCases([...selectedUseCases, id]);
    }
  };

  const handleSaveVaultStep = () => {
    let updated = { ...vault };
    if (name.trim()) {
      const parts = name.trim().split(' ');
      const first = parts[0] || '';
      const last = parts.slice(1).join(' ') || '';
      updated = setVaultValueByKey(updated, 'identity.firstName', first);
      updated = setVaultValueByKey(updated, 'identity.lastName', last);
    }
    if (email.trim()) {
      updated = setVaultValueByKey(updated, 'contact.email', email.trim());
    }
    if (school.trim()) {
      updated = setVaultValueByKey(updated, 'education.school', school.trim());
    }
    if (course.trim()) {
      updated = setVaultValueByKey(updated, 'education.course', course.trim());
    }
    onUpdateVault(updated);
    setStep(4);
  };

  return (
    <div
      id="product-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Step Progress Top Bar */}
        <div className="bg-slate-900 text-white px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <AppLogo size="sm" showTagline={false} />
              <span className="text-slate-400 font-mono text-[11px]">&bull; Product Setup</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              Step {step} of {totalSteps}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body per Step */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                  Welcome to FILL
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">
                  Your information. One time.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  FILL learns the information you reuse and helps you complete forms faster without typing the same details repeatedly.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: USE CASE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
                  What brings you to FILL?
                </h2>
                <p className="text-xs text-slate-500">
                  Select how you plan to use FILL. You can change this anytime.
                </p>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <div
                  onClick={() => toggleUseCase('applications')}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-center justify-between ${
                    selectedUseCases.includes('applications')
                      ? 'border-indigo-600 bg-indigo-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">🎓 Applications</span>
                    <span className="text-[11px] text-slate-500">Scholarships, universities, competitions and internships.</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                    selectedUseCases.includes('applications') ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                  }`}>
                    {selectedUseCases.includes('applications') && '✓'}
                  </div>
                </div>

                <div
                  onClick={() => toggleUseCase('documents')}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-center justify-between ${
                    selectedUseCases.includes('documents')
                      ? 'border-indigo-600 bg-indigo-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">📄 Documents</span>
                    <span className="text-[11px] text-slate-500">PDFs, images, scans and downloaded application forms.</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                    selectedUseCases.includes('documents') ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                  }`}>
                    {selectedUseCases.includes('documents') && '✓'}
                  </div>
                </div>

                <div
                  onClick={() => toggleUseCase('websites')}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-center justify-between ${
                    selectedUseCases.includes('websites')
                      ? 'border-indigo-600 bg-indigo-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">🌐 Websites</span>
                    <span className="text-[11px] text-slate-500">Online registration forms directly in Google Chrome.</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                    selectedUseCases.includes('websites') ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                  }`}>
                    {selectedUseCases.includes('websites') && '✓'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VAULT SETUP */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1 text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
                  Let&apos;s build your Vault
                </h2>
                <p className="text-xs text-slate-500">
                  Start with the information you use most. You can skip optional fields.
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Primary Email</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Educational Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. Saint Patrick's College"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Course / Programme</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveVaultStep}
                  className="flex-1 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
                >
                  <span>Save & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VAULT CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
                  Your Vault is ready.
                </h2>
                <p className="text-xs text-slate-500">
                  You control what FILL stores and when it uses your information.
                </p>
              </div>

              {/* Vault Visualization */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">FILL VAULT</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Protected
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-800 font-medium">
                    <span className="text-slate-500">✓ Full name:</span>
                    <span className="font-bold">{name || 'Alex Rivera'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 font-medium">
                    <span className="text-slate-500">✓ Email:</span>
                    <span className="font-bold">{email || 'alex@example.com'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 font-medium">
                    <span className="text-slate-500">✓ School:</span>
                    <span className="font-bold">{school || "Saint Patrick's College"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 font-medium">
                    <span className="text-slate-500">✓ Course:</span>
                    <span className="font-bold">{course || 'Computer Science'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: INTRODUCE FILL SENSE */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
                  FILL understands meaning.
                </h2>
                <p className="text-xs text-slate-500">
                  Different wording. Same meaning.
                </p>
              </div>

              {/* Semantic transformation widget */}
              <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 text-left space-y-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Unknown Form Field</span>
                  <span className="text-xs font-mono text-slate-200">&quot;Institution presently attended&quot;</span>
                </div>

                <div className="text-center text-indigo-400 font-bold text-xs py-1">
                  &darr; FILL SENSE &darr;
                </div>

                <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-300 uppercase font-bold block">Mapped Concept</span>
                    <span className="text-xs font-bold text-white">School</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    97% confidence
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex-1 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: FIRST SUCCESS CHOICE */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
                  Let&apos;s fill your first form.
                </h2>
                <p className="text-xs text-slate-500">
                  Choose where you want to test FILL right now.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div
                  onClick={() => {
                    onFinishOnboarding('documents');
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">
                    📄 Try a document
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Upload a form and see FILL understand fields and complete it.
                  </p>
                </div>

                <div
                  onClick={() => {
                    onFinishOnboarding('websites');
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-white hover:bg-indigo-50/20 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">
                    🌐 Try a website
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    See FILL work directly inside live scholarship web forms.
                  </p>
                </div>
              </div>

              {/* Checklist completion indicator */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-around font-medium">
                <span className="flex items-center gap-1 text-emerald-700">✓ Vault</span>
                <span className="flex items-center gap-1 text-emerald-700">✓ FILL Sense</span>
                <span className="flex items-center gap-1 text-emerald-700">✓ Memory</span>
                <span className="flex items-center gap-1 text-emerald-700">✓ Guard</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onFinishOnboarding('both')}
                  className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
