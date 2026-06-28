import { useState } from 'react';
import type { Lead } from '../types/lead.types';
import { StatusBadge } from './StatusBadge';
import { Gauge } from './Gauge';
import { LiquidButton } from './ui/liquid-glass-button';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onDelete : (leadId: string) => void;
}

export function LeadCard({ lead, onSelect, onDelete }: LeadCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const created = new Date(lead.createdAt).toLocaleString(undefined, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="instrument-card screw relative flex items-center gap-4 p-4 overflow-hidden">
      {showConfirm && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-between px-6 z-20 animate-fadeIn">
          <span className="text-xs font-semibold text-rose-300 font-sans">Remove lead from dashboard?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(lead.id); setShowConfirm(false); }}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer font-sans"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      <button onClick={() => onSelect(lead)} className="flex flex-1 items-center gap-4 text-left">
        {lead.aiAnalysis ? <Gauge score={lead.aiAnalysis.leadScore.score} size={64} /> : <div className="h-10 w-16" />}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <strong className="text-[15px]">{lead.company}</strong>
            <StatusBadge status={lead.status} category={lead.aiAnalysis?.leadScore.category} />
          </div>
          <div className="mt-1 flex gap-3 text-xs text-slate-300">
            <span>{lead.role}</span>
            <span>{lead.industry}</span>
            <span className="font-mono">{created}</span>
          </div>
        </div>
      </button>
      <LiquidButton
        onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
        className="font-mono text-xs text-rose-400 bg-transparent hover:bg-rose-500/10 px-3 py-1 shadow-none border-none"
      >
        Remove
      </LiquidButton>
    </div>
  );
}