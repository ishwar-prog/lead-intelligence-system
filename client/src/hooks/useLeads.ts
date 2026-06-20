import { useState, useEffect, useCallback, useRef } from 'react';
import { getLeads } from '../api/leads.api';
import type { Lead } from '../types/lead.types';

const POLL_INTERVAL_MS = 3000;

/**
 * useLeads — fetches the lead list, and intelligently polls
 *
 * Professor Note — this is the most important concept in Phase 3:
 *
 * NAIVE polling would just do `setInterval(fetchLeads, 3000)` forever,
 * the moment the component mounts, and never stop. That hammers your
 * API and database with requests even when nothing is changing —
 * imagine 50 leads, all already 'analyzed', being re-fetched every
 * 3 seconds for no reason, forever, for every user with the tab open.
 *
 * SMART polling (what we're building) only polls WHILE at least one
 * lead is still 'pending'. The moment every lead has resolved to
 * 'analyzed' or 'failed', the interval clears itself automatically.
 * If a new lead is submitted later, a fresh poll cycle begins.
 *
 * This is the exact distinction between "it works" and "it works AND
 * won't fall over or rack up costs at scale." This is the difference
 * a senior engineer is paid to think about.
 */
export function useLeads(filters: { status?: string; category?: string } = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false); // Prevent overlapping fetches

  // useRef, not useState, for the interval ID — we don't want changing
  // this value to trigger a re-render. It's bookkeeping, not UI state.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stringify filters for a stable dependency - without this, passing
  // a new object literal `{}` on every render would re-trigger the
  // effect infinitely, since object references are never equal.
  const filtersKey = JSON.stringify(filters);

  const fetchLeads = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const result = await getLeads(filters);
      setLeads(result.leads);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // Initial fetch + re-fetch whenever filters change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // The smart polling effect
  useEffect(() => {
    const hasPending = leads.some((lead) => lead.status === 'pending');

    if (hasPending && !intervalRef.current) {
      intervalRef.current = setInterval(fetchLeads, POLL_INTERVAL_MS);
    }

    if (!hasPending && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup: always clear the interval if the component unmounts,
    // regardless of pending state. Forgetting this causes a classic
    // React bug - the interval keeps firing and tries to update state
    // on a component that no longer exists.
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [leads, fetchLeads]);

  return { leads, loading, error, refetch: fetchLeads };
}