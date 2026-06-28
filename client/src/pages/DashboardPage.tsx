import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../hooks/useLeads';
import { useDeletedLeads } from '../hooks/useDeletedLeads';
import { useAuth } from '../hooks/useAuth';
import { deleteLead } from '../api/leads.api';
import { LeadForm } from '../components/LeadForm';
import { LeadCard } from '../components/LeadCard';
import { LeadDetailPanel } from '../components/LeadDetailPanel';
import { RemovedLeadsSection } from '../components/RemovedLeadsSection';
import type { Lead } from '../types/lead.types';

export function DashboardPage() {
  const { leads, loading, error, refetch } = useLeads();
  const { leads: deletedLeads, loading: deletedLoading, error: deletedError, refetch: refetchDeleted } = useDeletedLeads();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const liveSelectedLead = selectedLead
    ? leads.find((l) => l.id === selectedLead.id) ?? selectedLead
    : null;

  async function handleDelete(id: string) {
    try {
      setActionError(null);
      await deleteLead(id);
      if(selectedLead?.id === id) setSelectedLead(null);
      await Promise.all([refetch(), refetchDeleted()]);
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
    <div className="dashboard max-w-[1200px] mx-auto px-4 py-6 md:py-8 font-sans">
      <header className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-white/10 pb-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white font-display">
          Lead Intelligence Console
        </h1>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-slate-400 font-mono text-xs truncate max-w-[180px] sm:max-w-none">{user?.email}</span>
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-full border border-white/20 px-4 py-1.5 text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 font-sans text-xs font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#fcd34d] shadow-[0_0_5px_#fcd34d] shrink-0" />
            Recycle Bin ({deletedLeads.length})
          </button>

          <button 
            onClick={handleLogout} 
            className="rounded-full border border-white/20 px-4 py-1.5 text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 font-sans text-xs font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#fcd34d] shadow-[0_0_5px_#fcd34d] shrink-0" />
            Log out
          </button>
        </div>
      </header>

      <LeadForm onLeadCreated={refetch} />
      {actionError && <p className="form-error">{actionError}</p>}

      <section className="lead-list-section mt-8">
        <h2 className="text-white text-lg font-semibold font-display mb-4">Leads ({leads.length})</h2>
        {loading && <p className="text-slate-300">Loading…</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="lead-list">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} onDelete={handleDelete} />
          ))}
        </div>
      </section>

      <RemovedLeadsSection
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        leads={deletedLeads}
        loading={deletedLoading}
        error={deletedError}
        onActionComplete={async () => {
          await Promise.all([refetch(), refetchDeleted()]);
        }}
      />

      {liveSelectedLead && (
        <LeadDetailPanel lead={liveSelectedLead} onClose={() => setSelectedLead(null)} onReviewed={refetch} />
      )}
    </div>
  );
}
