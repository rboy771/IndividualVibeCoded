/**
 * AI Prompt Optimizer & Vibe Synthesizer Engine (Milestone 12: secret-sauce)
 *
 * Synthesizes task specifications and AI context briefings into
 * ultra-high-context prompts engineered for leading LLMs (Claude, Cursor, ChatGPT, etc.).
 * Injects role personas, architectural guardrails, testing criteria, and constraints.
 */

export const PROMPT_TEMPLATES = [
  {
    id: 'feature_architect',
    name: 'Feature Architect',
    icon: '🏗️',
    badge: 'Architecture & Design',
    color: 'from-indigo-500 to-purple-600',
    description: 'Decomposes complex features into modular components, state contracts, and UX flows with clean typing and zero technical debt.',
    rolePrompt: `You are an elite Senior Frontend Architect specializing in React, Vite, and modern UI engineering.
Your objective is to implement a robust, scalable feature following clean component architecture, deterministic state flow, and seamless user experience.`,
    directives: [
      'Design modular, testable components with explicit prop contracts.',
      'Maintain deterministic state with local persistence hooks.',
      'Ensure tight alignment with design tokens and color variables.',
      'Handle loading, empty, and edge cases gracefully.',
    ],
  },
  {
    id: 'debug_specialist',
    name: 'Debug Specialist',
    icon: '🐞',
    badge: 'Root Cause & Fix',
    color: 'from-rose-500 to-amber-600',
    description: 'Systematic root-cause diagnosis, reproduction steps, minimal surgical diffs, and regression prevention.',
    rolePrompt: `You are a Principal Software Debugging Engineer and diagnostic specialist.
Your objective is to identify the exact root cause of the reported issue, trace state anomalies, and deliver an elegant, surgical fix without regressions.`,
    directives: [
      'Perform step-by-step root cause analysis (RCA).',
      'Identify race conditions, stale closures, or unhandled null/undefined values.',
      'Provide minimal, high-precision surgical diffs rather than broad rewrites.',
      'Verify fix preserves existing behavior and passes edge conditions.',
    ],
  },
  {
    id: 'speed_run',
    name: 'Speed Run / Hackathon MVP',
    icon: '⚡',
    badge: 'High Velocity',
    color: 'from-amber-500 to-emerald-500',
    description: 'High-velocity MVP implementation prioritizing working code, zero unnecessary boilerplate, and instant user impact.',
    rolePrompt: `You are a legendary 10x Hackathon Vibecoder with hyperfocus and high velocity.
Your objective is to ship a blazing-fast, visually polished, fully functional implementation in record time with pragmatic simplicity.`,
    directives: [
      'Zero bloat — build what works immediately and cleanly.',
      'Leverage Tailwind utility classes directly for maximum speed.',
      'Use existing helper hooks and utility patterns already in the repo.',
      'Make it immediately testable and pitch-ready.',
    ],
  },
  {
    id: 'test_driven',
    name: 'Test-Driven (TDD)',
    icon: '🧪',
    badge: 'Quality & Verification',
    color: 'from-emerald-500 to-cyan-500',
    description: 'Defines acceptance criteria, boundary tests, edge cases, and verifiable unit/integration specs before implementation.',
    rolePrompt: `You are a Quality Assurance and Test-Driven Development (TDD) Specialist.
Your objective is to craft comprehensive acceptance criteria, edge-case assertions, and verifiable test scenarios for this task.`,
    directives: [
      'Define clear given/when/then acceptance scenarios.',
      'Enumerate boundary edge cases (null inputs, empty states, network blips).',
      'Provide runnable assertions or unit test scaffolding.',
      'Verify 100% adherence to product requirements.',
    ],
  },
  {
    id: 'refactor_clean',
    name: 'Refactor & Clean Code',
    icon: '💎',
    badge: 'Code Polish',
    color: 'from-cyan-500 to-indigo-600',
    description: 'Elevates code craftsmanship, deduplicates logic, optimizes rendering performance, and strengthens maintainability.',
    rolePrompt: `You are a Staff Refactoring Engineer and Clean Code Advocate.
Your objective is to streamline existing code, eliminate code smells, eliminate redundant re-renders, and maximize maintainability.`,
    directives: [
      'Simplify complex branching into declarative constructs.',
      'Extract reusable hooks and pure utility functions.',
      'Ensure consistent naming, self-documenting code, and preserved comments.',
      'Ensure zero regressions or broken imports.',
    ],
  },
];

