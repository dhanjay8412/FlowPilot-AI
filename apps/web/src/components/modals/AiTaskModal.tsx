import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import { Modal } from '../common/Modal';
import { api } from '../../api/endpoints';
import { Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';

export const AiTaskModal: React.FC<{ onTaskCreated?: () => void }> = ({ onTaskCreated }) => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state: RootState) => state.ui);
  const isOpen = activeModal === 'aiTask';

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.classifyTask({ prompt });
      setSuggestion(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to classify task using AI assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!suggestion) return;
    setCreating(true);
    try {
      await api.createTask({
        title: suggestion.suggestedTitle,
        description: `Generated via AI Assistant. Reasoning: ${suggestion.reasoning}`,
        priority: suggestion.priority,
        prioritySource: 'AI-assisted',
        category: suggestion.category,
        deadline: suggestion.suggestedDeadline,
        status: 'Todo',
      });
      if (onTaskCreated) onTaskCreated();
      dispatch(closeModal());
      setPrompt('');
      setSuggestion(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create task from AI suggestion');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => dispatch(closeModal())} title="AI Task Assistant" maxWidth="xl">
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!suggestion ? (
          <form onSubmit={handleClassify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                What needs to be done? Describe in plain English:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Customer reported payment gateway timeout on checkout. Needs urgent investigation today."
                rows={4}
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
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Classify & Extract</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#1A2130] border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Suggestion Preview</span>
                <span className="text-xs text-slate-400">Confidence: {Math.round((suggestion.confidence || 0.9) * 100)}%</span>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Title</label>
                <input
                  type="text"
                  value={suggestion.suggestedTitle}
                  onChange={(e) => setSuggestion({ ...suggestion, suggestedTitle: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-[#121722] border border-[#2A3447] text-white text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Priority</label>
                  <select
                    value={suggestion.priority}
                    onChange={(e) => setSuggestion({ ...suggestion, priority: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#121722] border border-[#2A3447] text-white text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Category</label>
                  <input
                    type="text"
                    value={suggestion.category}
                    onChange={(e) => setSuggestion({ ...suggestion, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#121722] border border-[#2A3447] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Suggested Deadline</label>
                  <input
                    type="date"
                    value={suggestion.suggestedDeadline || ''}
                    onChange={(e) => setSuggestion({ ...suggestion, suggestedDeadline: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-[#121722] border border-[#2A3447] text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">AI Reasoning</label>
                <p className="text-xs text-slate-300 mt-0.5">{suggestion.reasoning}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Try different prompt
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
                  onClick={handleCreateTask}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirm & Create Task</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
