import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Settings, Building2, Globe, Clock, Sparkles, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentWorkspace } = useSelector((state: RootState) => state.auth);

  const [wsName, setWsName] = useState(currentWorkspace?.name || 'Acme Operations');
  const [timezone, setTimezone] = useState(currentWorkspace?.settings?.timezone || 'America/New_York');
  const [defaultPriority, setDefaultPriority] = useState(currentWorkspace?.settings?.defaultTaskPriority || 'Medium');
  const [enableAi, setEnableAi] = useState(currentWorkspace?.settings?.enableAiSuggestions ?? true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Workspace & Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure workspace defaults, timezone, and AI automation features.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-[#2A3447] space-y-6">
        <div className="border-b border-[#2A3447] pb-4">
          <h3 className="text-base font-bold text-white">General Workspace Preferences</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Workspace Name</label>
            <input
              type="text"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Workspace Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
              >
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Default Task Priority</label>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A2130] border border-[#2A3447]">
            <div>
              <h4 className="text-sm font-bold text-white">Enable AI Operations Assistant</h4>
              <p className="text-xs text-slate-400 mt-0.5">Allows automatic task classification and transcript summarization.</p>
            </div>
            <input
              type="checkbox"
              checked={enableAi}
              onChange={(e) => setEnableAi(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#2A3447]">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
