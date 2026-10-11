import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import { Modal } from '../common/Modal';
import { api } from '../../api/endpoints';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

export const CreateTaskModal: React.FC<{ onTaskCreated?: () => void }> = ({ onTaskCreated }) => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state: RootState) => state.ui);
  const isOpen = activeModal === 'createTask';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [category, setCategory] = useState('General');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      await api.createTask({
        title,
        description,
        priority,
        prioritySource: 'manual',
        category,
        deadline: deadline || undefined,
        status: 'Todo',
      });
      if (onTaskCreated) onTaskCreated();
      dispatch(closeModal());
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('General');
      setDeadline('');
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => dispatch(closeModal())} title="Create New Task" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Task Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Audit tenant isolation database queries"
            className="w-full px-4 py-2.5 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, acceptance criteria, or links..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A2130] border border-[#2A3447] text-white text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Create Task</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
