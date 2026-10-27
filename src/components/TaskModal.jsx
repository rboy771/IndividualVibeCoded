import React, { useState, useEffect } from 'react';
import { STAGES, TEAM } from '../App';
import {
  CONTEXT_TOOLS,
  TOOL_SCAFFOLDS,
  formatContextUpdated,
  serializeTaskPrompt,
  copyTextToClipboard,
} from '../utils/contextHelper';
import { useFocusTrap } from '../utils/useFocusTrap';

/**
 * TaskModal Component
 * Accessible Modal dialog for creating new tasks or editing existing tasks.
 * Complies with WCAG 2.1 AA dialog guidelines:
 * - Trapped focus within modal container
 * - Restore focus on close
 * - Escape key dismiss
 * - High-contrast focus indicators
 * - Proper ARIA labels and error announcements
 * - Real-time Live Prompt Preview per Target AI Tool (Milestone 12 Secret Sauce)
 * - Upstream Prerequisite Task Lineage chaining
 */
export default function TaskModal({
  task,
  tasks = [],
  teamMembers = TEAM,
  currentUser = '',
  isOpen,
  onClose,
  onSave,
  onDelete,
  onCopyPrompt,
}) {
  const isEditing = Boolean(task && task.id);
  const memberNames = Array.isArray(teamMembers) && teamMembers.length > 0
    ? teamMembers.map((m) => (typeof m === 'string' ? m : m.name))
    : TEAM;
  const defaultAssignee =
    currentUser && memberNames.includes(currentUser)
      ? currentUser
      : memberNames[0] || 'Teammate A';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    assignee: defaultAssignee,
    dueDate: '',
    context: '',
    contextTool: '',
    contextUpdatedAt: null,
    prerequisiteId: '',
  });

  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [briefingTab, setBriefingTab] = useState('editor'); // 'editor' | 'preview'

  // Focus trap for dialog accessibility
  const modalRef = useFocusTrap(isOpen, {
    initialFocusSelector: '#task-title',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'feature',
        status: task.status || 'todo',
        assignee: task.assignee || defaultAssignee,
        dueDate: task.dueDate || '',
        context: task.context || '',
        contextTool: task.contextTool || '',
        contextUpdatedAt: task.contextUpdatedAt || null,
        prerequisiteId: task.prerequisiteId || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'feature',
        status: 'todo',
        assignee: defaultAssignee,
        dueDate: '',
        context: '',
        contextTool: '',
        contextUpdatedAt: null,
        prerequisiteId: '',
      });
    }
    setError('');
    setShowDeleteConfirm(false);
    setIsCopied(false);
    setBriefingTab('editor');
  }, [task, isOpen, defaultAssignee]);

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

  // Build the live draft object for prompt serialization
  const currentDraft = {
    id: task?.id || 'new-task',
    title: formData.title || task?.title || 'Untitled Task',
    type: formData.type,
    status: formData.status,
    assignee: formData.assignee,
    dueDate: formData.dueDate || null,
    description: formData.description,
    context: formData.context,
    contextTool: formData.contextTool || null,
    prerequisiteId: formData.prerequisiteId || null,
  };

  const livePrompt = serializeTaskPrompt(currentDraft, tasks);

  const handleCopyPromptModal = async () => {
    const success = await copyTextToClipboard(livePrompt);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      if (onCopyPrompt) {
        onCopyPrompt(currentDraft);
      }
    }
  };

  const handleApplyScaffold = () => {
    const tool = formData.contextTool || 'Other';
    const scaffold = TOOL_SCAFFOLDS[tool] || TOOL_SCAFFOLDS.Other;
    setFormData((prev) => ({
      ...prev,
      context: prev.context ? `${prev.context.trim()}\n\n${scaffold}` : scaffold,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Determine if context or contextTool was modified
    const originalContext = (task && task.context) || '';
    const originalTool = (task && task.contextTool) || '';
    const isContextDirty =
      formData.context.trim() !== originalContext.trim() ||
      (formData.contextTool || '') !== originalTool;

    // Auto-update contextUpdatedAt if context was modified and not empty
    const newContextUpdatedAt =
      isContextDirty && (formData.context.trim() || formData.contextTool)
        ? new Date().toISOString()
        : (formData.contextUpdatedAt || null);

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
      context: formData.context.trim(),
      contextTool: formData.contextTool || null,
      contextUpdatedAt: newContextUpdatedAt,
      prerequisiteId: formData.prerequisiteId || null,
    };

    onSave(taskPayload);
  };

  const handleDelete = () => {
    if (onDelete && task?.id) {
      onDelete(task.id);
    }
  };

  // Available prerequisite tasks excluding the current editing task
  const availablePrereqs = (tasks || []).filter((t) => t && t.id !== task?.id);

  // Architecture badge helper
  const getToolBadge = (tool) => {
    switch (tool) {
      case 'Claude':
        return 'Anthropic XML Schema';
      case 'Cursor':
        return 'Cursor Composer Spec';
      case 'ChatGPT':
        return 'OpenAI CoT Architecture';
      case 'Lovable':
        return 'Tailwind UI Spec';
      case 'Replit':
        return 'Cloud Agent Runtime';
      default:
        return 'Standard Prompt Spec';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn motion-reduce:animate-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700/80 bg-surface-card p-6 shadow-2xl transition-all motion-reduce:transition-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-headline"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                formData.type === 'bug' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              aria-hidden="true"
            />
            <h2 id="task-modal-headline" className="text-lg font-semibold text-slate-100">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-700/60 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
            aria-label="Close task details modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Title <span className="text-red-400" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              required
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'task-title-error' : undefined}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Implement OAuth login flow"
              className={`mt-1.5 w-full rounded-lg border bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                error ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {error && (
              <p id="task-title-error" className="mt-1 text-xs text-red-400" role="alert">
                {error}
              </p>
            )}
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
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                {memberNames.map((member) => (
                  <option key={member} value={member}>
                    {member}{currentUser === member ? ' (You)' : ''}
                  </option>
                ))}
                {formData.assignee && !memberNames.includes(formData.assignee) && (
                  <option value={formData.assignee}>
                    {formData.assignee}
                  </option>
                )}
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
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              />
            </div>
          </div>

          {/* Milestone 12 Secret Sauce: Upstream Prerequisite Task Lineage */}
          <div>
            <label htmlFor="task-prerequisiteId" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Prerequisite Task (Task Lineage Chaining)
            </label>
            <select
              id="task-prerequisiteId"
              name="prerequisiteId"
              value={formData.prerequisiteId || ''}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <option value="">None (Independent Task)</option>
              {availablePrereqs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status === 'done' ? '✓ Done' : p.status})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Upstream prerequisite context and completion outputs are automatically chained into the prompt.
            </p>
          </div>

          {/* M9, M10 & M12: Dedicated AI Context Briefing Section */}
          <section
            aria-labelledby="ai-briefing-heading"
            className="rounded-xl border border-indigo-500/30 bg-slate-900/80 p-4 shadow-inner space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
                  aria-hidden="true"
                >
                  <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <div>
                  <h3 id="ai-briefing-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    AI Context Briefing
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Adaptive prompt generator for AI assistants & teammate handoffs
                  </p>
                </div>
              </div>

              {/* Action Buttons: Tab Switcher & Hero Copy Button */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Tab Switcher: Notes Editor vs Live Prompt Preview */}
                <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-0.5">
                  <button
                    type="button"
                    onClick={() => setBriefingTab('editor')}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      briefingTab === 'editor'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✏️ Briefing Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setBriefingTab('preview')}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      briefingTab === 'preview'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    👁️ Live Prompt Preview
                  </button>
                </div>

                {/* Hero Button: Copy as Prompt Context */}
                <button
                  type="button"
                  onClick={handleCopyPromptModal}
                  aria-label="Copy task details formatted as an AI prompt"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    isCopied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ring-1 ring-emerald-500/50'
                      : 'bg-brand-primary/20 text-indigo-200 border border-brand-primary/40 hover:bg-brand-primary/30 hover:text-white'
                  }`}
                  title="Copy task details and briefing formatted as an AI prompt"
                >
                  {isCopied ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied Prompt!</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tool Selector & Active Architecture Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="task-contextTool" className="text-xs font-medium text-slate-300">
                  Target AI Tool:
                </label>
                <select
                  id="task-contextTool"
                  name="contextTool"
                  value={formData.contextTool || ''}
                  onChange={handleChange}
                  className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  <option value="">Unspecified</option>
                  {CONTEXT_TOOLS.map((tool) => (
                    <option key={tool} value={tool}>
                      {tool}
                    </option>
                  ))}
                </select>

                <span className="inline-flex items-center rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-slate-700">
                  {getToolBadge(formData.contextTool)}
                </span>
              </div>

              {briefingTab === 'editor' && (
                <button
                  type="button"
                  onClick={handleApplyScaffold}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
                  title="Insert starter template notes tailored for this AI tool"
                >
                  <span>🪄 Insert {formData.contextTool || 'Tool'} Scaffold</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT: Notes Editor vs Live Prompt Preview */}
            {briefingTab === 'editor' ? (
              <div className="space-y-2">
                <label htmlFor="task-context" className="sr-only">
                  AI Context Briefing Details
                </label>
                <textarea
                  id="task-context"
                  name="context"
                  rows={4}
                  value={formData.context}
                  onChange={handleChange}
                  placeholder="Curated briefing for the next AI / teammate (acceptance criteria, reproduction steps, technical notes)..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 p-3 font-mono text-xs text-slate-200 placeholder-slate-400 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                />
                {formData.contextUpdatedAt && (
                  <p className="text-[11px] font-mono text-slate-400 text-right">
                    Last briefed: {formatContextUpdated(formData.contextUpdatedAt)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dynamically serialized for {formData.contextTool || 'Standard AI'}:</span>
                  <span className="font-mono text-indigo-300">Live preview updates on tool change</span>
                </div>
                <div className="relative rounded-lg border border-slate-800 bg-slate-950 p-3 shadow-inner">
                  <pre
                    className="max-h-60 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-slate-300 leading-relaxed"
                    tabIndex={0}
                    aria-label="Serialized prompt preview"
                  >
                    {livePrompt}
                  </pre>
                </div>
              </div>
            )}
          </section>

          {/* Action Footer */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-slate-700/60 pt-4">
            {isEditing ? (
              showDeleteConfirm ? (
                <div
                  role="alertdialog"
                  aria-labelledby="delete-confirm-label"
                  className="flex items-center gap-2"
                >
                  <span id="delete-confirm-label" className="text-xs text-red-400 font-medium">
                    Delete task permanently?
                  </span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
                >
                  Delete Task
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-primary px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/30 hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
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
