import React, { useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Shield,
  Plus,
  Save,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { VaultData } from '../types/fill';
import {
  VAULT_FIELD_DEFINITIONS,
  getVaultValueByKey,
  setVaultValueByKey,
  calculateVaultCompleteness,
} from '../services/vaultSchema';
import { exportVaultJSON, resetToSampleVault, clearVaultData } from '../services/vaultStorage';

interface VaultScreenProps {
  vault: VaultData;
  onUpdateVault: (updated: VaultData) => void;
  onNavigateHome: () => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({
  vault,
  onUpdateVault,
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { filledCount, totalCount, percentage } = calculateVaultCompleteness(vault);

  const categories = [
    { name: 'Identity', icon: User, desc: 'Official personal identification' },
    { name: 'Contact', icon: Mail, desc: 'Email address and phone number' },
    { name: 'Education', icon: GraduationCap, desc: 'School, degree, program and level' },
    { name: 'Address', icon: MapPin, desc: 'Permanent residence and location' },
    { name: 'Emergency Contact', icon: HeartHandshake, desc: 'Designated contact and relationship' },
  ];

  const handleStartEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(getVaultValueByKey(vault, key));
  };

  const handleSaveEdit = (key: string) => {
    const updated = setVaultValueByKey(vault, key, editValue.trim());
    onUpdateVault(updated);
    setEditingKey(null);
    showToast('Vault item updated successfully');
  };

  const handleDeleteField = (key: string) => {
    const updated = setVaultValueByKey(vault, key, '');
    onUpdateVault(updated);
    showToast('Vault item cleared');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onUpdateVault(parsed);
        showToast('Vault successfully imported');
      } catch {
        alert('Invalid JSON file format. Could not import.');
      }
    };
    reader.readAsText(file);
  };

  const isVaultCompletelyEmpty = filledCount === 0;

  return (
    <div id="fill-vault-screen" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              FILL Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Personal Repository
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Save your information once. FILL uses this single source of truth to match and prepare applications.
          </p>
        </div>

        {/* Vault Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="vault-sample-data-btn"
            onClick={() => {
              const sample = resetToSampleVault();
              onUpdateVault(sample);
              showToast('Student sample vault loaded');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Load realistic student sample profile"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Profile</span>
          </button>

          <button
            id="vault-export-json-btn"
            onClick={() => exportVaultJSON(vault)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download your Vault as a private JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <label
            id="vault-import-json-label"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Import an existing Vault JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Completeness & Privacy Overview Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Completion Gauge */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={percentage >= 80 ? 'text-emerald-600' : 'text-indigo-600'}
                  strokeDasharray={`${percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-slate-800">
                {percentage}%
              </span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Vault Status: {filledCount} of {totalCount} fields saved
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {percentage === 100
                  ? 'All core application fields are complete and ready for instant form matching.'
                  : 'Add or update fields below. Changes automatically apply to all future forms.'}
              </p>
            </div>
          </div>

          {/* Privacy statement banner */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 shrink-0 font-medium">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Local Vault • Device Sandbox</span>
          </div>
        </div>
      </div>

      {/* Useful Empty State (Requirement 12) */}
      {isVaultCompletelyEmpty ? (
        <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Your Vault is empty</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Save your information once and FILL can reuse it across forms.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const sample = resetToSampleVault();
                onUpdateVault(sample);
                showToast('Sample student profile loaded');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Load sample student profile</span>
            </button>
            <button
              onClick={() => handleStartEdit('identity.firstName')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add information</span>
            </button>
          </div>
        </div>
      ) : (
        /* Category Cards (Requirement 5) */
        <div className="space-y-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const categoryFields = VAULT_FIELD_DEFINITIONS.filter((f) => f.category === cat.name);
            const savedCount = categoryFields.filter((f) => {
              const val = getVaultValueByKey(vault, f.key);
              return Boolean(val && val.trim().length > 0);
            }).length;

            return (
              <div
                key={cat.name}
                id={`vault-category-card-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                {/* Category Header */}
                <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                      <p className="text-[11px] text-slate-500">{cat.desc}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      savedCount === categoryFields.length
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : savedCount > 0
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {savedCount} of {categoryFields.length} saved
                  </span>
                </div>

                {/* Field Checklist */}
                <div className="divide-y divide-slate-100">
                  {categoryFields.map((fieldDef) => {
                    const val = getVaultValueByKey(vault, fieldDef.key);
                    const isFilled = Boolean(val && val.trim().length > 0);
                    const isEditing = editingKey === fieldDef.key;

                    return (
                      <div
                        key={fieldDef.key}
                        id={`vault-field-row-${fieldDef.key.replace('.', '-')}`}
                        className={`p-4 transition-colors ${
                          isEditing
                            ? 'bg-indigo-50/30'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {isEditing ? (
                          /* Inline Edit Form */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">
                                {fieldDef.label}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {fieldDef.description}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type={fieldDef.type || 'text'}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder={fieldDef.placeholder}
                                className="flex-1 px-3.5 py-2 rounded-xl text-xs font-medium border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(fieldDef.key);
                                  if (e.key === 'Escape') setEditingKey(null);
                                }}
                              />
                              <button
                                onClick={() => handleSaveEdit(fieldDef.key)}
                                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setEditingKey(null)}
                                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Field Display Row with Checklist Icon (Requirement 5) */
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Checkbox indicator */}
                              <div className="shrink-0">
                                {isFilled ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300" />
                                )}
                              </div>

                              {/* Label & Value */}
                              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                                <span className="text-xs font-semibold text-slate-700 shrink-0">
                                  {fieldDef.label}
                                </span>

                                <div className="min-w-0 text-right sm:text-right">
                                  {isFilled ? (
                                    <span className="text-xs font-bold text-slate-900 truncate block">
                                      {val}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">
                                      Not set
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Edit Controls */}
                            <div className="flex items-center gap-1 shrink-0">
                              {isFilled ? (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(fieldDef.key)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    title="Edit field"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteField(fieldDef.key)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Clear field"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleStartEdit(fieldDef.key)}
                                  className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
