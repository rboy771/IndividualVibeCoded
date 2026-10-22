/**
 * Initial Seed Tasks (Milestone 4: data-model)
 * Pre-populates 4 clean mock tasks representing the core sprint with prerequisite lineage.
 */

function getRelativeIsoDate(daysOffset) {
  const target = new Date();
  target.setDate(target.getDate() + daysOffset);
  return target.toISOString().split('T')[0];
}

export function generateSeedTasks() {
  const now = new Date();

  return [
    {
      id: 'task-1',
      title: 'Scaffold Tailwind design tokens and dark workspace',
      description: 'Configure slate background surfaces, indigo brand colors, and accessible text contrast in tailwind.config.js.',
      type: 'feature',
      status: 'done',
      assignee: 'Teammate B',
      dueDate: getRelativeIsoDate(-4),
      createdDate: getRelativeIsoDate(-7),
      context: 'Configured dark theme tokens in tailwind.config.js and verified WCAG 2.1 AA text contrast ratio >= 4.5:1.',
      contextTool: 'Claude',
      contextUpdatedAt: new Date(now.getTime() - 3600000 * 48).toISOString(),
      prerequisiteId: null,
    },
    {
      id: 'task-2',
      title: 'Build Deliverable Anchor Board banner',
      description: 'Create pinned top header tracking Presentation, Demo, Report, and Documentation deliverables with real-time status indicators.',
      type: 'feature',
      status: 'done',
      assignee: 'Teammate A',
      dueDate: getRelativeIsoDate(-2),
      createdDate: getRelativeIsoDate(-5),
      context: 'Built AnchorBoard.jsx with responsive layout, URL input modal, and localStorage persistence.',
      contextTool: 'Cursor',
      contextUpdatedAt: new Date(now.getTime() - 3600000 * 24).toISOString(),
      prerequisiteId: null,
    },
    {
      id: 'task-3',
      title: 'Implement prompt briefing context and 1-click clipboard copy',
      description: 'Store Markdown instructions and target LLM tool on each task, serializing to clipboard on click.',
      type: 'feature',
      status: 'in-progress',
      assignee: 'Teammate C',
      dueDate: getRelativeIsoDate(1),
      createdDate: getRelativeIsoDate(-2),
      context: 'Added contextHelper.js with Markdown prompt serializer and clipboard fallback for cross-origin environments.',
      contextTool: 'ChatGPT',
      contextUpdatedAt: new Date(now.getTime() - 3600000 * 3).toISOString(),
      prerequisiteId: 'task-1',
    },
    {
      id: 'task-4',
      title: 'Test relative due-date border urgency tinting',
      description: 'Verify overdue tasks display crimson borders, upcoming tasks show warning amber, and completed tasks remain neutral.',
      type: 'bug',
      status: 'todo',
      assignee: 'Teammate A',
      dueDate: getRelativeIsoDate(3),
      createdDate: getRelativeIsoDate(-1),
      context: 'Audited dueTint.js boundary calculations against local midnight and verified high-contrast focus rings.',
      contextTool: 'Claude',
      contextUpdatedAt: new Date(now.getTime() - 3600000 * 5).toISOString(),
      prerequisiteId: 'task-2',
    },
  ];
}

export const seedTasks = generateSeedTasks();
