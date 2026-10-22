import React, { useState } from 'react';
import { TEAM } from '../App';
import DueBadge from './DueBadge';
import { getDueStatus } from '../utils/dueTint';
import { serializeTaskPrompt, copyTextToClipboard } from '../utils/contextHelper';

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
 * Displays task details with comprehensive keyboard, screen reader,
 * and high-contrast accessibility support.
 * Supports Upstream Prerequisite Lineage and Tool-specific AI prompt copying.
 */
export default function TaskCard({
  task,
  tasks = [],
  onStatusChange,
  onAssigneeChange,
  onCardClick,
  onEdit,
  onCopyPrompt,
}) {
  const isFeature = task.type === 'feature';
  const assigneeMeta = getAssigneeMeta(task.assignee);
  const dueInfo = getDueStatus(task.dueDate, task.status);
  const [isCopied, setIsCopied] = useState(false);

  // Upstream prerequisite task resolution
  const prereq = task.prerequisiteId
    ? (tasks || []).find((t) => t && t.id === task.prerequisiteId)
    : null;

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    } else if (onCardClick) {
      onCardClick(task);
    }
  };

  const handleCopyPromptClick = async (e) => {
    e.stopPropagation();
    const promptText = serializeTaskPrompt(task, tasks);
    const success = await copyTextToClipboard(promptText);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      if (onCopyPrompt) {
        onCopyPrompt(task);
      }
    }
  };

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(task);
    } else if (onCardClick) {
      onCardClick(task);
    }
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleAssigneeSelect = (e) => {
    e.stopPropagation();
    const newAssignee = e.target.value;
    if (onAssigneeChange) {
      onAssigneeChange(task.id, newAssignee);
    }
  };

  const borderAccent = isFeature
    ? 'border-l-[3px] border-l-emerald-500'
    : 'border-l-[3px] border-l-rose-500';

  const dueCardTint = task.status !== 'done' ? dueInfo.cardClasses : '';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <article
      role="button"
      tabIndex={0}
      draggable
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`Task: ${task.title}. Type: ${task.type || 'feature'}. Stage: ${task.status}. Assigned to: ${task.assignee || 'Unassigned'}. Press Enter to view or edit details.`}
      className={`group relative flex flex-col rounded-lg border bg-surface-card p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover cursor-grab active:cursor-grabbing border-slate-700/60 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 motion-reduce:transition-none motion-reduce:hover:transform-none ${borderAccent} ${dueCardTint}`}
    >
      {/* Top bar: Type indicator badge & quick actions */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {/* M6 Tag Style with colorblind-friendly text and ARIA description */}
        <span
          aria-label={`Task type: ${task.type || 'feature'}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-medium tracking-wide border shadow-sm transition-colors ${
            isFeature
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {isFeature ? (
            /* Sparkle icon for feature */
            <svg
              className="h-3 w-3 text-emerald-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
              className="h-3 w-3 text-rose-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
          {/* Quick Copy as Prompt Context button */}
          <button
            type="button"
            onClick={handleCopyPromptClick}
            onKeyDown={(e) => e.stopPropagation()}
            className={`rounded p-1 transition-all motion-reduce:transition-none focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              isCopied
                ? 'text-emerald-400 bg-emerald-500/20 opacity-100 ring-1 ring-emerald-500/40'
                : 'text-slate-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-slate-700/60 hover:text-brand-accent'
            }`}
            title={isCopied ? 'Copied prompt context!' : `Copy as ${task.contextTool || 'AI'} Prompt`}
            aria-label={`Copy prompt context for task: ${task.title}`}
          >
            {isCopied ? (
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>

          {/* Edit button */}
          <button
            type="button"
            onClick={handleEditClick}
            onKeyDown={(e) => e.stopPropagation()}
            className="rounded p-1 text-slate-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-slate-700/60 hover:text-slate-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-opacity motion-reduce:transition-none"
            title="Edit task"
            aria-label={`Edit task: ${task.title}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Status quick mover */}
          <select
            value={task.status}
            onChange={handleStatusSelect}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="rounded bg-slate-900/90 px-2 py-0.5 text-xs font-medium text-slate-300 border border-slate-700 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 cursor-pointer"
            aria-label={`Change stage for task: ${task.title}`}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Task title with urgency indicator */}
      <div className="flex items-start gap-1.5">
        {dueInfo.isOverdue && task.status !== 'done' && (
          <>
            <span
              className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-rose-500 animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
              title="Overdue task!"
            />
            <span className="sr-only">Overdue: </span>
          </>
        )}
        <h3 className="text-sm font-semibold leading-snug text-slate-100 group-hover:text-indigo-300 transition-colors">
          {task.title}
        </h3>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-400 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Lineage & Context Badges */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {/* Milestone 12 Secret Sauce: Upstream Prerequisite Lineage Badge */}
        {prereq && (
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono border transition-colors ${
              prereq.status === 'done'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
            title={`Prerequisite Task: "${prereq.title}" (${prereq.status})`}
            aria-label={`Prerequisite task: ${prereq.title}, status: ${prereq.status}`}
          >
            <span aria-hidden="true">⛓️</span>
            <span className="truncate max-w-[130px]">{prereq.title}</span>
            <span className="text-[9px] font-bold">
              {prereq.status === 'done' ? '✓' : '⏳'}
            </span>
          </span>
        )}

        {/* M9 Context briefing badge indicator */}
        {task.context && (
          <span
            className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-500/20"
            title={`AI Briefing (${task.contextTool || 'Unspecified'}):\n${task.context.slice(0, 140)}`}
            aria-label={`AI Context Briefing provided for ${task.contextTool || 'AI'}`}
          >
            <svg className="h-2.5 w-2.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{task.contextTool || 'AI'} context</span>
          </span>
        )}
      </div>

      {/* Meta info: Assignee badge + Quick hand-off & M8 Due date badge */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-700/60 pt-2.5 text-xs">
        {/* M7 Assignee badge + Quick hand-off dropdown */}
        <div className="relative flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold border ${assigneeMeta.bg} ${assigneeMeta.text} ${assigneeMeta.border}`}
            title={`Assignee: ${task.assignee || 'Unassigned'}`}
            aria-hidden="true"
          >
            {assigneeMeta.initials}
          </div>

          <div className="relative">
            <select
              value={task.assignee || ''}
              onChange={handleAssigneeSelect}
              onKeyDown={(e) => e.stopPropagation()}
              className="appearance-none bg-slate-900/90 pl-2 pr-5 py-0.5 rounded text-xs font-medium text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 cursor-pointer transition-colors"
              title="Click to hand off task"
              aria-label={`Assign teammate for task: ${task.title}. Currently assigned to ${task.assignee || 'Unassigned'}`}
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
            <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-slate-400" aria-hidden="true">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* M8 Due Date Badge */}
        <DueBadge dueDate={task.dueDate} status={task.status} />
      </div>
    </article>
  );
}
