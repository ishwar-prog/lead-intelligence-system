import apiClient from './client';
import axios from 'axios';
import type{
  Lead,
  CreateLeadInput,
  HumanReviewInput,
  ApiResponse,
  PaginatedLeadsResponse,
  LeadExtractionResult,
} from '../types/lead.types';

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as { message?: unknown } | undefined;
    const message = typeof data?.message === 'string' ? data.message : error.message;
    return `${message} (status ${error.response.status})`;
  }

  return error instanceof Error ? error.message : 'Request failed';
}

/**
 * leads.api.ts — The ONLY file that knows your backend's URL structure
 *
 * Professor Note:
 * Components never call axios directly. They call these functions.
 * This means if your API routes ever change shape (e.g. /api/leads
 * becomes /api/v2/leads), you update 4 functions in this one file —
 * not every component that happens to fetch leads.
 *
 * This mirrors exactly what services/lead/lead.service.ts does on
 * the backend: an isolation layer between "business logic" (here,
 * UI logic) and the external dependency (here, the HTTP API).
 */

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const response = await apiClient.post<ApiResponse<Lead>>('/leads', input);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to create lead');
  }
  return response.data.data;
}

export async function getLeads(params?: {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedLeadsResponse> {
  const response = await apiClient.get<PaginatedLeadsResponse>('/leads', {
    params,
  });
  return response.data;
}

export async function getLeadById(id: string): Promise<Lead> {
  const response = await apiClient.get<ApiResponse<Lead>>(`/leads/${id}`);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Lead not found');
  }
  return response.data.data;
}

export async function submitHumanReview(
  id: string,
  input: HumanReviewInput
): Promise<Lead> {
  const response = await apiClient.patch<ApiResponse<Lead>>(
    `/leads/${id}/review`,
    input
  );
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to submit review');
  }
  return response.data.data;
}

export async function deleteLead(id: string): Promise<void> {
  await apiClient.delete(`/leads/${id}`);
}

export async function extractLeadFromText(rawText: string): Promise<LeadExtractionResult> {
  try {
    const response = await apiClient.post<ApiResponse<LeadExtractionResult>>('/leads/extract', { rawText });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to extract lead');
    }
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getDeletedLeads(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedLeadsResponse> {
  const response = await apiClient.get<PaginatedLeadsResponse>('/leads/deleted', {
    params,
  });
  return response.data;
}

export async function restoreLead(id: string): Promise<Lead> {
  const response = await apiClient.post<ApiResponse<Lead>>(`/leads/${id}/restore`);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to restore lead');
  }
  return response.data.data;
}

export async function permanentlyDeleteLead(id: string): Promise<void> {
  await apiClient.delete(`/leads/${id}/permanent`);
}

export async function restoreAllLeads(): Promise<void> {
  await apiClient.post('/leads/restore-all');
}

export async function permanentlyDeleteAllLeads(): Promise<void> {
  await apiClient.delete('/leads/clean-all');
}
