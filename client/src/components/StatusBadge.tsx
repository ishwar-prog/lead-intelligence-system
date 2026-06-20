import type { LeadStatus, LeadCategory } from '../types/lead.types';

interface StatusBadgeProps {
  status: LeadStatus;
  category?: LeadCategory;
}

/**
 * StatusBadge — pure presentational component
 *
 * Professor Note: this component receives data and renders it.
 * It has no state, no API calls, no side effects. This is called
 * a "presentational" or "dumb" component - and that's a compliment,
 * not an insult. Components that do one visual job, predictably,
 * are easy to test and easy to reuse.
 */
export function StatusBadge({ status, category }: StatusBadgeProps) {
  if (status === 'pending') {
    return <span className="badge badge-pending">Analyzing…</span>;
  }

  if (status === 'failed') {
    return <span className="badge badge-failed">Analysis Failed</span>;
  }

  // status === 'analyzed' - show category instead
  const categoryClass = category ? `badge-${category}` : '';
  return (
    <span className={`badge ${categoryClass}`}>
      {category?.toUpperCase() ?? 'ANALYZED'}
    </span>
  );
}