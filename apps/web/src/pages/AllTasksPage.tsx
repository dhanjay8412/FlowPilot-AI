import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { useDispatch } from 'react-redux';
import { openModal } from '../store/slices/uiSlice';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  MessageSquare,
  History,
  Trash2,
  User as UserIcon,
  X,
  Send,
} from 'lucide-react';

export const AllTasksPage: React.FC = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Comments & Activity for selected task drawer
  const [commentText, setCommentText] = useState('');

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (statusFilter) queryParams.set('status', statusFilter);
  if (priorityFilter) queryParams.set('priority', priorityFilter);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', search, statusFilter, priorityFilter],
    queryFn: () => api.getTasks(queryParams.toString()),
  });

  const { data: commentsData } = useQuery({
    queryKey: ['taskComments', selectedTask?.id],
    queryFn: () => api.getComments(selectedTask.id),
    enabled: !!selectedTask,
  });

  const { data: activityData } = useQuery({
    queryKey: ['taskActivity', selectedTask?.id],
    queryFn: () => api.getTaskActivity(selectedTask.id),
    enabled: !!selectedTask,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsOverview'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedTask(null);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => api.addComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', selectedTask?.id] });
      setCommentText('');
    },
  });

  const tasks = tasksData?.data || [];

  const columns = ['Todo', 'In Progress', 'Blocked', 'Done'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">All Workspace Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">Manage, auto-classify, filter, and assign team tasks.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#121722] border border-[#2A3447] rounded-xl p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'board' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => dispatch(openModal('aiTask'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Task Creator</span>
          </button>

          <button
            onClick={() => dispatch(openModal('createTask'))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-[#2A3447] flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-slate-200 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-slate-200 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((colStatus) => {
            const colTasks = tasks.filter((t: any) => t.status === colStatus);
            return (
              <div key={colStatus} className="glass-panel p-4 rounded-2xl border border-[#2A3447] flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2A3447]">
                  <span className="font-bold text-sm text-slate-200">{colStatus}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="p-4 rounded-xl bg-[#1A2130] border border-[#2A3447] hover:border-blue-500/50 cursor-pointer space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                          {t.category}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            t.priority === 'Critical'
                              ? 'bg-rose-500/15 text-rose-400'
                              : t.priority === 'High'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white leading-snug">{t.title}</h4>

                      {t.deadline && (
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Due {new Date(t.deadline).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[#2A3447]/60 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate max-w-[100px]">{t.assignedTo?.name || 'Unassigned'}</span>
                        </div>

                        {/* Quick Status Shift */}
                        <select
                          value={t.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatusMutation.mutate({ id: t.id, status: e.target.value })}
                          className="bg-[#121722] border border-[#2A3447] text-slate-300 text-[11px] rounded px-1.5 py-0.5"
                        >
                          <option value="Todo">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Blocked">Blocked</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel p-6 rounded-2xl border border-[#2A3447] divide-y divide-[#2A3447]">
          {tasks.map((t: any) => (
            <div
              key={t.id}
              onClick={() => setSelectedTask(t)}
              className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-3 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    t.status === 'Done' ? 'bg-emerald-500' : t.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                ></span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{t.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs bg-[#1A2130] text-slate-300 px-2.5 py-1 rounded-lg border border-[#2A3447]">
                  {t.category}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    t.priority === 'Critical'
                      ? 'bg-rose-500/15 text-rose-400'
                      : t.priority === 'High'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {t.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Details & Discussion Drawer */}
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#121722] border-l border-[#2A3447] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideInRight">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#2A3447] pb-4">
              <span className="text-xs font-semibold uppercase text-blue-400">Task Details</span>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">{selectedTask.title}</h2>
              <p className="text-sm text-slate-300 bg-[#1A2130] p-3 rounded-xl border border-[#2A3447]">
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Category:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedTask.category}</p>
              </div>
              <div>
                <span className="text-slate-500">Priority:</span>
                <p className="font-semibold text-rose-400 mt-0.5">{selectedTask.priority}</p>
              </div>
              <div>
                <span className="text-slate-500">Assignee:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedTask.assignedTo?.name || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <p className="font-semibold text-blue-400 mt-0.5">{selectedTask.status}</p>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3 pt-4 border-t border-[#2A3447]">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Comments Thread</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(commentsData?.data || []).map((c: any) => (
                  <div key={c.id} className="p-3 rounded-xl bg-[#1A2130] border border-[#2A3447] text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 font-semibold">
                      <span>{c.authorId?.name || 'User'}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-200">{c.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-xs"
                />
                <button
                  onClick={() => addCommentMutation.mutate({ id: selectedTask.id, content: commentText })}
                  disabled={!commentText.trim()}
                  className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2A3447] flex justify-between items-center">
            <button
              onClick={() => deleteTaskMutation.mutate(selectedTask.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
