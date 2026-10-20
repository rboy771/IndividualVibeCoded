import React from 'react';

/**
 * TaskCard Component
 * Displays task details: title, description preview, status selector,
 * assignee badge, type badge ('feature' | 'bug'), and due date.
 */
export default function TaskCard({ task, onStatusChange, onCardClick }) {
  const isFeature = task.type === 'feature';

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(task.id, e.target.value);
    }
  };

  return (
    <div
      onClick={() => onCardClick && onCardClick(task)}
      className="group relative flex flex-col rounded-lg border border-slate-700/60 bg-surface-card p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-card-hover cursor-pointer"
    >
      {/* Type indicator & quick actions */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-mono font-medium tracking-wide ${
            isFeature
              ? 'bg-emerald-500/10 text-type-feature border border-emerald-500/20'
              : 'bg-red-500/10 text-type-bug border border-red-500/20'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isFeature ? 'bg-type-feature' : 'bg-type-bug'
            }`}
          />
          {task.type || 'feature'}
        </span>

        {/* Status quick mover */}
        <select
          value={task.status}
          onChange={handleStatusSelect}
          onClick={(e) => e.stopPropagation()}
          className="rounded bg-slate-900/70 px-2 py-0.5 text-xs font-medium text-text-muted border border-slate-700/80 hover:text-text-primary focus:border-brand-primary focus:outline-none cursor-pointer"
          aria-label="Change status"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Task title */}
      <h3 className="text-sm font-medium leading-snug text-text-primary group-hover:text-brand-accent transition-colors">
        {task.title}
      </h3>

      {/* Description preview */}
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-text-muted leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Meta info: Assignee badge & Due date */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-700/40 pt-2.5 text-xs">
        {/* Assignee Badge */}
        <div className="flex items-center gap-1.5" title={`Assignee: ${task.assignee || 'Unassigned'}`}>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-slate-200">
            {task.assignee ? task.assignee.charAt(task.assignee.length - 1) : '?'}
          </div>
          <span className="text-xs text-text-muted truncate max-w-[90px]">
            {task.assignee || 'Unassigned'}
          </span>
        </div>

        {/* Due Date */}
        {task.dueDate ? (
          <div className="flex items-center gap-1 font-mono text-[11px] text-text-muted">
            <svg
              className="h-3.5 w-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{task.dueDate}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-600">No due date</span>
        )}
      </div>
    </div>
  );
}
