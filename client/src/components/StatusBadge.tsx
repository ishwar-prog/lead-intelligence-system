import type { LeadStatus, LeadCategory } from '../types/lead.types';

interface StatusBadgeProps {
  status: LeadStatus;
  category?: LeadCategory;
}

const CATEGORY_COLOR: Record<LeadCategory, string> = {
  hot: 'var(--color-brass-dark)',
  warm: '#9C7A2E',
  cold: 'var(--color-steel)',
};

export function StatusBadge({ status, category }: StatusBadgeProps) {
  if (status === 'pending') {
    return <span className="font-mono text-[11px] tracking-wide" style={{ color: 'var(--color-steel)' }}>◌ ANALYZING</span>;
  }
  if (status === 'failed') {
    return <span className="font-mono text-[11px] tracking-wide text-[#9C3B3B]">⊘ FAILED</span>;
  }
  return (
    <span className="font-mono text-[11px] tracking-wide" style={{ color: category ? CATEGORY_COLOR[category] : 'var(--color-ink)' }}>
      ● {category?.toUpperCase() ?? 'DONE'}
    </span>
  );
}