import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../hooks/useLeads';
import { useAuth } from '../hooks/useAuth';
import { deleteLead } from '../api/leads.api';
import { LeadForm } from '../components/LeadForm';
import { LeadCard } from '../components/LeadCard';
import { LeadDetailPanel } from '../components/LeadDetailPanel';
import type { Lead } from '../types/lead.types';

export function DashboardPage() {
  const { leads, loading, error, refetch } = useLeads();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const liveSelectedLead = selectedLead
    ? leads.find((l) => l.id === selectedLead.id) ?? selectedLead
    : null;

  async function handleDelete(id: string) {
    try {
      setActionError(null);
      await deleteLead(id);
      if(selectedLead?.id === id) setSelectedLead(null);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  }

  async function handleLogout() {
    try {
      setActionError(null);
      await logout();
      navigate('/login');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to log out');
    }
  }

  return (
    <div className="dashboard">
      <header className="flex items-center justify-between">
        <h1 className="text-white">Lead Intelligence Dashboard</h1>
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="text-slate-300">{user?.email}</span>
          <button 
            onClick={handleLogout} 
            className="rounded-full border border-white/20 px-4 py-1.5 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>
      </header>

      <LeadForm onLeadCreated={refetch} />
      {actionError && <p className="form-error">{actionError}</p>}

      <section className="lead-list-section">
        <h2 className="text-white">Leads ({leads.length})</h2>
        {loading && <p className="text-slate-300">Loading…</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="lead-list">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} onDelete={handleDelete} />
          ))}
        </div>
      </section>

      {liveSelectedLead && (
        <LeadDetailPanel lead={liveSelectedLead} onClose={() => setSelectedLead(null)} onReviewed={refetch} />
      )}
    </div>
  );
}
