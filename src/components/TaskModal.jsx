import React, { useState, useEffect } from 'react';
import { STAGES, TEAM } from '../App';

/**
 * TaskModal Component
 * Modal dialog for creating new tasks or editing existing tasks.
 * Supports:
 * - Title (required)
 * - Description
 * - Type ('feature' | 'bug')
 * - Status ('todo' | 'in-progress' | 'review' | 'done')
 * - Assignee ('Teammate A', 'Teammate B', 'Teammate C' or custom)
 * - Due Date ('YYYY-MM-DD')
 * - Delete action with confirmation when editing an existing task
 * - Backdrop click & Escape key to dismiss
 */
export default function TaskModal({ task, isOpen, onClose, onSave, onDelete }) {
  const isEditing = Boolean(task && task.id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0] || 'Teammate A',
    dueDate: '',
  });

  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'feature',
        status: task.status || 'todo',
        assignee: task.assignee || TEAM[0] || 'Teammate A',
        dueDate: task.dueDate || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'feature',
        status: 'todo',
        assignee: TEAM[0] || 'Teammate A',
        dueDate: '',
      });
    }
    setError('');
    setShowDeleteConfirm(false);
  }, [task, isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'title' && value.trim()) {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const taskPayload = {
      ...(task || {}),
      id: isEditing ? task.id : `task-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      status: formData.status,
      assignee: formData.assignee,
      dueDate: formData.dueDate ? formData.dueDate : null,
      createdDate: isEditing && task.createdDate ? task.createdDate : todayStr,
      context: (task && task.context) || '',
      contextTool: (task && task.contextTool) || null,
      contextUpdatedAt: (task && task.contextUpdatedAt) || null,
    };

    onSave(taskPayload);
  };

  const handleDelete = () => {
    if (onDelete && task?.id) {
      onDelete(task.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-700/80 bg-surface-card p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                formData.type === 'bug' ? 'bg-type-bug' : 'bg-type-feature'
              }`}
            />
            <h2 id="modal-headline" className="text-lg font-semibold text-text-primary">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Implement OAuth login flow"
              className={`mt-1.5 w-full rounded-lg border bg-slate-900/90 px-3.5 py-2 text-sm text-text-primary placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-500/80 focus:ring-red-500'
                  : 'border-slate-700 focus:border-brand-primary focus:ring-brand-primary/40'
              }`}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Add context, acceptance criteria, or implementation notes..."
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-sm text-text-primary placeholder-slate-500 shadow-inner focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
          </div>

          {/* Row: Type & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-type" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Type
              </label>
              <select
                id="task-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-status" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Assignee & Due Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-assignee" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Assignee
              </label>
              <select
                id="task-assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              >
                {TEAM.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-dueDate" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Due Date
              </label>
              <input
                id="task-dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-700/60 pt-4">
            {isEditing ? (
              showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400 font-medium">Delete task?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Task
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/20 transition-all hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
