import React from 'react';
import { getDueStatus } from '../utils/dueTint';

/**
 * DueBadge Component (Milestone 8)
 *
 * Displays a badge reflecting task due date status with appropriate
 * icons, formatted label, and color tinting:
 * - Red/Rose for overdue & today
 * - Amber for tomorrow / within 24h
 * - Emerald for > 24h
 * - Muted slate for completed tasks
 */
export default function DueBadge({ dueDate, status, className = '' }) {
  const dueInfo = getDueStatus(dueDate, status);

  if (!dueInfo.status) {
    return (
      <span className={`text-[11px] text-slate-600 ${className}`}>
        {dueInfo.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium border transition-colors ${dueInfo.badgeClasses} ${className}`}
      title={`Due date: ${dueDate || 'None'}`}
    >
      {/* Due status icon */}
      {dueInfo.status === 'due-overdue' && (
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

      {dueInfo.status === 'due-warning' && (
        <svg
          className="h-3 w-3 text-amber-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}

      {dueInfo.status === 'due-safe' && (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )}

      {dueInfo.status === 'due-neutral' && (
        <svg
          className="h-3 w-3 text-slate-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}

      <span>{dueInfo.label}</span>
    </span>
  );
}
