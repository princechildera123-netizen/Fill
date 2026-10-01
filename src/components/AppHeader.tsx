import React from 'react';
import { ShieldCheck, HelpCircle, Sparkles, Crown } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { hasProAccess } from '../services/revenueCat';

interface AppHeaderProps {
  vaultCompleteness: number;
  onOpenDemoTour: () => void;
  onNavigateToVault: () => void;
  onOpenWelcome: () => void;
  onOpenPaywall?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  vaultCompleteness,
  onOpenDemoTour,
  onNavigateToVault,
  onOpenWelcome,
  onOpenPaywall,
}) => {
  const isPro = hasProAccess();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="cursor-pointer" onClick={onOpenWelcome} title="View FILL Overview">
          <AppLogo size="sm" showTagline={false} />
        </div>

        {/* Right header controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subscription Tier Badge */}
          {isPro ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 text-amber-900 border border-amber-300/80 shadow-xs"
              title="FILL Pro Active (RevenueCat Entitlement: fill_pro)"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>FILL Pro</span>
            </div>
          ) : (
            <button
              onClick={onOpenPaywall}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-colors cursor-pointer"
              title="Free Plan — Click to explore FILL Pro"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Free</span>
            </button>
          )}

          {/* Demo Tour Button */}
          <button
            id="header-demo-tour-btn"
            onClick={onOpenDemoTour}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 border border-indigo-200/60 transition-colors cursor-pointer"
            title="Open 2-minute demonstration flow"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">2-Min Demo Flow</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Vault Completion Pill */}
          <button
            id="header-vault-status-btn"
            onClick={onNavigateToVault}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
            title="Click to view and edit Vault"
          >
            <span className="text-slate-500 hidden md:inline">Vault:</span>
            <span className="font-bold text-slate-900">{vaultCompleteness}%</span>
            <span
              className={`w-2 h-2 rounded-full ${
                vaultCompleteness >= 80
                  ? 'bg-emerald-500'
                  : vaultCompleteness >= 40
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </button>

          {/* Local Security Badge */}
          <div
            className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 px-2 py-1 rounded-md"
            title="Your Vault is stored locally on this device only."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local Vault</span>
          </div>

          {/* Help / Guide */}
          <button
            id="header-help-btn"
            onClick={onOpenWelcome}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="About FILL"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
