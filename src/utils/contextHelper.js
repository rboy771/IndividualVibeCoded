/**
 * AI Context & Prompt Serialization Utilities (Milestone 9, Milestone 10 & Milestone 12 Secret Sauce)
 *
 * Provides:
 * - Allowed AI tool definitions (Claude, Cursor, ChatGPT, Lovable, Replit, Other)
 * - Model-tailored prompting directives and structured syntax schemas
 * - Upstream prompt context lineage and prerequisite chaining (Task Lineage)
 * - Context sanitization and timestamp formatting
 * - Markdown & XML prompt serialization matching PRD & DESIGN specs
 * - Cross-browser clipboard copy with fallback
 */

export const CONTEXT_TOOLS = [
  'Claude',
  'Cursor',
  'ChatGPT',
  'Lovable',
  'Replit',
  'Other',
];

/**
 * Model-specific prompt engineering directives.
 */
export const TOOL_DIRECTIVES = {
  Claude: `### 🤖 Target AI Directives (Claude):
- Provide complete, self-contained, drop-in replacement files with clear file path headers.
- Maintain strict type safety, zero placeholder stubs, and WCAG 2.1 AA accessibility semantics.
- Preserve existing comments, docstrings, and contracts unless explicitly asked to modify them.
- Avoid conversational preamble or commentary; jump directly to the implementation artifacts.`,

  Cursor: `### 🤖 Target AI Directives (Cursor Composer):
- Deliver concise, surgical diffs targeting only the affected functions and imports.
- Do NOT rewrite entire unchanged components; prioritize focused search/replace edits.
- Respect active workspace conventions, existing Tailwind utility patterns, and import paths.
- Verify changes compile with zero terminal warnings or broken imports.`,

  ChatGPT: `### 🤖 Target AI Directives (ChatGPT):
- Reason through functional constraints, edge cases, and accessibility contrast ratios step-by-step before coding.
- Include explicit boundary tests and input verification steps for the changes.
- Ensure all asynchronous calls handle error boundaries, empty states, and timeouts gracefully.`,

  Lovable: `### 🤖 Target AI Directives (Lovable):
- Implement clean, responsive UI components using pure Tailwind CSS utility classes.
- Match existing Slate-900 surface styling and accessible contrast tokens (WCAG >= 4.5:1).
- Avoid introducing arbitrary external npm dependencies; use existing project dependencies.
- Ensure full mobile, tablet, and desktop responsive layout with smooth transitions.`,

  Replit: `### 🤖 Target AI Directives (Replit Agent):
- Ensure all execution commands and server endpoints are self-contained and verifiable.
- Keep ports consistent with the project configuration (Vite: 5173, Backend: 8000).
- Provide clear verification commands to test the newly implemented functionality.
- Gracefully handle service offline states and network latency.`,

  Other: `### 🤖 Target AI Directives:
- Adhere strictly to the existing codebase patterns, Tailwind tokens, and accessibility standards.
- Deliver clean, modular, and maintainable implementation with zero runtime errors.`,
};

/**
 * Suggested starter scaffolding for each tool when authoring task briefing notes.
 */
export const TOOL_SCAFFOLDS = {
  Claude: `[Acceptance Criteria]: Complete WCAG 2.1 AA compliance with zero regressions.\n[Target Files]: Specify exact files to create or update.\n[Expected Outcome]: Production-grade drop-in replacement code.`,
  Cursor: `[Workspace Files]: @src/components/... @src/utils/...\n[Target Function]: Focus surgical edits on relevant components.\n[Constraints]: Minimal diff; keep untouched logic unchanged.`,
  ChatGPT: `[Problem Analysis]: Step-by-step reasoning for this feature.\n[Edge Cases]: Empty inputs, network latency, and responsive screen sizes.\n[Verification]: Provide automated test assertions for verification.`,
  Lovable: `[UI Layout]: Modern dark-mode card with slate-900 surface.\n[Color Tokens]: Indigo-500 brand accent, emerald-400 success pill.\n[Interactivity]: Smooth hover state with focus-visible ring for accessibility.`,
  Replit: `[Service Target]: FastAPI endpoint on port 8000 & Vite UI on 5173.\n[Shell Command]: Run 'npm run build' and verify exit code 0.\n[Persistence]: Local-first with JSON store fallback.`,
  Other: `[Implementation Goal]: Deliver cleanly architected feature.\n[Quality Check]: WCAG 2.1 AA accessible and 0 build errors.`,
};

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
 * Helper to extract upstream prerequisite info.
 * @param {Object} task
 * @param {Array} allTasks
 * @returns {{ prereq: Object|null, statusText: string, prereqNotes: string }}
 */
