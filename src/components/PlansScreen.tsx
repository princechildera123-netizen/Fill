import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Shield,
  Zap,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasProAccess,
} from '../services/revenueCat';
import { RevenueCatOffering, RevenueCatPackage } from '../types/subscription';
import { SubscriptionStatusCard } from './SubscriptionStatusCard';

interface PlansScreenProps {
  onOpenPaywallModal: (trigger?: string) => void;
}

export const PlansScreen: React.FC<PlansScreenProps> = ({ onOpenPaywallModal }) => {
  const [offering, setOffering] = useState<RevenueCatOffering | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isPro = hasProAccess();

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setIsLoading(true);
    try {
      const data = await getOfferings();
      setOffering(data.current);
    } catch (e) {
      console.warn('Failed to load offerings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-7 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Membership & Capabilities</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Plans & Billing
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          Choose the right plan for your application volume. Powered securely by RevenueCat.
        </p>
      </div>

      {/* Subscription Status Card */}
      <SubscriptionStatusCard
        onOpenPaywall={() => onOpenPaywallModal('plans_screen')}
        onSubscriptionChanged={() => {}}
      />

      {/* Plan Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FILL Free */}
        <div className="p-7 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 font-sans">FILL Free</h3>
              <span className="text-xs font-bold text-slate-500 px-2.5 py-1 rounded-full bg-slate-100">$0 / month</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard access for occasional fellowship or collegiate grant applications.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>5 completed forms every month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full personal Vault storage (all 5 categories)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic semantic matching</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic FILL Memory storage</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PDF and document intake</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              disabled={!isPro}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                !isPro
                  ? 'bg-slate-100 text-slate-500 cursor-default'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              {!isPro ? 'Current Plan' : 'Downgrade to Free'}
            </button>
          </div>
        </div>

        {/* FILL Pro */}
        <div className="p-7 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                  <span>FILL Pro</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Unlimited
                  </span>
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-300 px-2.5 py-1 rounded-full bg-white/10">
                {offering?.monthly?.product?.priceString || 'RevenueCat Store'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed for students, researchers, and active fellowship applicants submitting multiple forms.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited forms per month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Priority Gemini 3.8 Flash AI semantic reasoning</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Expanded FILL Memory storage for custom phrasing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full Chrome Companion capabilities across websites</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Priority document extraction & multi-page support</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 relative z-10">
            <button
              onClick={() => onOpenPaywallModal('plans_screen')}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isPro ? 'Manage FILL Pro Subscription' : 'Upgrade to FILL Pro'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
