import type { Lead } from '../types/lead.types';
import { StatusBadge } from './StatusBadge';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

export function LeadCard({ lead, onSelect }: LeadCardProps) {
  return (
    <button className="lead-card" onClick={() => onSelect(lead)}>
      <div className="lead-card-header">
        <strong>{lead.company}</strong>
        <StatusBadge
          status={lead.status}
          category={lead.aiAnalysis?.leadScore.category}
        />
      </div>
      <div className="lead-card-meta">
        <span>{lead.role}</span>
        <span>{lead.industry}</span>
        {lead.aiAnalysis && (
          <span className="lead-card-score">
            Score: {lead.aiAnalysis.leadScore.score}
          </span>
        )}
      </div>
      {lead.humanReviewed && (
        <span className="lead-card-reviewed">✓ Human Reviewed</span>
      )}
    </button>
  );
}