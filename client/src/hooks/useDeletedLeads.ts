import { useState, useEffect, useCallback, useRef } from 'react';
import { getDeletedLeads } from '../api/leads.api';
import type { Lead } from '../types/lead.types';

const PAGE_SIZE = 100;

export function useDeletedLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const fetchDeletedLeads = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);

    try {
      let page = 1;
      let allLeads: Lead[] = [];
      let totalCount = 0;
      let totalPages = 1;

      do {
        const result = await getDeletedLeads({ page, limit: PAGE_SIZE });
        allLeads = allLeads.concat(result.leads);
        totalCount = result.total;
        totalPages = result.totalPages;
        page += 1;
      } while (page <= totalPages);

      setLeads(allLeads);
      setTotal(totalCount);
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

  return { leads, total, loading, error, refetch: fetchDeletedLeads };
}