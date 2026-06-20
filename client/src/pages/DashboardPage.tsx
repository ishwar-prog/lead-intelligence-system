import { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { LeadForm } from '../components/LeadForm';
import { LeadCard } from '../components/LeadCard';
import { LeadDetailPanel } from '../components/LeadDetailPanel';
import type { Lead } from '../types/lead.types';

export function DashboardPage() {
  const { leads, loading, error, refetch } = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // When the detail panel is open and the underlying lead updates
  // (e.g. status flips from pending -> analyzed via polling, or a
  // review gets submitted), keep the open panel in sync rather than
  // showing stale data until the user closes and reopens it.
  const liveSelectedLead = selectedLead
    ? leads.find((l) => l.id === selectedLead.id) ?? selectedLead
    : null;

  return (
    <div className="dashboard">
      <header>
        <h1>Lead Intelligence Dashboard</h1>
      </header>

      <LeadForm onLeadCreated={refetch} />

      <section className="lead-list-section">
        <h2>Leads ({leads.length})</h2>

        {loading && <p>Loading…</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="lead-list">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} />
          ))}
        </div>
      </section>

      {liveSelectedLead && (
        <LeadDetailPanel
          lead={liveSelectedLead}
          onClose={() => setSelectedLead(null)}
          onReviewed={refetch}
        />
      )}
    </div>
  );
}