import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { CompletionTrendChart } from '../components/charts/CompletionTrendChart';
import { StatusDistributionChart } from '../components/charts/StatusDistributionChart';
import { BarChart3, TrendingUp, Award, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { data: overviewData } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => api.getOverview(),
  });

  const { data: trendData } = useQuery({
    queryKey: ['analyticsTrend'],
    queryFn: () => api.getCompletionTrend(),
  });

  const { data: teamData } = useQuery({
    queryKey: ['teamPerformance'],
    queryFn: () => api.getTeamPerformance(),
  });

  const overview = overviewData?.data || {
    totalActiveTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    onTimeCompletionRate: 0,
    productivityScore: 0,
  };

  const teamList = teamData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics & Productivity Hub</h1>
        <p className="text-sm text-slate-400 mt-1">Data-driven workflow metrics, completion rate, and team throughput.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-[#2A3447]">
          <span className="text-xs font-semibold text-slate-400 uppercase">Completion Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">{overview.completionRate}%</div>
          <span className="text-xs text-slate-400 mt-1 block">Completed vs Total active tasks</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-[#2A3447]">
          <span className="text-xs font-semibold text-slate-400 uppercase">On-Time Completion</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-2">{overview.onTimeCompletionRate}%</div>
          <span className="text-xs text-slate-400 mt-1 block">Tasks completed before deadline</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-[#2A3447]">
          <span className="text-xs font-semibold text-slate-400 uppercase">Productivity Score</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">{overview.productivityScore}/100</div>
          <span className="text-xs text-slate-400 mt-1 block">Calculated via 60% Completion + 40% On-Time rate</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#2A3447]">
          <h3 className="text-base font-bold text-white mb-2">14-Day Completion Timeline</h3>
          <CompletionTrendChart data={trendData?.data || []} />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[#2A3447]">
          <h3 className="text-base font-bold text-white mb-2">Task Allocation</h3>
          <StatusDistributionChart />
        </div>
      </div>

      {/* Team Workload Table */}
      <div className="glass-panel p-6 rounded-2xl border border-[#2A3447]">
        <h3 className="text-base font-bold text-white mb-4">Team Throughput & Overdue Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#2A3447] text-xs font-semibold uppercase text-slate-400">
                <th className="pb-3">Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Active Tasks</th>
                <th className="pb-3">Completed</th>
                <th className="pb-3">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3447]/60">
              {teamList.map((t: any) => (
                <tr key={t.userId} className="hover:bg-slate-800/30">
                  <td className="py-3 font-semibold text-white">{t.userName}</td>
                  <td className="py-3 text-slate-400">{t.role}</td>
                  <td className="py-3 text-blue-400 font-semibold">{t.assignedTasks}</td>
                  <td className="py-3 text-emerald-400 font-semibold">{t.completedTasks}</td>
                  <td className="py-3 text-rose-400 font-semibold">{t.overdueTasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
