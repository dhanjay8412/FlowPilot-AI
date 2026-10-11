import { User } from './user';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Todo' | 'In Progress' | 'Blocked' | 'Done';
export type PrioritySource = 'manual' | 'AI-assisted';

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  createdBy: string;
  assignedTo?: string;
  priority: TaskPriority;
  prioritySource: PrioritySource;
  category: string;
  status: TaskStatus;
  deadline?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  assignee?: User;
  creator?: User;
}

export interface TaskActivity {
  id: string;
  workspaceId: string;
  taskId: string;
  actorId: string;
  eventType: 'created' | 'status_change' | 'assigned' | 'priority_change' | 'commented' | 'edited';
  changes?: Record<string, { old?: any; new?: any }>;
  createdAt: string;
  actor?: User;
}

export interface Comment {
  id: string;
  workspaceId: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
}
