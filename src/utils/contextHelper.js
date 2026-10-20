/**
 * AI Context & Prompt Serialization Utilities (Milestone 9 & Milestone 10)
 *
 * Provides:
 * - Allowed AI tool definitions
 * - Context sanitization and timestamp formatting
 * - Markdown prompt serialization matching PRD & DESIGN specs
 * - Cross-browser clipboard copy with fallback
 */

export const CONTEXT_TOOLS = [
  'Claude',
  'ChatGPT',
  'Cursor',
  'Lovable',
  'Replit',
  'Other',
];

/**
 * Sanitizes context string by trimming whitespace and normalizing line breaks.
 * @param {string|null|undefined} text
 * @returns {string}
 */
export function sanitizeContext(text) {
  if (text == null) return '';
  return String(text).trim();
}

/**
 * Formats an ISO date/timestamp string into a readable representation.
 * @param {string|null|undefined} timestamp
 * @returns {string|null}
 */
export function formatContextUpdated(timestamp) {
  if (!timestamp) return null;
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return null;
  }
}

/**
 * Serializes a task object into a structured Markdown prompt for AI assistants
 * (Claude, ChatGPT, Cursor, etc.) per PRD Section 9 and hackathon rules.
 *
 * @param {Object} task
 * @returns {string}
 */
export function serializeTaskPrompt(task) {
  if (!task) return '';

  const title = (task.title && task.title.trim()) || 'Untitled Task';
  const type = task.type || 'feature';
  const status = task.status || 'todo';
  const assignee = task.assignee || 'Unassigned';
  const due = task.dueDate || 'None';
  const description = (task.description && task.description.trim()) || 'No description provided.';
  const contextTool = task.contextTool || 'Unspecified';
  const context = (task.context && task.context.trim()) || 'No specific briefing provided.';

  return `# Task: ${title}
- Type: ${type} | Status: ${status} | Assignee: ${assignee}
- Due: ${due}

## Description
${description}

## AI Context Briefing (${contextTool})
${context}

---
*Please continue implementation from the current state.*`;
}

/**
 * Copies text to clipboard with modern navigator.clipboard and fallback to execCommand.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyTextToClipboard(text) {
  if (!text) return false;

  // Modern Async Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy fallback
    }
  }

  // Fallback for older browsers or non-secure contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
