import React from 'react';
import {
  Home,
  Database,
  FileText,
  Brain,
  Globe,
  Sparkles,
  Settings
} from 'lucide-react';
import { AppNavTab } from './AppSidebar';

interface ResponsiveBottomNavProps {
  currentTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  unreviewedCount?: number;
}

export const ResponsiveBottomNav: React.FC<ResponsiveBottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreviewedCount = 0,
}) => {
  const tabs = [
    { id: 'home' as AppNavTab, label: 'Home', icon: Home },
    { id: 'vault' as AppNavTab, label: 'Vault', icon: Database },
    {
      id: 'forms' as AppNavTab,
      label: 'Forms',
      icon: FileText,
      badge: unreviewedCount > 0 ? unreviewedCount : undefined,
    },
    { id: 'memory' as AppNavTab, label: 'Memory', icon: Brain },
    { id: 'chrome' as AppNavTab, label: 'Chrome', icon: Globe },
    { id: 'plans' as AppNavTab, label: 'Plans', icon: Sparkles },
    { id: 'settings' as AppNavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 transition-colors shadow-lg shadow-slate-900/5"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-slate-900 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900 stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-slate-900 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
