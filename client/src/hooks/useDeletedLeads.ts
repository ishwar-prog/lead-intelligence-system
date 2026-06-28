import { useState, useEffect, useCallback, useRef } from 'react';
import { getDeletedLeads } from '../api/leads.api';
import type { Lead } from '../types/lead.types';

export function useDeletedLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const fetchDeletedLeads = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const result = await getDeletedLeads();
      setLeads(result.leads);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load removed leads');
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDeletedLeads();
  }, [fetchDeletedLeads]);

  return { leads, loading, error, refetch: fetchDeletedLeads };
}
