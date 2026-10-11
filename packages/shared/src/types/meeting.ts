import { TaskPriority } from './task';

export interface ActionItem {
  id: string;
  description: string;
  suggestedAssignee?: string;
  suggestedDeadline?: string;
  priority?: TaskPriority;
  status: 'pending' | 'converted' | 'dismissed';
  createdTaskId?: string;
}

export interface Meeting {
  id: string;
  workspaceId: string;
  title: string;
  transcript: string;
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
  risks: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
