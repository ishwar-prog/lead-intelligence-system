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
  const created = new Date(lead.createdAt).toLocaleString(undefined, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  return (
    <div className="instrument-card screw relative flex items-center gap-4 p-4">
      <button onClick={() => onSelect(lead)} className="flex flex-1 items-center gap-4 text-left">
        {lead.aiAnalysis ? <Gauge score={lead.aiAnalysis.leadScore.score} size={64} /> : <div className="h-10 w-16" />}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <strong className="text-[15px]">{lead.company}</strong>
            <StatusBadge status={lead.status} category={lead.aiAnalysis?.leadScore.category} />
          </div>
          <div className="mt-1 flex gap-3 text-xs text-[#7a7164]">
            <span>{lead.role}</span>
            <span>{lead.industry}</span>
            <span className="font-mono">{created}</span>
          </div>
        </div>
      </button>
      <LiquidButton
        onClick={(e) => { e.stopPropagation(); if (confirm(`Remove ${lead.company}?`)) onDelete(lead.id); }}
        className="font-mono text-xs text-[#9C3B3B] bg-transparent hover:bg-[#9C3B3B]/10 px-3 py-1 shadow-none border-none"
      >
        Remove
      </LiquidButton>
    </div>
  );
}