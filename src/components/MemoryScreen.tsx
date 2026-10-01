import React, { useState } from 'react';
import {
  Brain,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  Shield,
  Search,
  BookOpen
} from 'lucide-react';
import { LearnedMapping } from '../types/fill';
import {
  loadLearnedMemory,
  deleteLearnedMapping,
  clearAllMemory,
} from '../services/memoryStorage';

interface MemoryScreenProps {
  learnedMemory: LearnedMapping[];
  onMemoryUpdated: () => void;
  onOpenDemoB?: () => void;
}

export const MemoryScreen: React.FC<MemoryScreenProps> = ({
  learnedMemory,
  onMemoryUpdated,
  onOpenDemoB,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleDelete = (id: string) => {
    deleteLearnedMapping(id);
    onMemoryUpdated();
    showToast('Learned mapping removed from FILL Memory');
  };

  const handleClearAll = () => {
    if (confirm('Clear all learned field associations from FILL Memory?')) {
      clearAllMemory();
      onMemoryUpdated();
      showToast('FILL Memory reset');
    }
  };

  const filtered = learnedMemory.filter((mem) => {
    const q = searchQuery.toLowerCase();
    const phrase = (mem.sourcePhrase || mem.originalLabel || '').toLowerCase();
    const title = (mem.vaultFieldTitle || mem.confirmedVaultField || '').toLowerCase();
    return phrase.includes(q) || title.includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-7 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Brain className="w-3.5 h-3.5" />
            <span>Semantic Knowledge Graph</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            FILL Memory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Confirmed semantic associations learned from your form approvals.
          </p>
        </div>

        {learnedMemory.length > 0 && (
          <button
            onClick={handleClearAll}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Clear All Memory
          </button>
        )}
      </div>

      {/* Explanation Banner */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Learned by you &bull; Privacy Mandate</span>
        </div>
        <p className="leading-relaxed">
          FILL only learns mappings that you explicitly confirm. Memory stores relationship paths (e.g. <em>&quot;Institution presently attended&quot;</em> &rarr; <em>School</em>). It never stores static personal answers; values are always retrieved fresh from your active Vault.
        </p>
      </div>

      {/* Search Input */}
      {learnedMemory.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search learned phrasing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-2xs"
          />
        </div>
      )}

      {/* Mappings List or Empty State */}
      {learnedMemory.length === 0 ? (
        <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-200 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">FILL Memory is learning</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              When you confirm an uncertain field mapping on an application form, FILL Memory remembers the relationship. Subsequent forms with synonymous wording are recognized automatically.
            </p>
          </div>
          {onOpenDemoB && (
            <button
              onClick={onOpenDemoB}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Test Form B Memory Recognition</span>
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No learned mappings matched &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((mem) => (
            <div
              key={mem.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="text-indigo-600">🧠</span>
                  <span className="truncate">&quot;{mem.sourcePhrase || mem.originalLabel}&quot;</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    {mem.vaultFieldTitle || mem.confirmedVaultField}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Used {mem.useCount || mem.confirmationCount || 1} time{(mem.useCount || mem.confirmationCount || 1) > 1 ? 's' : ''}</span>
                  <span>&bull;</span>
                  <span>Confirmed {new Date(mem.confirmedAt || mem.updatedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(mem.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Forget this association"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
