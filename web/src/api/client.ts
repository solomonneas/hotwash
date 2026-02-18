/**
 * API Client for Playbook Forge
 *
 * Typed fetch wrappers for CRUD + version history.
 */

import { PlaybookGraph } from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface ApiErrorResponse {
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: any;
}

export class ApiClientError extends Error {
  status: number;
  data: ApiErrorResponse | null;

  constructor(message: string, status: number, data: ApiErrorResponse | null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export interface ApiPlaybookSummary {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  node_count?: number;
  edge_count?: number;
  graph_json?: PlaybookGraph;
  content_markdown?: string;
}

export interface ApiPlaybook extends ApiPlaybookSummary {
  content_markdown: string;
  graph_json?: PlaybookGraph;
}

export interface ApiPlaybookVersion {
  id: string;
  playbook_id: string;
  version_number: number;
  content_markdown: string;
  graph_json?: PlaybookGraph;
  created_at?: string;
  change_summary?: string;
}

export interface LoadingState<T> {
  loading: boolean;
  error: ApiClientError | null;
  data: T | null;
}

export function createLoadingState<T>(data: T | null = null): LoadingState<T> {
  return { loading: false, error: null, data };
}

export async function runWithLoading<T>(
  setState: (state: LoadingState<T>) => void,
  task: () => Promise<T>
): Promise<T | null> {
  setState({ loading: true, error: null, data: null });
  try {
    const data = await task();
    setState({ loading: false, error: null, data });
    return data;
  } catch (err) {
    const error = err instanceof ApiClientError ? err : new ApiClientError('Unknown error', 0, null);
    setState({ loading: false, error, data: null });
    return null;
  }
}

const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function parseJsonSafe(response: Response): Promise<any | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...jsonHeaders,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const data = await parseJsonSafe(response);
    const message =
      data?.detail ||
      data?.error ||
      data?.message ||
      response.statusText ||
      'Request failed';
    throw new ApiClientError(message, response.status, data);
  }

  const data = await parseJsonSafe(response);
  return data as T;
}

export interface ListPlaybooksFilters {
  category?: string;
  tag?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function listPlaybooks(filters: ListPlaybooksFilters = {}): Promise<ApiPlaybookSummary[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return request<ApiPlaybookSummary[]>(`/api/playbooks${qs ? `?${qs}` : ''}`);
}

export function getPlaybook(id: string): Promise<ApiPlaybook> {
  return request<ApiPlaybook>(`/api/playbooks/${encodeURIComponent(id)}`);
}

export interface CreatePlaybookPayload {
  title: string;
  description?: string;
  category?: string;
  content_markdown: string;
  tags?: string[];
}

export function createPlaybook(data: CreatePlaybookPayload): Promise<ApiPlaybook> {
  return request<ApiPlaybook>('/api/playbooks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface UpdatePlaybookPayload {
  title?: string;
  description?: string;
  category?: string;
  content_markdown?: string;
  tags?: string[];
}

export function updatePlaybook(id: string, data: UpdatePlaybookPayload): Promise<ApiPlaybook> {
  return request<ApiPlaybook>(`/api/playbooks/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function deletePlaybook(id: string): Promise<{ success: boolean } | null> {
  return request<{ success: boolean } | null>(`/api/playbooks/${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
}

export function duplicatePlaybook(id: string): Promise<ApiPlaybook> {
  return request<ApiPlaybook>(`/api/playbooks/${encodeURIComponent(id)}/duplicate`, {
    method: 'POST',
  });
}

export function getVersions(id: string): Promise<ApiPlaybookVersion[]> {
  return request<ApiPlaybookVersion[]>(`/api/playbooks/${encodeURIComponent(id)}/versions`);
}

export function getVersion(id: string, versionNumber: number): Promise<ApiPlaybookVersion> {
  return request<ApiPlaybookVersion>(`/api/playbooks/${encodeURIComponent(id)}/versions/${versionNumber}`);
}
