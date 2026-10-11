import { TaskPriority } from './task';

export interface ClassifyTaskAiResult {
  suggestedTitle: string;
  priority: TaskPriority;
  category: string;
  suggestedDeadline?: string;
  confidence: number;
  reasoning: string;
  clarificationNeeded?: string;
}

export interface SummarizeMeetingAiResult {
  summary: string;
  keyDecisions: string[];
  actionItems: Array<{
    description: string;
    suggestedAssignee?: string;
    suggestedDeadline?: string;
    priority?: TaskPriority;
  }>;
  risks: string[];
  openQuestions: string[];
}
