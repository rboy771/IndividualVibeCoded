/**
 * Due Date State & Tinting Utilities (Milestone 8)
 *
 * Implements mathematical logic to determine due date urgency and styling:
 * - If task status is 'done': `due-neutral` / muted slate text.
 * - If no due date: null / no tint.
 * - If dueDate is today or past: `due-overdue` (Rose/Red styling).
 * - If dueDate is within 24 hours / tomorrow: `due-warning` (Amber/Yellow styling).
 * - If dueDate is > 24 hours away: `due-safe` (Emerald styling).
 */

/**
 * Parses an ISO date string 'YYYY-MM-DD' into a local Date object at midnight.
 * @param {string|null} dateStr
 * @returns {Date|null}
 */
export function parseDueDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a Date object as "MMM D" (e.g. "Oct 19", "Oct 24").
 * @param {Date} date
 * @returns {string}
 */
export function formatMonthDay(date) {
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Calculates due date status, formatted label, and Tailwind classes.
 *
 * @param {string|null} dueDate - ISO date string 'YYYY-MM-DD'
 * @param {string} taskStatus - 'todo' | 'in-progress' | 'review' | 'done'
 * @param {Date} [referenceDate=new Date()] - Reference date for calculation
 * @returns {{
 *   status: 'due-neutral' | 'due-overdue' | 'due-warning' | 'due-safe' | null,
 *   label: string,
 *   badgeClasses: string,
 *   cardClasses: string,
 *   urgency: 'none' | 'low' | 'medium' | 'high',
 *   isOverdue: boolean,
 *   isWarning: boolean
 * }}
 */
export function getDueStatus(dueDate, taskStatus, referenceDate = new Date()) {
  // If task status is 'done', it overrides date calculations (muted slate text)
  if (taskStatus === 'done') {
    const dueObj = parseDueDate(dueDate);
    const dateFormatted = dueObj ? formatMonthDay(dueObj) : '';
    return {
      status: 'due-neutral',
      label: dateFormatted ? `Done: ${dateFormatted}` : 'Done',
      badgeClasses: 'text-slate-400 bg-slate-800/60 border-slate-700/60',
      cardClasses: '',
      urgency: 'none',
      isOverdue: false,
      isWarning: false,
    };
  }

  // If no due date, return no tint with WCAG AA compliant muted text
  if (!dueDate) {
    return {
      status: null,
      label: 'No due date',
      badgeClasses: 'text-slate-400 bg-transparent border-transparent',
      cardClasses: '',
      urgency: 'none',
      isOverdue: false,
      isWarning: false,
    };
  }

  const dueObj = parseDueDate(dueDate);
  if (!dueObj) {
    return {
      status: null,
      label: dueDate,
      badgeClasses: 'text-slate-400 bg-transparent border-transparent',
      cardClasses: '',
      urgency: 'none',
      isOverdue: false,
      isWarning: false,
    };
  }

  const now = new Date(referenceDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = dueObj.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const formatted = formatMonthDay(dueObj);

  // Overdue (past due date)
  if (diffDays < 0) {
    return {
      status: 'due-overdue',
      label: `Overdue: ${formatted}`,
      badgeClasses: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      cardClasses: 'ring-1 ring-rose-500/30 bg-rose-950/10',
      urgency: 'high',
      isOverdue: true,
      isWarning: false,
    };
  }

  // Due today
  if (diffDays === 0) {
    return {
      status: 'due-overdue',
      label: 'Due today',
      badgeClasses: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      cardClasses: 'ring-1 ring-rose-500/30 bg-rose-950/10',
      urgency: 'high',
      isOverdue: true,
      isWarning: false,
    };
  }

  // Within 24 hours / tomorrow
  if (diffDays === 1) {
    return {
      status: 'due-warning',
      label: 'Due tomorrow',
      badgeClasses: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      cardClasses: 'ring-1 ring-amber-500/20',
      urgency: 'medium',
      isOverdue: false,
      isWarning: true,
    };
  }

  // More than 24 hours away (> 1 day)
  return {
    status: 'due-safe',
    label: `Due ${formatted}`,
    badgeClasses: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cardClasses: '',
    urgency: 'low',
    isOverdue: false,
    isWarning: false,
  };
}
