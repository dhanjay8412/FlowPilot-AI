import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  Video,
  Users,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { currentWorkspace } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { label: 'Overview', path: '/overview', icon: LayoutDashboard },
    { label: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
    { label: 'All Tasks', path: '/all-tasks', icon: ListTodo },
    { label: 'Meetings', path: '/meetings', icon: Video },
    { label: 'Team', path: '/team', icon: Users },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'AI Daily Reports', path: '/daily-reports', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-[#121722] border-r border-[#2A3447] transition-all duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#2A3447]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg text-white tracking-tight truncate">FlowPilot AI</span>
              <span className="text-xs text-slate-400 font-medium truncate">Operations Workspace</span>
            </div>
          )}
        </div>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Workspace Indicator */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-b border-[#2A3447]/50 bg-[#1A2130]/50">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Workspace</div>
          <div className="text-sm font-semibold text-blue-400 truncate mt-0.5">
            {currentWorkspace?.name || 'Default Workspace'}
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${!sidebarOpen ? 'justify-center px-0' : ''}`
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 text-slate-300" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Info */}
      {sidebarOpen && (
        <div className="p-4 border-t border-[#2A3447] text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>FlowPilot v1.0.0</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          </div>
        </div>
      )}
    </aside>
  );
};
