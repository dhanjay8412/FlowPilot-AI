import { apiFetch } from './client';

export const api = {
  // Auth
  login: (data: any) => apiFetch<{ success: boolean; data: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => apiFetch<{ success: boolean; data: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiFetch<{ success: boolean; data: any }>('/auth/me'),
  logout: () => apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // Workspaces
  getWorkspaces: () => apiFetch<{ success: boolean; data: any[] }>('/workspaces'),
  getWorkspaceDetails: (id: string) => apiFetch<{ success: boolean; data: any }>(`/workspaces/${id}`),
  getMembers: (wsId: string) => apiFetch<{ success: boolean; data: any[] }>(`/workspaces/${wsId}/members`),
  addMember: (wsId: string, data: any) => apiFetch<{ success: boolean; data: any }>(`/workspaces/${wsId}/members`, { method: 'POST', body: JSON.stringify(data) }),

  // Tasks
  getTasks: (params: string = '') => apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/tasks?${params}`),
  createTask: (data: any) => apiFetch<{ success: boolean; data: any }>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => apiFetch<{ success: boolean; data: any }>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => apiFetch<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
  getTaskActivity: (id: string) => apiFetch<{ success: boolean; data: any[] }>(`/tasks/${id}/activity`),
  getComments: (id: string) => apiFetch<{ success: boolean; data: any[] }>(`/tasks/${id}/comments`),
  addComment: (id: string, data: any) => apiFetch<{ success: boolean; data: any }>(`/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),

  // AI Operations
  classifyTask: (data: any) => apiFetch<{ success: boolean; data: any }>('/ai/classify-task', { method: 'POST', body: JSON.stringify(data) }),
  summarizeMeeting: (data: any) => apiFetch<{ success: boolean; data: any }>('/ai/summarize-meeting', { method: 'POST', body: JSON.stringify(data) }),
  generateDailyReport: () => apiFetch<{ success: boolean; data: any }>('/ai/generate-daily-report', { method: 'POST' }),

  // Meetings
  getMeetings: () => apiFetch<{ success: boolean; data: any[] }>('/meetings'),
  createMeeting: (data: any) => apiFetch<{ success: boolean; data: any }>('/meetings', { method: 'POST', body: JSON.stringify(data) }),
  convertActionItemToTask: (meetingId: string, itemId: string) =>
    apiFetch<{ success: boolean; data: any }>(`/meetings/${meetingId}/action-items/${itemId}/create-task`, { method: 'POST' }),

  // Analytics
  getOverview: () => apiFetch<{ success: boolean; data: any }>('/analytics/overview'),
  getCompletionTrend: () => apiFetch<{ success: boolean; data: any[] }>('/analytics/task-completion'),
  getTeamPerformance: () => apiFetch<{ success: boolean; data: any[] }>('/analytics/team-performance'),
  getTaskDistribution: () => apiFetch<{ success: boolean; data: any }>('/analytics/task-distribution'),

  // Notifications
  getNotifications: () => apiFetch<{ success: boolean; data: any[]; unreadCount: number }>('/notifications'),
  markNotificationRead: (id: string) => apiFetch<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiFetch<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),

  // Daily Reports
  getDailyReports: () => apiFetch<{ success: boolean; data: any[] }>('/daily-reports'),
};
