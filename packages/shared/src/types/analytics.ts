export interface AnalyticsOverview {
  totalActiveTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  onTimeCompletionRate: number;
  productivityScore: number;
}

export interface TaskCompletionTrend {
  date: string;
  completed: number;
  created: number;
}

export interface TaskStatusDistribution {
  todo: number;
  inProgress: number;
  blocked: number;
  done: number;
}

export interface TaskPriorityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface TeamWorkloadItem {
  userId: string;
  userName: string;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface DailyReport {
  id: string;
  workspaceId: string;
  reportDate: string;
  timezone: string;
  generatedAt: string;
  metricsSnapshot: AnalyticsOverview;
  narrative: {
    todaysProgress: string;
    pendingWork: string;
    highPriorityFocus: string;
    blockersAndRisks: string[];
    recommendedNextActions: string[];
  };
  status: 'pending' | 'generated' | 'failed';
}
