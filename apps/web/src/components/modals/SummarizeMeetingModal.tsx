import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import { Modal } from '../common/Modal';
import { api } from '../../api/endpoints';
import { Video, Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';

export const SummarizeMeetingModal: React.FC<{ onMeetingSaved?: () => void }> = ({ onMeetingSaved }) => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state: RootState) => state.ui);
  const isOpen = activeModal === 'summarizeMeeting';

  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim() || !title.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.summarizeMeeting({ title, transcript });
      setResult(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to summarize meeting transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeeting = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await api.createMeeting({
        title,
        transcript,
        summary: result.summary,
        keyDecisions: result.keyDecisions,
        actionItems: result.actionItems,
        risks: result.risks,
      });
      if (onMeetingSaved) onMeetingSaved();
      dispatch(closeModal());
      setTitle('');
      setTranscript('');
      setResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save meeting record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => dispatch(closeModal())} title="AI Meeting Summarizer" maxWidth="2xl">
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSummarize} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Meeting Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Sprint Planning & Tech Alignment Sync"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Paste Raw Meeting Transcript</label>
              <textarea
                required
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste verbatim notes, meeting transcript, or Zoom/Teams log here..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white focus:outline-none focus:border-blue-500 text-sm placeholder:text-slate-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => dispatch(closeModal())}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !transcript.trim() || !title.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Summary</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-xl bg-[#1A2130] border border-indigo-500/30 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Executive Summary</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
              </div>

              {result.keyDecisions && result.keyDecisions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Key Decisions</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                    {result.keyDecisions.map((d: string, idx: number) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.actionItems && result.actionItems.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1.5">
                    Extracted Action Items ({result.actionItems.length})
                  </h4>
                  <div className="space-y-2">
                    {result.actionItems.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#121722] border border-[#2A3447] text-sm flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{item.description}</p>
                          <div className="text-xs text-slate-400 mt-0.5 flex gap-3">
                            <span>Assignee: {item.suggestedAssignee || 'Unassigned'}</span>
                            <span>Priority: {item.priority || 'Medium'}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Action Item
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.risks && result.risks.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Risks & Blockers</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                    {result.risks.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Re-summarize
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => dispatch(closeModal())}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm font-medium"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveMeeting}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Meeting & Action Items</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
