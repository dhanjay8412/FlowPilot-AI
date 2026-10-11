import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AiTaskModal } from '../modals/AiTaskModal';
import { SummarizeMeetingModal } from '../modals/SummarizeMeetingModal';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { toggleNotificationPanel } from '../../store/slices/uiSlice';
import { X, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';

export const AppLayout: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen, notificationPanelOpen } = useSelector((state: RootState) => state.ui);

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const notifications = notificationsData?.data || [];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Topbar />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <AiTaskModal />
      <SummarizeMeetingModal />
      <CreateTaskModal />

      {/* Slide-out Notification Drawer */}
      {notificationPanelOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-80 bg-[#121722] border-l border-[#2A3447] shadow-2xl flex flex-col animate-slideInRight">
          <div className="p-4 border-b border-[#2A3447] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm">Notifications</h3>
            </div>
            <button
              onClick={() => dispatch(toggleNotificationPanel())}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No new notifications</div>
            ) : (
              notifications.map((n: any) => (
                <div key={n.id} className="p-3 rounded-xl bg-[#1A2130] border border-[#2A3447] space-y-1">
                  <div className="text-xs font-semibold text-blue-400">{n.title}</div>
                  <div className="text-xs text-slate-200">{n.message}</div>
                  <div className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
