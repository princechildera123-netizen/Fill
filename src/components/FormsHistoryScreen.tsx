import React, { useState } from 'react';
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  PlusCircle,
  Download,
  Eye,
  Edit3,
  ExternalLink,
  Calendar,
  Layers
} from 'lucide-react';
import { FormDocument } from '../types/fill';
import { exportFormAsPDF } from '../services/formGenerator';

interface FormsHistoryScreenProps {
  forms: FormDocument[];
  onSelectForm: (form: FormDocument) => void;
  onPreviewForm?: (form: FormDocument) => void;
  onDeleteForm: (formId: string) => void;
  onFillAForm: () => void;
}

export const FormsHistoryScreen: React.FC<FormsHistoryScreenProps> = ({
  forms,
  onSelectForm,
  onPreviewForm,
  onDeleteForm,
  onFillAForm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'needs_review' | 'exported'>('all');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportPDF = async (e: React.MouseEvent, form: FormDocument) => {
    e.stopPropagation();
    try {
      setExportingId(form.id);
      await exportFormAsPDF(form);
      triggerToast(`✓ Exported ${form.title} as PDF`);
    } catch (err) {
      console.error('Export failed:', err);
      triggerToast('Export failed. Please try again.');
    } finally {
      setExportingId(null);
    }
  };

  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="fill-forms-history-screen" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-18 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Forms History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Previously analyzed applications, prepared documents, and active reviews.
          </p>
        </div>

        <button
          id="forms-history-new-btn"
          onClick={onFillAForm}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ FILL A FORM</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search forms by name or file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({forms.length})
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'ready'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Ready
          </button>
          <button
            onClick={() => setStatusFilter('exported')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'exported'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Exported
          </button>
          <button
            onClick={() => setStatusFilter('needs_review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'needs_review'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Needs Review
          </button>
        </div>
      </div>

      {/* Forms List (Section 10) */}
      {forms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">No forms yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your first form and let FILL understand it.
            </p>
          </div>
          <button
            onClick={onFillAForm}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>FILL a form</span>
          </button>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">No matching forms</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or clear the filter.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors inline-flex items-center cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredForms.map((form) => {
            const isReady = form.status === 'ready';
            const isExported = form.status === 'exported';
            const isReview = form.status === 'needs_review';

            const statusBadgeColor = isExported
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : isReady
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isReview
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200';

            const createdDate = new Date(form.importedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            const lastModified = form.lastModifiedAt
              ? new Date(form.lastModifiedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : null;

            return (
              <div
                key={form.id}
                id={`forms-history-item-${form.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Form Main Info */}
                <div
                  onClick={() => onSelectForm(form)}
                  className="flex items-start gap-4 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {form.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusBadgeColor}`}
                      >
                        {isExported
                          ? 'Exported'
                          : isReady
                          ? 'Ready'
                          : isReview
                          ? 'Needs Review'
                          : 'In Progress'}
                      </span>
                    </div>

                    {/* Section 10 Metadata */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                      <span className="font-semibold text-slate-700">
                        {form.fields.length} fields
                      </span>
                      <span>&bull;</span>
                      <span className="font-extrabold text-slate-900">
                        {form.completionRate}% complete
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {createdDate}
                      </span>
                      {lastModified && (
                        <>
                          <span>&bull;</span>
                          <span className="text-[11px] text-slate-400">
                            Modified: {lastModified}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 10 Actions: Open, Preview, Export, Delete */}
                <div className="flex items-center gap-1.5 self-start md:self-center shrink-0 pt-2 md:pt-0">
                  {/* Action 1: Open */}
                  <button
                    onClick={() => onSelectForm(form)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Open in form workspace"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </button>

                  {/* Action 2: Preview */}
                  <button
                    onClick={() => {
                      if (onPreviewForm) {
                        onPreviewForm(form);
                      } else {
                        onSelectForm(form);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Preview completed form"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Preview</span>
                  </button>

                  {/* Action 3: Export PDF */}
                  <button
                    onClick={(e) => handleExportPDF(e, form)}
                    disabled={exportingId === form.id}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    title="Export as downloadable PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{exportingId === form.id ? 'Exporting...' : 'Export'}</span>
                  </button>

                  {/* Action 4: Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${form.title}" from history?`)) {
                        onDeleteForm(form.id);
                        triggerToast('Form deleted');
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
