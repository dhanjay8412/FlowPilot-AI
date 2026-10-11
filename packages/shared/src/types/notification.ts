export type NotificationType =
  | 'task_assigned'
  | 'task_reassigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'task_comment'
  | 'meeting_action_item'
  | 'daily_report_ready';

export interface Notification {
  id: string;
  workspaceId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  readAt?: string;
  createdAt: string;
}
