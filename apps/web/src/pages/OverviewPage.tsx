import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { KpiCard } from '../components/common/KpiCard';
import { CompletionTrendChart } from '../components/charts/CompletionTrendChart';
import { StatusDistributionChart } from '../components/charts/StatusDistributionChart';
import { useDispatch } from 'react-redux';
import { openModal } from '../store/slices/uiSlice';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Award,
  Sparkles,
  Plus,
  Video,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const dispatch = useDispatch();

  const { data: overviewData, isLoading: loadingOverview } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => api.getOverview(),
  });

  const { data: trendData } = useQuery({
    queryKey: ['analyticsTrend'],
    queryFn: () => api.getCompletionTrend(),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['recentTasks'],
    queryFn: () => api.getTasks('limit=5&sort=-createdAt'),
  });

  const { data: distributionData } = useQuery({
    queryKey: ['taskDistribution'],
    queryFn: () => api.getTaskDistribution(),
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

  const tasks = tasksData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Smart Workspace Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time productivity, AI operations digest, and team task status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(openModal('aiTask'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Auto-Classify Task</span>
          </button>
          <button
            onClick={() => dispatch(openModal('createTask'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-slate-200 hover:text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Pending Tasks"
          value={overview.pendingTasks}
          subtitle="Requires attention"
          icon={ListTodo}
          color="blue"
        />
        <KpiCard
          title="Completed Tasks"
          value={overview.completedTasks}
          subtitle={`Completion rate: ${overview.completionRate}%`}
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          title="Overdue Tasks"
          value={overview.overdueTasks}
          subtitle="Past deadline"
          icon={AlertTriangle}
          color="rose"
        />
        <KpiCard
          title="Workflow Productivity Score"
          value={`${overview.productivityScore}/100`}
          subtitle={`On-time rate: ${overview.onTimeCompletionRate}%`}
          icon={Award}
          color="indigo"
        />
      </div>

      {/* Analytics Charts & AI Digest Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Completion Timeline */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#2A3447]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Task Completion Trend</h3>
              <p className="text-xs text-slate-400">Created vs Completed tasks over time</p>
            </div>
            <Link to="/analytics" className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold">
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <CompletionTrendChart data={trendData?.data || []} />
        </div>

        {/* Task Status Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-[#2A3447] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Status Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Current task status allocation</p>
            <StatusDistributionChart distribution={distributionData?.data?.statusDistribution} />
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="glass-panel p-6 rounded-2xl border border-[#2A3447]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Recent Workspace Tasks</h3>
          <Link to="/all-tasks" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
            <span>All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No tasks created yet in this workspace.</div>
        ) : (
          <div className="divide-y divide-[#2A3447]/60">
            {tasks.map((t: any) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.status === 'Done'
                        ? 'bg-emerald-500'
                        : t.status === 'In Progress'
                        ? 'bg-blue-500'
                        : t.status === 'Blocked'
                        ? 'bg-amber-500'
                        : 'bg-slate-500'
                    }`}
                  ></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>Category: {t.category}</span>
                      <span>•</span>
                      <span>Assignee: {t.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      t.priority === 'Critical'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : t.priority === 'High'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span className="text-xs bg-[#1A2130] text-slate-400 px-2.5 py-1 rounded-lg border border-[#2A3447]">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
