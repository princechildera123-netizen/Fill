import React, { useState } from 'react';
import {
  Shield,
  Brain,
  Database,
  CreditCard,
  Info,
  Github,
  Trash2,
  CheckCircle2,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Lock,
  ChevronRight,
  Cpu,
  FlaskConical,
  Globe,
  FileText,
  Layers,
  Laptop
} from 'lucide-react';
import { LearnedMapping, VaultData } from '../types/fill';
import {
  loadLearnedMemory,
  deleteLearnedMapping,
  clearAllMemory,
} from '../services/memoryStorage';
import {
  exportVaultJSON,
  resetToSampleVault,
  clearVaultData,
} from '../services/vaultStorage';
import { clearFormsHistory } from '../services/historyStorage';
import { SemanticTestBench } from './SemanticTestBench';
import { SubscriptionStatusCard } from './SubscriptionStatusCard';
import {
  loadModePreferences,
  saveModePreferences,
  checkChromeConnectionStatus,
  setChromeConnectionStatus,
  FillModePreferences
} from '../services/modeStorage';
import { getCurrentUser, signOut, updateProfile, updatePassword, deleteAccount } from '../services/authClient';

interface SettingsScreenProps {
  vault: VaultData;
  onUpdateVault: (vault: VaultData) => void;
  onOpenWelcome: () => void;
  onOpenPaywall?: () => void;
  onOpenChromeConnect?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  vault,
  onUpdateVault,
  onOpenWelcome,
  onOpenPaywall,
  onOpenChromeConnect,
}) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [userNameInput, setUserNameInput] = useState(user?.fullName || '');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [learnedMemory, setLearnedMemory] = useState<LearnedMapping[]>(() => loadLearnedMemory());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showTestBench, setShowTestBench] = useState(false);
  const [modePrefs, setModePrefs] = useState<FillModePreferences>(() => loadModePreferences());
  const [chromeStatus, setChromeStatusState] = useState<'connected' | 'ready_to_connect'>(() =>
    checkChromeConnectionStatus()
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSaveProfile = async () => {
    if (!userNameInput.trim()) return;
    try {
      const updated = await updateProfile({ fullName: userNameInput.trim() });
      setUser(updated);
      setIsEditingProfile(false);
      showToast('Profile name updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async () => {
    if (newPasswordInput.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await updatePassword(newPasswordInput);
      if (res.success) {
        setIsChangingPassword(false);
        setNewPasswordInput('');
        showToast('Password updated successfully');
      } else {
        showToast(res.error || 'Failed to update password');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating password');
    }
  };

  const handleDeleteUserAccount = async () => {
    if (confirm('Delete your FILL account and wipe all data permanently? This action cannot be undone.')) {
      clearVaultData();
      clearAllMemory();
      clearFormsHistory();
      await deleteAccount();
      showToast('Account deleted');
      window.location.reload();
    }
  };

  const handleToggleDocMode = () => {
    const nextDocs = !modePrefs.useDocuments;
    // ensure at least one remains enabled
    if (!nextDocs && !modePrefs.useWebsites) return;
    const updated = saveModePreferences({
      useDocuments: nextDocs,
      useWebsites: modePrefs.useWebsites,
    });
    setModePrefs(updated);
    showToast(`Documents Mode ${nextDocs ? 'enabled' : 'disabled'}`);
  };

  const handleToggleWebMode = () => {
    const nextWeb = !modePrefs.useWebsites;
    // ensure at least one remains enabled
    if (!nextWeb && !modePrefs.useDocuments) return;
    const updated = saveModePreferences({
      useDocuments: modePrefs.useDocuments,
      useWebsites: nextWeb,
    });
    setModePrefs(updated);
    showToast(`Websites Mode ${nextWeb ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteMemory = (id: string) => {
    deleteLearnedMapping(id);
    setLearnedMemory(loadLearnedMemory());
    showToast('Learned mapping removed');
  };

  const handleClearAllMemory = () => {
    if (confirm('Clear all learned field associations from FILL Memory?')) {
      clearAllMemory();
      setLearnedMemory([]);
      showToast('FILL Memory reset');
    }
  };

  const handleResetSampleData = () => {
    const sample = resetToSampleVault();
    onUpdateVault(sample);
    showToast('Sample student profile restored');
  };

  const handleClearAllAppData = () => {
    if (confirm('This will wipe your Vault, FILL Memory, and forms history from this browser. Proceed?')) {
      clearVaultData();
      clearAllMemory();
      clearFormsHistory();
      onUpdateVault(resetToSampleVault());
      setLearnedMemory(loadLearnedMemory());
      showToast('All local storage cleared');
    }
  };

  return (
    <div id="fill-settings-screen" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Settings & Sovereignty
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Privacy assurances, learning memory controls, data management, and subscription architecture.
        </p>
      </div>

      {/* 0. Profile & Account Section (Section 15) */}
      {user && (
        <div id="settings-profile-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{user.fullName}</h2>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isEditingProfile ? 'Cancel' : 'Edit Name'}
              </button>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isChangingPassword ? 'Cancel' : 'Password'}
              </button>
            </div>
          </div>

          {isEditingProfile && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
                placeholder="Full name"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 outline-none"
              />
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          )}

          {isChangingPassword && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="password"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 outline-none"
              />
              <button
                onClick={handleUpdatePassword}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1. Privacy Principles Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Privacy Architecture</h2>
            <p className="text-xs text-slate-500">Transparent data handling principles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Client-Governed Storage
            </span>
            <p className="leading-relaxed">
              Your Vault data is stored in your local browser sandbox. It is never synchronized to unencrypted public databases.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              Isolated Semantic Matching
            </span>
            <p className="leading-relaxed">
              When analyzing unknown fields, FILL only sends field labels & definitions to classify meaning — never your actual personal values.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">No Auto-Submission</span>
            <p className="leading-relaxed">
              FILL prepares structured form answers for your review. It will never submit applications to university or scholarship sites without your direct action.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">No Sensitive ID Collection</span>
            <p className="leading-relaxed">
              FILL deliberately avoids collecting bank account passwords, passport scans, or national identification numbers.
            </p>
          </div>
        </div>
      </div>

      {/* 2. FILL Memory Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">FILL Memory</h2>
              <p className="text-xs text-slate-500">
                {learnedMemory.length} learned semantic associations stored
              </p>
            </div>
          </div>

          {learnedMemory.length > 0 && (
            <button
              onClick={handleClearAllMemory}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Reset Memory
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          When you confirm an uncertain field mapping on an application form, FILL Memory remembers the relationship. Subsequent forms with synonymous wording are recognized automatically.
        </p>

        {learnedMemory.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
            <h4 className="text-xs font-bold text-slate-800">FILL Memory is learning</h4>
            <p className="text-xs text-slate-500">Confirmed field mappings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {learnedMemory.map((mem) => (
              <div
                key={mem.id}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>&quot;{mem.originalLabel}&quot;</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-indigo-700">{mem.vaultFieldTitle}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Used {mem.useCount || mem.confirmationCount || 1} times &bull; Last confirmed {new Date(mem.confirmedAt || mem.updatedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteMemory(mem.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Forget this association"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Subscription Architecture & Status (RevenueCat Integration) */}
      <SubscriptionStatusCard
        onOpenPaywall={() => onOpenPaywall && onOpenPaywall()}
        onSubscriptionChanged={() => showToast('Subscription state refreshed')}
      />

      {/* 4. How I use FILL (Multi-Mode Workflow Preferences - Requirement 7) */}
      <div id="settings-how-i-use-fill" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">How I use FILL</h2>
              <p className="text-xs text-slate-500">Enable or disable Document and Website workflows</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Both workflows share the same private Vault, FILL Sense, FILL Memory, and Guard protections. You can use either one or both simultaneously.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Document Mode Toggle */}
          <div
            onClick={handleToggleDocMode}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              modePrefs.useDocuments
                ? 'border-indigo-600 bg-indigo-50/20'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className={`w-4 h-4 ${modePrefs.useDocuments ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold text-slate-900 block">📄 Documents</span>
                <span className="text-[11px] text-slate-500">Upload & complete forms</span>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                modePrefs.useDocuments ? 'bg-indigo-600 text-white' : 'border border-slate-300'
              }`}
            >
              {modePrefs.useDocuments && '✓'}
            </div>
          </div>

          {/* Website Mode Toggle */}
          <div
            onClick={handleToggleWebMode}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              modePrefs.useWebsites
                ? 'border-indigo-600 bg-indigo-50/20'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe className={`w-4 h-4 ${modePrefs.useWebsites ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-bold text-slate-900 block">🌐 Websites</span>
                <span className="text-[11px] text-slate-500">In-browser companion</span>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                modePrefs.useWebsites ? 'bg-indigo-600 text-white' : 'border border-slate-300'
              }`}
            >
              {modePrefs.useWebsites && '✓'}
            </div>
          </div>
        </div>

        {/* Chrome Companion Status Row */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                chromeStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-800">
              Chrome Companion: {chromeStatus === 'connected' ? 'Connected ✓' : 'Not connected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChromeConnect && onOpenChromeConnect()}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              {chromeStatus === 'connected' ? 'Manage Connection' : 'Connect Chrome'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Chrome Extension Companion Portal & Guide */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-sm">
              🧩
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">FILL Chrome Extension Companion</h2>
              <p className="text-xs text-slate-500">Manifest V3 &bull; Fill web forms using your private Vault & Memory</p>
            </div>
          </div>
          <a
            href="/demo.html"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span>Open Test Forms</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The companion extension scans live web forms (Google Forms, scholarship portals, grant registries), analyzes non-standard field labels (e.g. <em>&quot;Current educational institution&quot;</em> vs. <em>&quot;Institution presently attended&quot;</em>), and safely populates fields without auto-submitting.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
          <span className="font-bold text-slate-800 block">Quick Local Load Instructions:</span>
          <span>1. Open <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">chrome://extensions/</code> in Chrome &bull; 2. Enable &quot;Developer mode&quot; &bull; 3. Click &quot;Load unpacked&quot; & select the <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">/extension</code> directory.</span>
        </div>
      </div>

      {/* 5. Data Controls & Administration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Data Controls</h2>
            <p className="text-xs text-slate-500">Backup, restore, or wipe application state</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={() => exportVaultJSON(vault)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Vault JSON</span>
          </button>

          <button
            onClick={handleResetSampleData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Student Sample Profile</span>
          </button>

          <button
            onClick={handleClearAllAppData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Local Data</span>
          </button>

          <button
            onClick={handleDeleteUserAccount}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete FILL Account</span>
          </button>
        </div>
      </div>

      {/* 5. Semantic Engine Verification & Test Bench */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Semantic Matching Test Bench</h2>
              <p className="text-xs text-slate-500">Verify the 6 canonical test cases and test arbitrary phrasing live</p>
            </div>
          </div>
          <button
            onClick={() => setShowTestBench(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Open Test Bench</span>
          </button>
        </div>
        <p className="text-xs text-slate-600">
          Runs real automated evaluations verifying that academic phrasing, questions, abbreviations, and informal wording resolve correctly to the standard canonical ontology.
        </p>
      </div>

      {/* Test Bench Modal */}
      {showTestBench && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden">
            <SemanticTestBench onClose={() => setShowTestBench(false)} />
          </div>
        </div>
      )}

      {/* 6. About FILL & Open Source */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">About FILL</h2>
            <p className="text-xs text-slate-500">Version 1.0.0 &bull; Privacy-first Intelligent Form Completion</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          FILL is built with the principle: <em>Save once &bull; Understand &bull; Match &bull; Review &bull; Learn &bull; Fill</em>. Designed specifically for students completing competitive scholarships, internships, university applications, and grant registrations.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={onOpenWelcome}
            className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Revisit Onboarding Guide</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Open Source Project (MIT)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
