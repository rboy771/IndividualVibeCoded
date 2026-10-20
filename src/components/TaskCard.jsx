import React, { useState } from 'react';
import { TEAM } from '../App';

/**
 * Assignee Color & Avatar Helpers
 * Distinctive colors and initials for team members.
 */
export const ASSIGNEE_CONFIG = {
  'Teammate A': {
    initials: 'TA',
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    border: 'border-indigo-500/40',
    badge: 'hover:border-indigo-400/60',
  },
  'Teammate B': {
    initials: 'TB',
    bg: 'bg-violet-500/20',
    text: 'text-violet-400',
    border: 'border-violet-500/40',
    badge: 'hover:border-violet-400/60',
  },
  'Teammate C': {
    initials: 'TC',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
    badge: 'hover:border-cyan-400/60',
  },
};

export function getAssigneeMeta(name) {
  if (name && ASSIGNEE_CONFIG[name]) {
    return ASSIGNEE_CONFIG[name];
  }
  // Fallback for custom or unknown name
  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return {
    initials,
    bg: 'bg-slate-700/60',
    text: 'text-slate-300',
    border: 'border-slate-600',
    badge: 'hover:border-slate-500',
  };
}

/**
 * TaskCard Component
 * Displays task details: title, description preview, status selector,
 * quick assignee handoff dropdown, refined M6 feature/bug tag styling, and due date.
 */
export default function TaskCard({
  task,
  onStatusChange,
  onAssigneeChange,
  onCardClick,
  onEdit,
}) {
  const isFeature = task.type === 'feature';
  const assigneeMeta = getAssigneeMeta(task.assignee);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    } else if (onCardClick) {
      onCardClick(task);
    }
  };

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(task.id, e.target.value);
    }
  };

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(task);
    } else if (onCardClick) {
      onCardClick(task);
    }
  };

  const handleAssigneeSelect = (e) => {
    e.stopPropagation();
    const newAssignee = e.target.value;
    if (onAssigneeChange) {
      onAssigneeChange(task.id, newAssignee);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col rounded-lg border bg-surface-card p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer ${
        isFeature
          ? 'border-slate-700/60 border-l-[3px] border-l-emerald-500 hover:border-slate-600'
          : 'border-slate-700/60 border-l-[3px] border-l-rose-500 hover:border-slate-600'
      }`}
    >
      {/* Top bar: Type indicator badge & quick actions */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {/* M6 Tag Style: Emerald for feature, Rose/Red for bug */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-medium tracking-wide border shadow-sm transition-colors ${
            isFeature
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {isFeature ? (
            /* Sparkle icon for feature */
            <svg
              className="h-3 w-3 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          ) : (
            /* Bug icon for bug */
            <svg
              className="h-3 w-3 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          <span>{task.type || 'feature'}</span>
        </span>

        <div className="flex items-center gap-1.5">
          {/* Edit button */}
          <button
            type="button"
            onClick={handleEditClick}
            className="rounded p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-700/60 hover:text-slate-200 transition-opacity"
            title="Edit task"
            aria-label="Edit task"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

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

      {/* Meta info: Assignee badge + Quick hand-off & Due date */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-700/40 pt-2.5 text-xs">
        {/* M7 Assignee badge + Quick hand-off dropdown */}
        <div className="relative flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold border ${assigneeMeta.bg} ${assigneeMeta.text} ${assigneeMeta.border}`}
            title={`Assignee: ${task.assignee || 'Unassigned'}`}
          >
            {assigneeMeta.initials}
          </div>

          <div className="relative">
            <select
              value={task.assignee || ''}
              onChange={handleAssigneeSelect}
              className="appearance-none bg-slate-900/60 pl-2 pr-5 py-0.5 rounded text-xs font-medium text-slate-300 border border-slate-700/80 hover:border-slate-500 hover:text-white focus:border-brand-primary focus:outline-none cursor-pointer transition-colors"
              title="Click to hand off task"
              aria-label="Hand off to teammate"
            >
              {TEAM.map((member) => (
                <option key={member} value={member} className="bg-slate-900 text-slate-200">
                  {member}
                </option>
              ))}
              {task.assignee && !TEAM.includes(task.assignee) && (
                <option value={task.assignee} className="bg-slate-900 text-slate-200">
                  {task.assignee}
                </option>
              )}
            </select>
            {/* Custom mini chevron for dropdown */}
            <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-slate-400">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
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
