import type { Lead } from '../types/lead.types';
import { StatusBadge } from './StatusBadge';
import { Gauge } from './Gauge';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

export function LeadCard({ lead, onSelect }: LeadCardProps) {
  return (
    <button onClick={() => onSelect(lead)} className="instrument-card screw relative flex w-full items-center gap-4 p-4 text-left">
      {lead.aiAnalysis ? (
        <Gauge score={lead.aiAnalysis.leadScore.score} size={64} />
      ) : (
        <div className="h-10 w-16" />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <strong className="text-[15px]">{lead.company}</strong>
          <StatusBadge status={lead.status} category={lead.aiAnalysis?.leadScore.category} />
        </div>
        <div className="mt-1 flex gap-3 text-xs text-[#7a7164]">
          <span>{lead.role}</span>
          <span>{lead.industry}</span>
        </div>
      </div>
    </button>
  );
}