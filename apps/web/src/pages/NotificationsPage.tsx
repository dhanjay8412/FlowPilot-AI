import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { Bell, Check, CheckCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notificationsData?.data || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Notification Center</h1>
          <p className="text-sm text-slate-400 mt-1">In-app task assignments, due reminders, and meeting alerts.</p>
        </div>
        <button
          onClick={() => markAllMutation.mutate()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A2130] border border-[#2A3447] text-slate-200 hover:text-white text-xs font-semibold"
        >
          <CheckCheck className="w-4 h-4 text-blue-400" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-[#2A3447] space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No notifications found.</div>
        ) : (
          notifications.map((n: any) => (
            <div key={n.id} className="p-4 rounded-xl bg-[#1A2130] border border-[#2A3447] flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
