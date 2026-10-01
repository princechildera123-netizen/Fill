import React from 'react';
import {
  Home,
  Database,
  FileText,
  Brain,
  Globe,
  Sparkles,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { AuthUser } from '../services/authClient';

export type AppNavTab = 'home' | 'vault' | 'forms' | 'memory' | 'chrome' | 'plans' | 'settings';

interface AppSidebarProps {
  currentTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  user: AuthUser;
  onSignOut: () => void;
  unreviewedCount?: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onSignOut,
  unreviewedCount = 0,
}) => {
  const navItems = [
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
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <AppLogo size="md" showTagline={false} />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            v1.0
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.2">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Avatar / Profile Footer */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate block">
                {user.fullName}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                {user.email}
              </span>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
