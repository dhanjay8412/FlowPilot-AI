import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';

export const MyTasksPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['myTasks', user?.id],
    queryFn: () => api.getTasks(`assignedTo=${user?.id || ''}`),
    enabled: !!user?.id,
  });

  const tasks = tasksData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Assigned Tasks</h1>
        <p className="text-sm text-slate-400 mt-1">Focus on your active deliverables and upcoming deadlines.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-[#2A3447]">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">You have no tasks assigned to you in this workspace.</div>
        ) : (
          <div className="divide-y divide-[#2A3447]">
            {tasks.map((t: any) => (
              <div key={t.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.category} • Due: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${t.priority === 'Critical' ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
                    {t.priority}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30">
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
