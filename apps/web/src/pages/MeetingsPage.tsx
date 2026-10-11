import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { useDispatch } from 'react-redux';
import { openModal } from '../store/slices/uiSlice';
import { Video, Sparkles, Check, ArrowRight, AlertTriangle, HelpCircle, FileText } from 'lucide-react';

export const MeetingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const { data: meetingsData, isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => api.getMeetings(),
  });

  const convertItemMutation = useMutation({
    mutationFn: ({ meetingId, itemId }: { meetingId: string; itemId: string }) =>
      api.convertActionItemToTask(meetingId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const meetings = meetingsData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Meeting Intelligence</h1>
          <p className="text-sm text-slate-400 mt-1">Convert meeting transcripts into summaries, decisions, and tasks.</p>
        </div>
        <button
          onClick={() => dispatch(openModal('summarizeMeeting'))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>Summarize New Meeting</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meetings Sidebar List */}
        <div className="glass-panel p-4 rounded-2xl border border-[#2A3447] space-y-3">
          <h3 className="text-sm font-bold text-white px-2">Saved Meetings ({meetings.length})</h3>

          {meetings.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No meetings summarized yet.</div>
          ) : (
            meetings.map((m: any) => (
              <div
                key={m.id}
                onClick={() => setSelectedMeeting(m)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedMeeting?.id === m.id
                    ? 'bg-blue-600/20 border-blue-500/50 text-white'
                    : 'bg-[#1A2130]/60 border-[#2A3447] hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-400 shrink-0" />
                  <h4 className="font-semibold text-sm truncate">{m.title}</h4>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                  <span>{m.actionItems?.length || 0} action items</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Meeting Viewer */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#2A3447]">
          {selectedMeeting ? (
            <div className="space-y-6">
              <div className="border-b border-[#2A3447] pb-4">
                <h2 className="text-xl font-bold text-white">{selectedMeeting.title}</h2>
                <span className="text-xs text-slate-400">Summarized on {new Date(selectedMeeting.createdAt).toLocaleString()}</span>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-[#1A2130] border border-[#2A3447] space-y-2">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Executive Summary</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{selectedMeeting.summary}</p>
              </div>

              {/* Key Decisions */}
              {selectedMeeting.keyDecisions && selectedMeeting.keyDecisions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Key Decisions</h4>
                  <div className="space-y-1.5">
                    {selectedMeeting.keyDecisions.map((d: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#1A2130] border border-[#2A3447] text-sm text-slate-200 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items with Convert Button */}
              {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Action Items</h4>
                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#1A2130] border border-[#2A3447] flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.description}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span>Assignee: {item.suggestedAssignee || 'Unassigned'}</span>
                            <span>•</span>
                            <span>Priority: {item.priority || 'Medium'}</span>
                          </div>
                        </div>

                        {item.status === 'converted' ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Converted to Task</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => convertItemMutation.mutate({ meetingId: selectedMeeting.id, itemId: item.id || item._id })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                          >
                            <span>Convert to Task</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-sm">Select a meeting from the sidebar to inspect AI summary and action items.</div>
          )}
        </div>
      </div>
    </div>
  );
};
