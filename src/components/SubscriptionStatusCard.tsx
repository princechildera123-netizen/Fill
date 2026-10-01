import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Zap,
  ExternalLink,
  ShieldCheck,
  FlaskConical,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  hasProAccess,
  getStoredCustomerInfo,
  restorePurchases,
  getDevProOverride,
  setDevProOverride,
  resetSubscriptionToFree,
  subscribeToCustomerInfo,
  initializePurchases,
  getRevenueCatDiagnostics,
} from '../services/revenueCat';
import { getUsageState, setDevUsageCount } from '../services/usageLimit';
import { MONETIZATION_CONFIG } from '../services/monetizationConfig';
import { RevenueCatCustomerInfo } from '../types/subscription';
import {
  getRevenueCatConfigSummary,
  AUTHORITATIVE_ENTITLEMENT_ID,
} from '../services/revenueCatConfig';

interface SubscriptionStatusCardProps {
  onOpenPaywall: () => void;
  onSubscriptionChanged?: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  onOpenPaywall,
  onSubscriptionChanged,
}) => {
  const [isPro, setIsPro] = useState<boolean>(() => hasProAccess());
  const [customerInfo, setCustomerInfo] = useState<RevenueCatCustomerInfo>(() =>
    getStoredCustomerInfo()
  );
  const [devOverride, setDevOverride] = useState<boolean>(() => getDevProOverride());
  const [isRestoring, setIsRestoring] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<{
    sdkStatus: 'initialized' | 'unavailable';
    environment: 'Test Store' | 'Android' | 'iOS';
    currentOfferingStatus: 'Loaded' | 'unavailable';
    packagesCount: number;
    entitlementId: 'fill_pro';
    entitlementStatus: 'Active' | 'Inactive';
  } | null>(null);

  const usage = getUsageState();
  const formsUsed = usage.formsProcessedThisMonth;
  const freeLimit = MONETIZATION_CONFIG.FREE_FORM_LIMIT;
  const configSummary = getRevenueCatConfigSummary();

  const refreshState = async () => {
    setIsPro(hasProAccess());
    setCustomerInfo(getStoredCustomerInfo());
    setDevOverride(getDevProOverride());
    try {
      const diag = await getRevenueCatDiagnostics();
      setDiagnostics(diag);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    refreshState();
    const unsubscribe = subscribeToCustomerInfo(() => {
      refreshState();
    });
    return unsubscribe;
  }, []);

  const handleRestore = async () => {
    setIsRestoring(true);
    setStatusMessage(null);
    try {
      const res = await restorePurchases();
      setStatusMessage(res.message);
      refreshState();
      if (onSubscriptionChanged) onSubscriptionChanged();
    } catch {
      setStatusMessage('Could not restore purchases at this time.');
    } finally {
      setIsRestoring(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleRefreshCustomerInfo = async () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      const purchases = await initializePurchases();
      if (purchases) {
        await purchases.getCustomerInfo();
      }
      refreshState();
      setStatusMessage('RevenueCat CustomerInfo refreshed from server.');
    } catch (err: any) {
      setStatusMessage(`Refresh notice: ${err?.message || 'Offline mode'}`);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const toggleDevOverride = () => {
    const next = !devOverride;
    setDevProOverride(next);
    setDevOverride(next);
    refreshState();
    if (onSubscriptionChanged) onSubscriptionChanged();
  };

  const handleResetToFree = () => {
    resetSubscriptionToFree();
    refreshState();
    if (onSubscriptionChanged) onSubscriptionChanged();
    setStatusMessage('Subscription reset to FILL Free.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSimulateLimit = () => {
    setDevUsageCount(MONETIZATION_CONFIG.FREE_FORM_LIMIT);
    refreshState();
    if (onSubscriptionChanged) onSubscriptionChanged();
    setStatusMessage(`Usage set to ${MONETIZATION_CONFIG.FREE_FORM_LIMIT} forms (Limit reached).`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const fillProEntitlement = customerInfo.entitlements?.active?.[AUTHORITATIVE_ENTITLEMENT_ID];

  return (
    <div
      id="fill-subscription-status-card"
      className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isPro ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isPro ? <Sparkles className="w-4 h-4 text-indigo-600" /> : <CreditCard className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Subscription</h2>
            <p className="text-xs text-slate-500">RevenueCat Entitlement: {AUTHORITATIVE_ENTITLEMENT_ID}</p>
          </div>
        </div>

        {/* Current Tier Badge */}
        {isPro ? (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>FILL Pro</span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            FILL Free
          </span>
        )}
      </div>

      {/* Plan Details & Actions */}
      {isPro ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block">FILL Pro</span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active entitlement: {AUTHORITATIVE_ENTITLEMENT_ID}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (customerInfo.managementURL) {
                    window.open(customerInfo.managementURL, '_blank', 'noopener,noreferrer');
                  } else {
                    setStatusMessage('Manage subscription through RevenueCat dashboard or store settings.');
                    setTimeout(() => setStatusMessage(null), 3500);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Manage subscription</span>
              </button>

              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{isRestoring ? 'Restoring...' : 'Restore purchases'}</span>
              </button>
            </div>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">
            You have unlocked unlimited form completion, deep semantic matching with Gemini AI, and expanded FILL Memory.
          </p>

          {fillProEntitlement?.expirationDate && (
            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60">
              <span>Next renewal / expiration:</span>
              <span className="font-medium text-slate-800">
                {new Date(fillProEntitlement.expirationDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {devOverride && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Developer Pro simulation active for testing.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block">FILL Free</span>
              <span className="text-[11px] text-slate-500">
                {formsUsed} of {freeLimit} forms used this month
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenPaywall}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Upgrade to Pro</span>
              </button>

              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{isRestoring ? 'Restoring...' : 'Restore purchases'}</span>
              </button>
            </div>
          </div>

          {/* Usage progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                formsUsed >= freeLimit ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              style={{ width: `${Math.min(100, (formsUsed / freeLimit) * 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Free users can process up to {freeLimit} forms per month with the local Vault and standard semantic matching.
          </p>
        </div>
      )}

      {/* Status banner */}
      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Developer Diagnostics Panel Toggle (Hidden from normal production users by default) */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDevPanel((prev) => !prev)}
            className="text-[11px] font-mono font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showDevPanel ? 'Hide Developer Diagnostics' : 'Developer Diagnostics (Hidden for normal users)'}</span>
          </button>

          {showDevPanel && (
            <button
              onClick={handleRefreshCustomerInfo}
              disabled={isRefreshing}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              title="Refresh CustomerInfo directly from RevenueCat SDK"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync CustomerInfo</span>
            </button>
          )}
        </div>

        {showDevPanel && (
          <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-xs font-mono border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-sm">RevenueCat</span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Developer Panel
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">SDK status:</span>
                <span className={diagnostics?.sdkStatus === 'initialized' ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold'}>
                  {diagnostics?.sdkStatus || 'unavailable'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">Environment:</span>
                <span className="text-white font-semibold">
                  {diagnostics?.environment || (configSummary.platform === 'android' ? 'Android' : configSummary.platform === 'ios' ? 'iOS' : 'Test Store')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">Current Offering:</span>
                <span className={diagnostics?.currentOfferingStatus === 'Loaded' ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold'}>
                  {diagnostics?.currentOfferingStatus || 'unavailable'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">Packages:</span>
                <span className="text-white font-semibold">
                  {diagnostics?.packagesCount ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">Entitlement:</span>
                <span className="text-indigo-300 font-bold">
                  &quot;{AUTHORITATIVE_ENTITLEMENT_ID}&quot;
                </span>
              </div>

              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">Status:</span>
                <span className={isPro ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {isPro ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Developer Sandbox Testing Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800 text-xs">
              <button
                onClick={toggleDevOverride}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                  devOverride
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
                }`}
                title="Toggle Developer Pro Simulation without real purchases"
              >
                {devOverride ? '⚡ Dev Pro ON' : 'Dev Pro OFF'}
              </button>

              {isPro && (
                <button
                  onClick={handleResetToFree}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-rose-300 hover:bg-rose-950/50 border border-rose-800/40 cursor-pointer"
                  title="Reset state to free tier"
                >
                  Test Free
                </button>
              )}

              {!isPro && formsUsed < freeLimit && (
                <button
                  onClick={handleSimulateLimit}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-amber-300 hover:bg-amber-950/50 border border-amber-800/40 cursor-pointer"
                  title="Simulate reaching monthly form limit"
                >
                  Simulate Limit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