export const TARGET_MODELS = [
  { id: 'claude', name: 'Claude 3.7 Sonnet / Thinking', toolTag: 'Claude' },
  { id: 'cursor', name: 'Cursor Composer (Fast & Agentic)', toolTag: 'Cursor' },
  { id: 'chatgpt', name: 'ChatGPT o3-mini / GPT-4o', toolTag: 'ChatGPT' },
  { id: 'lovable', name: 'Lovable / Replit AI', toolTag: 'Lovable' },
  { id: 'gemini', name: 'Gemini 2.0 Flash / Pro', toolTag: 'Other' },
];

/**
 * Synthesizes an ultra-high-context prompt based on task data, selected template, and settings.
 *
 * @param {Object} options
 * @param {Object} options.task
 * @param {string} options.templateId
 * @param {string} options.targetModelId
 * @param {boolean} [options.includeArchitecture=true]
 * @param {boolean} [options.includeConstraints=true]
 * @param {string} [options.customDirective='']
 * @returns {string}
 */
export function synthesizeOptimizedPrompt({
  task,
  templateId = 'feature_architect',
  targetModelId = 'claude',
  includeArchitecture = true,
  includeConstraints = true,
  customDirective = '',
}) {
  const template =
    PROMPT_TEMPLATES.find((t) => t.id === templateId) || PROMPT_TEMPLATES[0];
  const model =
    TARGET_MODELS.find((m) => m.id === targetModelId) || TARGET_MODELS[0];

  const title = (task?.title && task.title.trim()) || 'Untitled Feature / Task';
  const type = task?.type || 'feature';
  const status = task?.status || 'todo';
  const assignee = task?.assignee || 'Unassigned';
  const dueDate = task?.dueDate || 'None';
  const description =
    (task?.description && task.description.trim()) || 'No description provided.';
  const contextBriefing =
    (task?.context && task.context.trim()) || 'No existing context briefing logged yet.';

  const sections = [];

  // 1. Header & Role Instruction
  sections.push(`# Prompt Request for ${model.name}
Role Persona: ${template.name} (${template.badge})

${template.rolePrompt}`);

  // 2. Task Specification & Live State
  sections.push(`## 🎯 Task Objective & Live State
- **Title:** ${title}
- **Type:** ${type.toUpperCase()} (${type === 'bug' ? 'Defect fix' : 'New capability'})
- **Current Stage:** ${status.toUpperCase()}
- **Assigned Teammate:** ${assignee}
- **Due Date:** ${dueDate}

### Description & User Story
${description}`);

  // 3. AI Context Briefing
  sections.push(`### 🧠 AI Context Briefing & Background Knowledge
${contextBriefing}`);

  // 4. Template-Specific Execution Directives
  const directivesList = template.directives.map((d) => `- ${d}`).join('\n');
  sections.push(`## 📋 Execution Protocol & Directives
${directivesList}${
    customDirective ? `\n- **Custom Directive:** ${customDirective.trim()}` : ''
  }`);

  // 5. Architectural Guardrails
  if (includeArchitecture) {
    sections.push(`## 🏛️ Project Architecture & Design System Guidelines
- **Core Framework:** React 18+ bundled with Vite (ES modules, fast refresh).
- **Styling Architecture:** Tailwind CSS utility classes strictly following \`DESIGN.md\`:
  - Background: Slate 900 (\`#0F172A\`, \`bg-surface-page\`)
  - Cards: Slate 800 (\`#1E293B\`, \`bg-surface-card\`, 1px \`border-slate-700/60\`)
  - Accent colors: Electric Indigo (\`#6366F1\`) & Violet Neon (\`#8B5CF6\`)
  - Feature badge: Emerald 500 (\`#10B981\`) | Bug badge: Rose/Red 500 (\`#EF4444\`)
  - Monospace font: JetBrains Mono / Fira Code for prompt context & tags.
- **State Management & Persistence:** React hooks (\`useState\`, \`useEffect\`) combined with \`useLocalStorage\` (zero backend required for hackathon).
- **Audio Feedback:** Non-blocking Web Audio API synthesized chimes (\`vibeAudio\`).`);
  }

  // 6. Quality & Code Constraints
  if (includeConstraints) {
    sections.push(`## ⚠️ Strict Output Constraints
1. **Preserve Integrity:** Preserve all existing docstrings, component interfaces, and comments.
2. **Deterministic & Safe:** Do NOT introduce random third-party npm libraries unless strictly requested.
3. **Completeness:** Provide complete, drop-in replacement code blocks with file path headers. Do not use placeholder omissions like "// ... rest of code unchanged".
4. **Clean Verification:** Code must compile cleanly with \`npm run build\` with zero runtime errors.`);
  }

  // 7. Call to Action
  sections.push(`---
*Synthesized by VibeTracker AI Prompt Optimizer. Please proceed with the implementation.*`);

  return sections.join('\n\n');
}
