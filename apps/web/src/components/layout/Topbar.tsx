import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout, setCurrentWorkspace } from '../../store/slices/authSlice';
import { openModal, toggleNotificationPanel } from '../../store/slices/uiSlice';
import {
  Sparkles,
  Plus,
  Bell,
  User as UserIcon,
  LogOut,
  Building2,
  ChevronDown,
  Video,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user, currentWorkspace, workspaces } = useSelector((state: RootState) => state.auth);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-[#121722]/80 backdrop-blur-md border-b border-[#2A3447] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Workspace Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1A2130] border border-[#2A3447] text-slate-200 hover:text-white hover:border-blue-500/50 transition-all"
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold max-w-[160px] truncate">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {showWorkspaceMenu && (
          <div className="absolute top-full mt-2 left-0 w-64 bg-[#121722] border border-[#2A3447] rounded-xl shadow-2xl p-2 z-50">
            <div className="text-[11px] font-semibold uppercase text-slate-400 px-3 py-1.5">Switch Workspace</div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  dispatch(setCurrentWorkspace(ws));
                  setShowWorkspaceMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                  ws.id === currentWorkspace?.id
                    ? 'bg-blue-600/20 text-blue-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{ws.name}</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{ws.userRole}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        {/* AI Task Creator Button */}
        <button
          onClick={() => dispatch(openModal('aiTask'))}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Task Assistant</span>
        </button>

        {/* AI Meeting Summarizer Button */}
        <button
          onClick={() => dispatch(openModal('summarizeMeeting'))}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A2130] border border-[#2A3447] hover:border-blue-500/50 text-slate-200 hover:text-white font-medium text-sm transition-all"
        >
          <Video className="w-4 h-4 text-indigo-400" />
          <span>Summarize Meeting</span>
        </button>

        {/* Create Task Button */}
        <button
          onClick={() => dispatch(openModal('createTask'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A2130] border border-[#2A3447] text-slate-200 hover:text-white transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Task</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => dispatch(toggleNotificationPanel())}
          className="p-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-slate-300 hover:text-white relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-[#1A2130] border border-[#2A3447] hover:border-slate-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">{user?.name || 'User'}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#121722] border border-[#2A3447] rounded-xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-[#2A3447] mb-1">
                <div className="text-sm font-semibold text-white">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  dispatch(logout());
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
