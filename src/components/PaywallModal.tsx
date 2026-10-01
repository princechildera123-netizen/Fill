import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasProAccess,
} from '../services/revenueCat';
import {
  RevenueCatOffering,
  RevenueCatPackage,
} from '../types/subscription';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated?: () => void;
  sourceTrigger?: string; // e.g. "usage_limit", "advanced_matching", "expanded_memory", "settings"
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionUpdated,
  sourceTrigger,
}) => {
  const [offering, setOffering] = useState<RevenueCatOffering | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'info' | 'error';
    title: string;
    text: string;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('FILL Pro is being configured.');

  useEffect(() => {
    if (isOpen) {
      loadOfferingsData();
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  const loadOfferingsData = async () => {
    setIsLoading(true);
    try {
      const data = await getOfferings();
      setOffering(data.current);
      if (data.statusMessage) {
        setStatusMessage(data.statusMessage);
      }
      if (data.current?.availablePackages && data.current.availablePackages.length > 0) {
        // Default to annual or monthly or first package
        const annual = data.current.availablePackages.find((p) => p.packageType === 'ANNUAL');
        const monthly = data.current.availablePackages.find((p) => p.packageType === 'MONTHLY');
        const defaultPkg = annual || monthly || data.current.availablePackages[0];
        setSelectedPackageId(defaultPkg.identifier);
      }
    } catch (err) {
      console.error('Failed to load RevenueCat offerings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!offering || !selectedPackageId) return;
    const pkgToBuy = offering.availablePackages.find((p) => p.identifier === selectedPackageId);
    if (!pkgToBuy) return;

    setIsPurchasing(true);
    setFeedbackMsg(null);

    try {
      const res = await purchasePackage(pkgToBuy);
      if (res.success && hasProAccess()) {
        setFeedbackMsg({
          type: 'success',
          title: 'Welcome to FILL Pro',
          text: 'Your Pro features are now unlocked.',
        });
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated();
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      } else if (res.cancelled) {
        setFeedbackMsg({
          type: 'info',
          title: 'Purchase cancelled',
          text: "You're still using FILL Free.",
        });
      } else {
        setFeedbackMsg({
          type: 'error',
          title: 'Purchase failed',
          text: res.error || 'Payment could not be completed. Please try again.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        title: 'Purchase error',
        text: err?.message || 'An unexpected transaction error occurred.',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setFeedbackMsg(null);
    try {
      const res = await restorePurchases();
      setFeedbackMsg({
        type: res.restored ? 'success' : 'info',
        title: res.restored ? 'Welcome to FILL Pro' : 'Restore purchases',
        text: res.message,
      });
      if (res.restored && onSubscriptionUpdated) {
        onSubscriptionUpdated();
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch {
      setFeedbackMsg({
        type: 'error',
        title: 'Restore failed',
        text: 'Could not restore purchases at this moment.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const selectedPkg = offering?.availablePackages.find((p) => p.identifier === selectedPackageId);

  // Helper to describe billing period
  const getBillingPeriodDescription = (pkg: RevenueCatPackage) => {
    if (pkg.packageType === 'ANNUAL') return 'Billed annually • Cancel anytime';
    if (pkg.packageType === 'MONTHLY') return 'Billed monthly • Cancel anytime';
    if (pkg.packageType === 'LIFETIME') return 'One-time payment • Lifetime access';
    if (pkg.packageType === 'THREE_MONTH') return 'Billed every 3 months • Cancel anytime';
    if (pkg.packageType === 'SIX_MONTH') return 'Billed every 6 months • Cancel anytime';
    if (pkg.packageType === 'WEEKLY') return 'Billed weekly • Cancel anytime';
    return pkg.product.periodDuration ? `Billed ${pkg.product.periodDuration}` : 'Cancel anytime';
  };

  const packagesCount = offering?.availablePackages.length || 0;

  return (
    <div
      id="fill-paywall-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative bg-slate-900 text-white p-6 sm:p-7 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close paywall"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-indigo-200 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FILL PRO</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans leading-tight">
            FILL Pro
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Your information. One time. Unlimited forms.
          </p>

          {/* Context Trigger Notice if approaching or hit limit */}
          {sourceTrigger === 'usage_limit' && (
            <div className="mt-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs text-amber-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-300 shrink-0" />
              <span>You have reached your 5 free forms for this month. Upgrade for unlimited forms.</span>
            </div>
          )}
        </div>

        {/* Modal Body / Offerings */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Pro Benefits List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pro Benefits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800">Unlimited forms</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800">Advanced semantic understanding</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800">Expanded FILL Memory</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800">Advanced document processing</span>
              </div>
            </div>
          </div>

          {/* RevenueCat Offering Packages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Packages
              </h4>
              {offering && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {offering.identifier}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="p-8 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Loading RevenueCat packages...</p>
              </div>
            ) : !offering || offering.availablePackages.length === 0 ? (
              /* Clean web/development state when offerings not yet loaded from RevenueCat */
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1.5">
                <p className="text-sm font-bold text-slate-800">Subscriptions are available in the FILL mobile app.</p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  FILL Pro packages are configured dynamically in RevenueCat. In development mode with a Test Store key, packages load automatically.
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-3 ${
                  packagesCount >= 3
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : packagesCount === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1'
                }`}
              >
                {offering.availablePackages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.identifier;
                  const isAnnual = pkg.packageType === 'ANNUAL';

                  return (
                    <div
                      key={pkg.identifier}
                      id={`paywall-package-${pkg.identifier}`}
                      onClick={() => setSelectedPackageId(pkg.identifier)}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {isAnnual && (
                        <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold tracking-wider uppercase">
                          Best Value
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {pkg.product.title}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-1">
                          <span className="inline-block text-[9px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                            {pkg.packageType}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-lg font-extrabold text-slate-900">
                          {pkg.product.priceString}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                          {getBillingPeriodDescription(pkg)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback message banner */}
          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : feedbackMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-bold text-xs">{feedbackMsg.title}</p>
                <p className="text-[11px] opacity-90">{feedbackMsg.text}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3 shrink-0">
          <button
            id="paywall-start-pro-btn"
            onClick={handlePurchase}
            disabled={isPurchasing || !selectedPkg}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authorizing with RevenueCat...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  Start FILL Pro {selectedPkg ? `(${selectedPkg.product.priceString})` : ''}
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <button
              onClick={onClose}
              className="font-medium hover:text-slate-800 transition-colors cursor-pointer"
            >
              Continue with Free
            </button>

            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking purchases...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore purchases</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
