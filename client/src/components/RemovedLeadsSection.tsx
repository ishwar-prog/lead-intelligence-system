import { useState } from 'react';
import {
  restoreLead,
  permanentlyDeleteLead,
  restoreAllLeads,
  permanentlyDeleteAllLeads,
} from '../api/leads.api';
import { RotateCcw, Trash2, FolderOpen, AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Lead } from '../types/lead.types';
import { motion, AnimatePresence } from 'motion/react';

interface RemovedLeadsSectionProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  loading: boolean;
  error: string | null;
  onActionComplete: () => void;
}

export function RemovedLeadsSection({
  isOpen,
  onClose,
  leads,
  loading,
  error,
  onActionComplete,
}: RemovedLeadsSectionProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  async function handleRestore(id: string) {
    try {
      setActionError(null);
      setSubmitting(true);
      await restoreLead(id);
      onActionComplete();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to restore lead');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePermanentDelete(id: string) {
    try {
      setActionError(null);
      setSubmitting(true);
      await permanentlyDeleteLead(id);
      onActionComplete();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to permanently delete lead');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRestoreAll() {
    if (leads.length === 0) return;
    try {
      setActionError(null);
      setSubmitting(true);
      await restoreAllLeads();
      onActionComplete();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to restore all leads');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePermanentDeleteAll() {
    if (leads.length === 0) return;
    try {
      setActionError(null);
      setSubmitting(true);
      await permanentlyDeleteAllLeads();
      onActionComplete();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to permanently delete all leads');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-slate-950/95 border-l border-white/10 shadow-2xl z-50 flex flex-col p-6 backdrop-blur-lg overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FolderOpen size={20} style={{ color: 'var(--color-brass-dark)' }} />
                <h2 className="text-lg font-semibold text-white font-display flex items-center gap-2">
                  Recycle Bin
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-300">
                    {leads.length}
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Top Batch Actions */}
            {leads.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Batch Operations:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRestoreAll}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <span className="w-1.2 h-1.2 rounded-full bg-[#fcd34d] shadow-[0_0_4px_#fcd34d] shrink-0" />
                    Restore All
                  </button>
                  <button
                    onClick={() => setShowConfirmDeleteAll(true)}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-rose-300 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <span className="w-1.2 h-1.2 rounded-full bg-[#fcd34d] shadow-[0_0_4px_#fcd34d] shrink-0" />
                    Empty Trash
                  </button>
                </div>
              </div>
            )}

            {/* Custom Confirm Delete All Block */}
            {showConfirmDeleteAll && (
              <div className="mt-3 bg-rose-950/40 border border-rose-500/25 p-3 rounded-2xl animate-fadeIn">
                <p className="text-xs font-semibold text-rose-200">Permanently delete ALL removed leads? This action cannot be undone.</p>
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    onClick={() => setShowConfirmDeleteAll(false)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { handlePermanentDeleteAll(); setShowConfirmDeleteAll(false); }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            )}

            {/* Errors display */}
            {actionError && (
              <p className="mt-3 text-xs text-[#f87171] bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 animate-fadeIn flex items-center gap-1.5">
                <AlertTriangle size={14} />
                {actionError}
              </p>
            )}

            {error && (
              <p className="mt-3 text-xs text-[#f87171] bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 animate-fadeIn flex items-center gap-1.5">
                <AlertTriangle size={14} />
                {error}
              </p>
            )}

            {/* Scrolling List */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {loading ? (
                <div className="text-center text-slate-400 text-sm py-8">Loading Recycle Bin…</div>
              ) : leads.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] py-12 text-center text-xs text-slate-400">
                  No leads in the Recycle Bin.
                </div>
              ) : (
                leads.map((lead) => {
                  const created = new Date(lead.createdAt).toLocaleString(undefined, {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  });
                  const removed = lead.deletedAt ? new Date(lead.deletedAt).toLocaleString(undefined, {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  }) : 'Unknown';
                  
                  const isExpanded = expandedLeadId === lead.id;

                  return (
                    <div
                      key={lead.id}
                      className="instrument-card screw relative flex flex-col border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300"
                    >
                      {/* Individual Custom Confirm Permanent Delete Overlay */}
                      {confirmDeleteId === lead.id && (
                        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-between px-6 z-20 animate-fadeIn rounded-2xl">
                          <span className="text-xs font-semibold text-rose-300 font-sans">Permanently delete lead?</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                              className="px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePermanentDelete(lead.id); setConfirmDeleteId(null); }}
                              className="px-3 py-1.5 rounded-full text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Header Summary Trigger */}
                      <button
                        onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                        className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-[14px] text-white font-display leading-tight">{lead.company}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {lead.role} in {lead.industry}
                          </p>
                          <span className="text-[9px] text-rose-300/80 font-mono block mt-1">
                            Removed: {removed}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {lead.aiAnalysis ? (
                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">
                              {lead.aiAnalysis.leadScore.score}/100
                            </span>
                          ) : (
                            <StatusBadge status={lead.status} />
                          )}
                          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </div>
                      </button>

                      {/* Expanded Panel */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 bg-black/20 animate-fadeIn text-xs text-slate-300">
                          <div className="grid grid-cols-2 gap-2 bg-black/10 p-2.5 rounded-xl border border-white/5">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-mono">Company Size</span>
                              <span className="text-white font-semibold font-mono">{lead.companySize}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-mono">Lead Source</span>
                              <span className="text-white font-semibold">{lead.leadSource}</span>
                            </div>
                            {lead.budgetSignal && (
                              <div className="col-span-2">
                                <span className="text-[10px] text-slate-400 block font-mono">Budget Signal</span>
                                <span className="text-white truncate block">{lead.budgetSignal}</span>
                              </div>
                            )}
                            {lead.timeline && (
                              <div className="col-span-2">
                                <span className="text-[10px] text-slate-400 block font-mono">Timeline</span>
                                <span className="text-white truncate block">{lead.timeline}</span>
                              </div>
                            )}
                          </div>

                          <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                            <span className="font-semibold block text-[9px] text-slate-400 uppercase tracking-wider mb-1 font-mono">Pain Point</span>
                            <p className="italic text-white/95 leading-relaxed">"{lead.painPoint}"</p>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <span className="text-[9px] text-slate-400 font-mono">Created: {created}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRestore(lead.id)}
                                disabled={submitting}
                                className="px-3 py-1.5 rounded-full text-[10px] font-semibold text-slate-300 border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                              >
                                <RotateCcw size={10} />
                                Restore
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(lead.id)}
                                disabled={submitting}
                                className="px-3 py-1.5 rounded-full text-[10px] font-semibold text-slate-300 border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 size={10} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