function resolvePrerequisiteInfo(task, allTasks = []) {
  if (!task?.prerequisiteId || !Array.isArray(allTasks)) {
    return { prereq: null, statusText: '', prereqNotes: '' };
  }
  const prereq = allTasks.find((t) => t.id === task.prerequisiteId);
  if (!prereq) {
    return { prereq: null, statusText: '', prereqNotes: '' };
  }
  const isResolved = prereq.status === 'done';
  const statusText = isResolved ? 'Completed & Verified' : `In Progress (${prereq.status})`;
  const prereqNotes = prereq.context || prereq.description || 'No prerequisite notes recorded.';
  return { prereq, statusText, prereqNotes };
}

/**
 * Serializes a task object into a tool-tailored prompt structure.
 * Dynamically transforms prompt architecture, role framing, and instructions
 * based on task.contextTool (Claude XML tags, Cursor Composer diffs, ChatGPT CoT, Lovable UI, Replit agent).
 *
 * @param {Object} task
 * @param {Array} [allTasks=[]]
 * @returns {string}
 */
export function serializeTaskPrompt(task, allTasks = []) {
  if (!task) return '';

  const title = (task.title && task.title.trim()) || 'Untitled Task';
  const type = task.type || 'feature';
  const status = task.status || 'todo';
  const assignee = task.assignee || 'Unassigned';
  const due = task.dueDate || 'None';
  const description = (task.description && task.description.trim()) || 'No description provided.';
  const contextTool = task.contextTool || 'Other';
  const context = (task.context && task.context.trim()) || 'No specific briefing provided.';
  const { prereq, statusText, prereqNotes } = resolvePrerequisiteInfo(task, allTasks);

  // 1. CLAUDE (Anthropic XML Tag Architecture)
  if (contextTool === 'Claude') {
    const upstreamXml = prereq
      ? `  <upstream_prerequisite>
    <task_id>${prereq.id}</task_id>
    <title>${prereq.title}</title>
    <status>${statusText}</status>
    <notes>${prereqNotes}</notes>
  </upstream_prerequisite>\n`
      : '';

    return `<system_role>
You are an expert full-stack software engineer and accessibility specialist. Provide clean, production-grade solutions.
</system_role>

<task_briefing>
  <task_id>${task.id || 'current-task'}</task_id>
  <title>${title}</title>
  <type>${type}</type>
  <status>${status}</status>
  <assignee>${assignee}</assignee>
  <due_date>${due}</due_date>

  <description>
  ${description}
  </description>
${upstreamXml}
  <briefing_notes>
  ${context}
  </briefing_notes>

  <claude_execution_rules>
  - Provide complete, self-contained, drop-in replacement files with clear file path headers.
  - Maintain strict type safety, zero placeholder stubs, and WCAG 2.1 AA accessibility semantics.
  - Preserve existing comments, docstrings, and contracts unless explicitly asked to modify them.
  - Avoid conversational preamble or commentary; jump directly to the implementation artifacts.
  </claude_execution_rules>
</task_briefing>`;
  }

  // 2. CURSOR (Composer surgical diff architecture)
  if (contextTool === 'Cursor') {
    const upstreamCursor = prereq
      ? `\n## 🔗 Prerequisite Lineage (@${prereq.id})
- Parent Task: "${prereq.title}"
- Resolution State: ${statusText}
- Inherited Context: ${prereqNotes}\n`
      : '';

    return `# [Cursor Composer Task]: ${title}
Context: @workspace | Type: ${type} | Status: ${status} | Assignee: ${assignee} | Due: ${due}

## Objective
${description}
${upstreamCursor}
## Briefing & Implementation Notes
${context}

## Cursor Composer Directives
- Deliver concise, surgical diffs targeting only the affected functions and imports.
- Do NOT rewrite entire unchanged components; prioritize focused search/replace edits.
- Respect active workspace conventions, existing Tailwind utility patterns, and import paths.
- Verify changes compile with zero terminal warnings or broken imports.`;
  }

  // 3. CHATGPT (OpenAI Chain-of-Thought architecture)
  if (contextTool === 'ChatGPT') {
    const upstreamGpt = prereq
      ? `\n### 🔗 Upstream Dependency & Prerequisite Chain
- **Prerequisite**: "${prereq.title}" (${statusText})
- **Upstream Notes**: ${prereqNotes}\n`
      : '';

    return `Act as a Principal Software Engineer. Implement the following sprint task:

### 🎯 Task: ${title}
- **Category**: ${type} | **Sprint Status**: ${status} | **Assigned To**: ${assignee} | **Deadline**: ${due}

### 📋 Objective & Specification
${description}
${upstreamGpt}
### 💡 Technical Briefing & Context
${context}

### 🧠 Chain-of-Thought Execution Rules
1. Reason through functional constraints, edge cases, and accessibility contrast ratios step-by-step before coding.
2. Provide complete code implementations with robust error handling, empty states, and defensive checks.
3. Include explicit boundary test cases verifying all acceptance criteria are met.
4. Keep the implementation modular, maintainable, and aligned with project conventions.`;
  }

  // 4. LOVABLE (Fullstack Tailwind UI generation architecture)
  if (contextTool === 'Lovable') {
    const upstreamLovable = prereq
      ? `\n### 🔗 Dependent Component Lineage
- **Upstream Component**: "${prereq.title}" (${statusText})
- **Upstream Specs**: ${prereqNotes}\n`
      : '';

    return `## 🎨 Lovable UI Component Spec: ${title}
- **Task Type**: ${type} | **Stage**: ${status} | **Owner**: ${assignee} | **Due**: ${due}

### Visual & Functional Requirements
${description}
${upstreamLovable}
### Component Styling & Briefing
${context}

### Lovable Directives
- Implement clean, responsive UI components using pure Tailwind CSS utility classes.
- Match existing Slate-900 surface styling and accessible contrast tokens (WCAG >= 4.5:1).
- Avoid introducing arbitrary external npm dependencies; use existing project dependencies.
- Ensure full mobile, tablet, and desktop responsive layout with smooth transitions.`;
  }

  // 5. REPLIT (Cloud IDE & Agent runtime architecture)
  if (contextTool === 'Replit') {
    const upstreamReplit = prereq
      ? `\n## 🔗 Service Dependency Lineage
- **Upstream Service**: "${prereq.title}" (${statusText})
- **Upstream Notes**: ${prereqNotes}\n`
      : '';

    return `# ⚡ Replit Agent Task: ${title}
- **Execution State**: ${status} | **Category**: ${type} | **Lead**: ${assignee} | **Target Due**: ${due}

## Service Specification
${description}
${upstreamReplit}
## Runtime Briefing & Context
${context}

## Replit Environment Constraints
- Ensure development server runs cleanly on Vite port 5173 and FastAPI backend port 8000.
- Keep all terminal commands self-contained and verifiable without hanging processes.
- Provide clear terminal verification commands to test the newly implemented functionality.
- Gracefully handle service offline states and network latency.`;
  }

  // 6. OTHER / DEFAULT (Standard Markdown task specification)
  const prereqOther = prereq
    ? `\n## 🔗 Upstream Prerequisite Lineage
- Prerequisite: "${prereq.title}" (${statusText})
- Upstream Notes: ${prereqNotes}\n`
    : '';

  return `# Task: ${title}
- Type: ${type} | Status: ${status} | Assignee: ${assignee}
- Due: ${due}

## Description
${description}
${prereqOther}
## AI Context Briefing
${context}

### 🤖 Target AI Directives:
- Adhere strictly to the existing codebase patterns, Tailwind tokens, and accessibility standards.
- Deliver clean, modular, and maintainable implementation with zero runtime errors.

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
      // Fall through to textarea fallback
    }
  }

  // Fallback for sandboxed / non-secure contexts
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}
