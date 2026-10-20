/**
 * Polished Demo Dataset for the Vibecoding Project Tracker (Milestone 13).
 *
 * Simulates an active, high-intensity hackathon sprint for Prof. Dr. Ignacio Alvarez
 * and judging panel. Features realistic AI context briefings, varying due date urgency
 * (safe, warning, overdue, neutral), balanced task types (feature, bug), all 4 stages
 * populated, and authentic AI tool context chains (Claude, Cursor, ChatGPT, Lovable, Replit).
 *
 * Adheres to PRD Section 5 Task schema:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   type: 'feature' | 'bug',
 *   status: 'todo' | 'in-progress' | 'review' | 'done',
 *   assignee: 'Teammate A' | 'Teammate B' | 'Teammate C',
 *   dueDate: string | null,        // ISO 'YYYY-MM-DD'
 *   createdDate: string,           // ISO 'YYYY-MM-DD'
 *   context: string,               // Curated AI context briefing for model handoff
 *   contextTool: string | null,    // Target model / IDE
 *   contextUpdatedAt: string | null,
 * }
 */

/**
 * Calculates a relative ISO date string 'YYYY-MM-DD' from today.
 * Ensures the demo dataset always renders fresh urgency tints (overdue, warning, safe)
 * regardless of when the presentation or evaluation occurs.
 *
 * @param {number} offsetDays - Days from today (negative for past, positive for future)
 * @returns {string} ISO date string 'YYYY-MM-DD'
 */
export function getRelativeIsoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates the live hackathon showcase task list.
 * @returns {Array<Object>}
 */
export function generateSeedTasks() {
  return [
    {
      id: 'task-1',
      title: 'Scaffold Tailwind palette & dark design tokens',
      description: 'Configure brand indigo colors, deep slate surfaces (#0B0F19), and custom glow utilities in tailwind.config.js matching Raycast/Linear design specs.',
      type: 'feature',
      status: 'done',
      assignee: 'Teammate B',
      dueDate: getRelativeIsoDate(-4),
      createdDate: getRelativeIsoDate(-7),
      context: 'Implemented dark theme tokens in tailwind.config.js and src/index.css. Verified contrast ratios across cards, badges, and modal backdrops. Preserved native scrollbar and typography.',
      contextTool: 'Claude',
      contextUpdatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Deliverable Anchor Board for final course milestones',
      description: 'Create the persistent 4-slot header pinning Presentation, Demo, Report, and Documentation deliverables with real-time status pills and link validation.',
      type: 'feature',
      status: 'done',
      assignee: 'Teammate A',
      dueDate: getRelativeIsoDate(-2),
      createdDate: getRelativeIsoDate(-5),
      context: 'Engineered AnchorBoard.jsx with ANCHOR_CONFIG mappings, external URL sanitization, copy-to-clipboard badges, and Web Audio fanfare triggers upon milestone completion.',
      contextTool: 'Cursor',
      contextUpdatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Synthesize AI Prompt Optimizer & persona templates',
      description: 'Build modal with 5 architectural personas (Feature Architect, Debugger, MVP Speed Run, TDD, Clean Refactor) injecting constraints and negative rules into prompt copies.',
      type: 'feature',
      status: 'review',
      assignee: 'Teammate C',
      dueDate: getRelativeIsoDate(0), // Due Today -> Warning/Overdue alert
      createdDate: getRelativeIsoDate(-2),
      context: 'Added promptOptimizer.js and PromptOptimizerModal.jsx. Personas inject anti-hallucination constraints, target model metadata, and direct 1-click injection back to task briefing context.',
      contextTool: 'ChatGPT',
      contextUpdatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Fix card status dropdown keyboard trap on small screens',
      description: 'Ensure tab navigation, escape key, and arrow keys properly release focus when cycling through stage transitions on compact desktop resolutions.',
      type: 'bug',
      status: 'review',
      assignee: 'Teammate A',
      dueDate: getRelativeIsoDate(1), // Due Tomorrow -> Amber Warning
      createdDate: getRelativeIsoDate(-1),
      context: 'Auditing focus rings in TaskCard.jsx. Need to handle onKeyDown for Escape to dismiss the handoff and stage dropdowns without bubbling to parent modal listeners.',
      contextTool: 'Lovable',
      contextUpdatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Implement Vibe Velocity & Flow Analytics meter',
      description: 'Compute real-time cognitive flow percentage, momentum multiplier, and AI briefing coverage with animated neon shimmer bar and collapsible telemetry.',
      type: 'feature',
      status: 'in-progress',
      assignee: 'Teammate B',
      dueDate: getRelativeIsoDate(2), // Due in 2 days -> Safe Emerald
      createdDate: getRelativeIsoDate(-1),
      context: 'Created VibeVelocityBar.jsx. Calculates flow score = (completedRatio * 0.45) + (briefedRatio * 0.35) + (deliverablesReady * 0.20). Added audio mute toggle and shimmer animations.',
      contextTool: 'Claude',
      contextUpdatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'task-6',
      title: 'Resolve clipboard permission fallback in non-HTTPS sandbox',
      description: 'Navigator.clipboard.writeText fails silently when evaluated inside cross-origin iframes or HTTP demo mirrors. Provide foolproof textarea execCommand fallback.',
      type: 'bug',
      status: 'in-progress',
      assignee: 'Teammate C',
      dueDate: getRelativeIsoDate(-1), // Overdue -> Red Overdue
      createdDate: getRelativeIsoDate(-3),
      context: 'Fixed copyToClipboard helper in contextHelper.js with invisible fallback textarea. Verified prompt context copies cleanly on both localhost, preview iframes, and mobile browsers.',
      contextTool: 'Cursor',
      contextUpdatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 'task-7',
      title: 'Record 3-minute pitch demo screencast & slides sync',
      description: 'Record clean walkthrough video demonstrating task creation, prompt copying into Claude, drag handoff, and anchor completion for Prof. Dr. Ignacio Alvarez.',
      type: 'feature',
      status: 'todo',
      assignee: 'Teammate A',
      dueDate: getRelativeIsoDate(3), // Due in 3 days -> Safe
      createdDate: getRelativeIsoDate(0),
      context: 'Follow PITCH.md script. Start with the Hook (Linear loses prompts), transition to Kanban + AI Context, demo the Prompt Synthesizer, and trigger the Anchor completion sound.',
      contextTool: 'Replit',
      contextUpdatedAt: new Date().toISOString(),
    },
    {
      id: 'task-8',
      title: 'Web Audio chime distortion on rapid consecutive task moves',
      description: 'AudioContext oscillator nodes overlap if user rapidly changes stages 5+ times in one second. Introduce a 40ms debounce gate on the vibeAudio synthesizer.',
      type: 'bug',
      status: 'todo',
      assignee: 'Teammate B',
      dueDate: getRelativeIsoDate(-2), // Overdue -> Red Overdue
      createdDate: getRelativeIsoDate(-3),
      context: 'Inspect vibeAudio.js oscillator scheduling. Add this._lastTrigger timestamp check so consecutive triggers within 45ms cleanly fade out the prior gain node.',
      contextTool: 'Claude',
      contextUpdatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];
}

export const seedTasks = generateSeedTasks();
