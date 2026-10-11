import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Users, UserPlus, Shield, Mail, Building, Trash2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const TeamPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentWorkspace, user } = useSelector((state: RootState) => state.auth);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Member'>('Member');
  const [department, setDepartment] = useState('Engineering');

  const { data: membersData } = useQuery({
    queryKey: ['workspaceMembers', currentWorkspace?.id],
    queryFn: () => api.getMembers(currentWorkspace?.id || ''),
    enabled: !!currentWorkspace?.id,
  });

  const { data: performanceData } = useQuery({
    queryKey: ['teamPerformance'],
    queryFn: () => api.getTeamPerformance(),
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (data: any) => api.addMember(currentWorkspace?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] });
      setShowInviteModal(false);
      setEmail('');
    },
  });

  const members = membersData?.data || [];
  const workload = performanceData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Team Members & Workload</h1>
          <p className="text-sm text-slate-400 mt-1">Manage team roles, departments, and monitor workload distribution.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-[#2A3447]">
        <h3 className="text-sm font-bold text-white mb-4">Workspace Members ({members.length})</h3>
        <div className="divide-y divide-[#2A3447]">
          {members.map((m: any) => {
            const stats = workload.find((w: any) => w.userId === m.userId);
            return (
              <div key={m.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">
                    {m.user?.name ? m.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{m.user?.name}</h4>
                    <p className="text-xs text-slate-400">{m.user?.email} • Dept: {m.department || 'General'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {stats && (
                    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-300">
                      <span>Assigned: {stats.assignedTasks}</span>
                      <span>Done: {stats.completedTasks}</span>
                      <span className="text-rose-400">Overdue: {stats.overdueTasks}</span>
                    </div>
                  )}

                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    m.role === 'Owner'
                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      : m.role === 'Admin'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {m.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Team Member" maxWidth="md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            inviteMemberMutation.mutate({ email, role, department });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">User Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. colleague@acme.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
              >
                <option value="Member">Member</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 rounded-xl text-slate-400 text-sm">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm">
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
