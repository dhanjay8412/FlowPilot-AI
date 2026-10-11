import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { ClassifyTaskAiResult, SummarizeMeetingAiResult } from '@flowpilot/shared';

export class AiService {
  private genAI?: GoogleGenerativeAI;

  constructor() {
    if (env.GEMINI_API_KEY && !env.ENABLE_MOCK_AI) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  /**
   * AI Task Auto-Classification & Extraction
   */
  async classifyTask(promptText: string, context?: string): Promise<ClassifyTaskAiResult> {
    if (env.ENABLE_MOCK_AI || !this.genAI) {
      return this.mockClassifyTask(promptText);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      });

      const prompt = `
System Instruction: You are an expert project management AI assistant.
Analyze the user's natural language task request and extract a structured task classification.
Respond ONLY with a valid JSON object matching this schema:
{
  "suggestedTitle": "Short, clear action-oriented title",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "category": "Engineering" | "Design" | "Support" | "Operations" | "General",
  "suggestedDeadline": "YYYY-MM-DD" or null,
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief justification based strictly on prompt text",
  "clarificationNeeded": "Question if details are ambiguous, or null"
}

Task Request: "${promptText}"
Additional Context: "${context || 'None'}"
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      return {
        suggestedTitle: parsed.suggestedTitle || promptText.substring(0, 50),
        priority: ['Low', 'Medium', 'High', 'Critical'].includes(parsed.priority) ? parsed.priority : 'Medium',
        category: parsed.category || 'General',
        suggestedDeadline: parsed.suggestedDeadline || undefined,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
        reasoning: parsed.reasoning || 'Extracted from user input.',
        clarificationNeeded: parsed.clarificationNeeded || undefined,
      };
    } catch (error) {
      console.warn('[AI Service] Gemini call failed, falling back to mock provider:', error);
      return this.mockClassifyTask(promptText);
    }
  }

  /**
   * AI Meeting Transcript Summarizer
   */
  async summarizeMeeting(transcript: string, title?: string): Promise<SummarizeMeetingAiResult> {
    if (env.ENABLE_MOCK_AI || !this.genAI) {
      return this.mockSummarizeMeeting(transcript, title);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      });

      const prompt = `
System Instruction: You are an executive business operations AI.
Summarize the meeting transcript.
Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "Executive summary paragraph (2-4 sentences)",
  "keyDecisions": ["Decision 1", "Decision 2"],
  "actionItems": [
    {
      "description": "Action item description",
      "suggestedAssignee": "Name if explicitly stated in transcript, else null",
      "suggestedDeadline": "Target date if mentioned, else null",
      "priority": "Low" | "Medium" | "High" | "Critical"
    }
  ],
  "risks": ["Identified risk or blocker 1"],
  "openQuestions": ["Unresolved question 1"]
}

Meeting Title: ${title || 'Team Sync'}
Transcript:
${transcript}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      return {
        summary: parsed.summary || 'Summary unavailable.',
        keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        openQuestions: Array.isArray(parsed.openQuestions) ? parsed.openQuestions : [],
      };
    } catch (error) {
      console.warn('[AI Service] Gemini meeting summarization failed, using mock provider:', error);
      return this.mockSummarizeMeeting(transcript, title);
    }
  }

  /**
   * AI Daily Narrative Generator
   */
  async generateDailyReportNarrative(metrics: any): Promise<{
    todaysProgress: string;
    pendingWork: string;
    highPriorityFocus: string;
    blockersAndRisks: string[];
    recommendedNextActions: string[];
  }> {
    if (env.ENABLE_MOCK_AI || !this.genAI) {
      return this.mockDailyReportNarrative(metrics);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      });

      const prompt = `Return JSON with fields: todaysProgress (string), pendingWork (string), highPriorityFocus (string), blockersAndRisks (array of strings), recommendedNextActions (array of strings). Do not invent numbers.
Metrics JSON: ${JSON.stringify(metrics)}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (error) {
      return this.mockDailyReportNarrative(metrics);
    }
  }

  // --- Safe Deterministic Mock Fallbacks ---

  private mockClassifyTask(promptText: string): ClassifyTaskAiResult {
    const lower = promptText.toLowerCase();
    let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    let category = 'General';

    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap') || lower.includes('broken')) {
      priority = 'Critical';
    } else if (lower.includes('today') || lower.includes('customer') || lower.includes('bug')) {
      priority = 'High';
    } else if (lower.includes('low') || lower.includes('someday') || lower.includes('minor')) {
      priority = 'Low';
    }

    if (lower.includes('customer') || lower.includes('ticket') || lower.includes('support')) {
      category = 'Support';
    } else if (lower.includes('api') || lower.includes('code') || lower.includes('bug') || lower.includes('feature')) {
      category = 'Engineering';
    } else if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
      category = 'Design';
    }

    const todayStr = new Date().toISOString().split('T')[0];

    return {
      suggestedTitle: promptText.length > 60 ? promptText.substring(0, 57) + '...' : promptText,
      priority,
      category,
      suggestedDeadline: priority === 'Critical' || priority === 'High' ? todayStr : undefined,
      confidence: 0.92,
      reasoning: `Categorized as ${category} with ${priority} priority based on prompt keywords.`,
    };
  }

  private mockSummarizeMeeting(transcript: string, title?: string): SummarizeMeetingAiResult {
    return {
      summary: `The team discussed ${title || 'key workspace operations'}, reviewing current sprint milestones and technical alignment points.`,
      keyDecisions: [
        'Approved sprint roadmap adjustments and resource allocation for Q4 priorities.',
        'Agreed on standardizing tenant isolation testing across all database endpoints.',
      ],
      actionItems: [
        {
          description: 'Finalize database schema migration scripts for workspace audit logging.',
          suggestedAssignee: 'Lead Engineer',
          suggestedDeadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          priority: 'High',
        },
        {
          description: 'Review frontend dark mode contrast guidelines against WCAG 2.2 AA standards.',
          suggestedAssignee: 'UI Designer',
          suggestedDeadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          priority: 'Medium',
        },
      ],
      risks: ['Third-party API rate limits during peak usage hours.'],
      openQuestions: ['Should we enable automated SMS reminders in addition to in-app notifications?'],
    };
  }

  private mockDailyReportNarrative(metrics: any) {
    return {
      todaysProgress: `Team completed ${metrics.completedTasks || 0} tasks today with an active completion rate of ${
        metrics.completionRate || 0
      }%.`,
      pendingWork: `${metrics.pendingTasks || 0} active tasks remain in progress across the workspace.`,
      highPriorityFocus: `${metrics.overdueTasks || 0} overdue tasks require immediate attention to maintain workflow velocity.`,
      blockersAndRisks: metrics.overdueTasks > 0 ? ['Overdue high-priority tasks may impact upcoming target deadlines.'] : ['No critical blockers reported.'],
      recommendedNextActions: [
        'Review and reassign overdue items to available team members.',
        'Conduct daily standup to unblock critical engineering tasks.',
      ],
    };
  }
}

export const aiService = new AiService();
