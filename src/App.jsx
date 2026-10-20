import { useState, useEffect } from 'react';
import Board from './components/Board';
import { seedTasks } from './models/seedTasks';

/**
 * Vibecoding Project Tracker
 *
 * Milestone 4 (data-model):
 * - Implemented 4-column responsive Kanban board view
 * - Seed tasks matching PRD data model loaded via useLocalStorage
 * - Quick status updates between stages
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 * @property {string} [context]
 * @property {string|null} [contextTool]
 * @property {string|null} [contextUpdatedAt]
 */

// The four columns of the board, in render order.
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

// Team members from PRD §8
export const TEAM = ['Teammate A', 'Teammate B', 'Teammate C'];

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', seedTasks);

  // Quick move handler across stages
  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="min-h-screen bg-surface-page p-6 text-text-primary antialiased">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Vibecoding Project Tracker
              </h1>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Team workspace · 4-stage flow · Linear-inspired dark workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted">
              {tasks.length} total tasks
            </span>
          </div>
        </header>

        {/* TODO M11 anchors: render Anchor Board here */}

        {/* M4 Kanban Board */}
        <main>
          <Board
            stages={STAGES}
            tasks={tasks}
            onStatusChange={handleStatusChange}
          />
        </main>
      </div>
    </div>
  );
}
