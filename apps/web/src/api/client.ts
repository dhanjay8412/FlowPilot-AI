import { store } from '../store';

const API_BASE = '/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const state = store.getState();
  const token = state.auth.token || localStorage.getItem('flowpilot_token');
  const workspaceId = state.auth.currentWorkspace?.id || localStorage.getItem('flowpilot_workspace_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (workspaceId) {
    headers['X-Workspace-ID'] = workspaceId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}
