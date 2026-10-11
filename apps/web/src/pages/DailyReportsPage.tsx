import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { FileText, Sparkles, Check, AlertTriangle, Loader2 } from 'lucide-react';

export const DailyReportsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: reportsData } = useQuery({
    queryKey: ['dailyReports'],
    queryFn: () => api.getDailyReports(),
  });

  const generateReportMutation = useMutation({
    mutationFn: () => api.generateDailyReport(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyReports'] });
    },
  });

  const reports = reportsData?.data || [];
  const latestReport = reports[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Daily Reports & Digest</h1>
          <p className="text-sm text-slate-400 mt-1">Automated daily summary of workspace achievements, pending items, and focus areas.</p>
        </div>
        <button
          onClick={() => generateReportMutation.mutate()}
          disabled={generateReportMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm shadow-md disabled:opacity-50"
        >
          {generateReportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Today's Report</span>
        </button>
      </div>

      {latestReport ? (
        <div className="glass-panel p-6 rounded-2xl border border-[#2A3447] space-y-6">
          <div className="flex items-center justify-between border-b border-[#2A3447] pb-4">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Latest Executive Report</span>
              <h2 className="text-xl font-bold text-white mt-0.5">Date: {latestReport.reportDate}</h2>
            </div>
            <span className="text-xs text-slate-400">Generated: {new Date(latestReport.generatedAt).toLocaleTimeString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#1A2130] border border-[#2A3447] space-y-1">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase">Today's Progress</h4>
              <p className="text-sm text-slate-200">{latestReport.narrative?.todaysProgress}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#1A2130] border border-[#2A3447] space-y-1">
              <h4 className="text-xs font-semibold text-blue-400 uppercase">Pending Work</h4>
              <p className="text-sm text-slate-200">{latestReport.narrative?.pendingWork}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1A2130] border border-amber-500/30 space-y-1">
            <h4 className="text-xs font-semibold text-amber-400 uppercase">High Priority Focus</h4>
            <p className="text-sm text-slate-200">{latestReport.narrative?.highPriorityFocus}</p>
          </div>

          {latestReport.narrative?.recommendedNextActions && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Recommended Actions</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                {latestReport.narrative.recommendedNextActions.map((act: string, idx: number) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#2A3447] text-slate-400 text-sm">
          No daily report generated yet. Click "Generate Today's Report" to analyze metrics.
        </div>
      )}
    </div>
  );
};
