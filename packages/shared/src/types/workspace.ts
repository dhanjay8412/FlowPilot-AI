import { Role } from './user';

export interface WorkspaceSettings {
  timezone: string;
  defaultTaskPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  enableAiSuggestions: boolean;
  dailyReportTime: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  userRole?: Role;
}
