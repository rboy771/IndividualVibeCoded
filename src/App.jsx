import { useState, useEffect } from 'react';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import AnchorBoard from './components/AnchorBoard';
import VibeVelocityBar from './components/VibeVelocityBar';
import PromptOptimizerModal from './components/PromptOptimizerModal';
import PitchGuideModal from './components/PitchGuideModal';
import { seedTasks, generateSeedTasks } from './models/seedTasks';
import { INITIAL_ANCHORS, getDemoAnchors } from './models/anchors';
import { vibeAudio } from './utils/vibeAudio';

/**
 * Vibecoding Project Tracker
 *
 * Milestone 6 (tag-style):
 * - Refined emerald & rose badge pills with sparkle & bug icons
 * - Card left-border accent stripe reflecting task type
 *
 * Milestone 7 (task-owner):
 * - Distinctive colored initials avatar + name per teammate
 * - Inline quick "Hand off to..." teammate dropdown on TaskCard
 * - Full state update & localStorage persistence with smooth handoff feedback
 *
 * Milestone 8 (due-tint):
 * - Dynamic relative due date calculation (overdue, today, tomorrow, safe, neutral)
 * - DueBadge component with icons and color-coded status
 * - Urgency indicators and card tinting
 *
 * Milestone 9 (context):
 * - Dedicated AI Context Briefing section in TaskModal
 * - Target AI tool selector ('Claude', 'ChatGPT', 'Cursor', etc.)
 * - Context briefing persistence with automated contextUpdatedAt timestamp
 *
 * Milestone 10 (copy-prompt):
 * - Structured Markdown prompt serialization optimized for AI continuation
 * - Quick copy button on TaskCard & hero action on TaskModal
 * - Clipboard writing with fallback and visual feedback toast
 *
 * Milestone 11 (anchors):
 * - 4-deliverable Anchor Board pinned above Kanban board (Presentation, Demo, Report, Documentation)
 * - Distinct iconography and color accents per deliverable
 * - Deliverable status tracking ('pending', 'in-progress', 'ready') with interactive editing modal
 * - Clickable links with external navigation, copy-to-clipboard, and localStorage persistence
 *
 * Milestone 12 (secret-sauce):
 * - Vibe Velocity & Flow Analytics Bar with neon shimmer meter and momentum stats
 * - AI Prompt Optimizer & Vibe Synthesizer Modal with persona templates, architectural rules & constraints
 * - Web Audio API Micro-Sounds Engine (vibeAudio) with mute/unmute toggle and audio feedback on interactions
 *
 * Milestone 13 (pitch-ready):
 * - High-polish showcase dataset in seedTasks.js with dynamic relative urgency dates
 * - Interactive in-app 5-Minute Pitch Presentation Guide modal with live timer & rehearsal script
 * - 1-Click "Reset Demo Dataset" quick button with confirmation dialog for live judge demonstrations
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
  const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', INITIAL_ANCHORS);
  const [copiedPromptsCount, setCopiedPromptsCount] = useLocalStorage('vibetracker.prompt_count', 0);
  const [soundEnabled, setSoundEnabled] = useState(() => vibeAudio.isEnabled());

  const [editingTask, setEditingTask] = useState(null); // null = closed, {} = new task, task object = editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // M12: AI Prompt Optimizer & Vibe Synthesizer Modal state
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [optimizerTask, setOptimizerTask] = useState(null);

  // M13: Pitch Guide & Reset Demo Confirmation state
  const [isPitchGuideOpen, setIsPitchGuideOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Audio mute/unmute toggle (M12)
  const handleToggleSound = () => {
    const newState = vibeAudio.toggle();
    setSoundEnabled(newState);
    setToastMessage(newState ? '🔊 Vibe Audio enabled.' : '🔇 Vibe Audio muted.');
  };

  // Quick move handler across stages with sound effects
  const handleStatusChange = (taskId, newStatus) => {
    if (newStatus === 'done') {
      vibeAudio.playTaskComplete();
    } else {
      vibeAudio.playTaskMove();
    }
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Quick handoff handler across teammates (M7)
  const handleAssigneeChange = (taskId, newAssignee) => {
    vibeAudio.playTaskMove();
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, assignee: newAssignee } : t))
    );
    // Microcopy from DESIGN.md: "Task handed off to {name}. Smooth sailing."
    setToastMessage(`Task handed off to ${newAssignee}. Smooth sailing.`);
  };

  // Quick copy prompt feedback handler (M10)
  const handleCopyPrompt = () => {
    setCopiedPromptsCount((prev) => (Number(prev) || 0) + 1);
    vibeAudio.playPromptCopy();
    // Microcopy from DESIGN.md: "Prompt context copied to clipboard. Ready to paste."
    setToastMessage('Prompt context copied to clipboard. Ready to paste.');
  };

  // Anchor update handler (M11) with audio fanfare on completion (M12)
  const handleUpdateAnchor = (updatedAnchor) => {
    setAnchors((prevAnchors) => {
      const existing = prevAnchors.find((a) => a.id === updatedAnchor.id);
      if (updatedAnchor.status === 'ready' && existing?.status !== 'ready') {
        vibeAudio.playAnchorComplete();
      }
      return prevAnchors.map((a) => (a.id === updatedAnchor.id ? updatedAnchor : a));
    });
  };

  // M12: Open AI Prompt Optimizer & Vibe Synthesizer
  const handleOpenOptimizer = (targetTask) => {
    setOptimizerTask(targetTask || (editingTask && editingTask.id ? editingTask : null));
    setIsOptimizerOpen(true);
  };

  const handleCloseOptimizer = () => {
    setIsOptimizerOpen(false);
    setOptimizerTask(null);
  };

  // M12: Apply synthesized context back to task
  const handleApplyOptimizedContext = (taskId, newContext, toolTag) => {
    const nowIso = new Date().toISOString();
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              context: newContext,
              contextTool: toolTag || t.contextTool || 'Claude',
              contextUpdatedAt: nowIso,
            }
          : t
      )
    );

    // Sync editingTask if TaskModal is currently open with this task
    setEditingTask((prev) =>
      prev && prev.id === taskId
        ? {
            ...prev,
            context: newContext,
            contextTool: toolTag || prev.contextTool || 'Claude',
            contextUpdatedAt: nowIso,
          }
        : prev
    );
  };

  // M13: Reset Demo Dataset for live pitch showcase
  const handleConfirmResetDemo = () => {
    const freshTasks = generateSeedTasks();
    const demoAnchors = getDemoAnchors();
    setTasks(freshTasks);
    setAnchors(demoAnchors);
    setCopiedPromptsCount(4);
    setIsResetConfirmOpen(false);
    vibeAudio.playAnchorComplete();
    setToastMessage('🎯 Pitch demo dataset restored! Board is stage-ready.');
  };

  const handleOpenCreateModal = () => {
    vibeAudio.playToggle();
    setEditingTask({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    vibeAudio.playToggle();
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (taskData) => {
    setTasks((prevTasks) => {
      const exists = prevTasks.some((t) => t.id === taskData.id);
      if (exists) {
        return prevTasks.map((t) => (t.id === taskData.id ? taskData : t));
      }
      return [...prevTasks, taskData];
    });

    if (taskData.status === 'done') {
      vibeAudio.playTaskComplete();
    } else {
      vibeAudio.playTaskMove();
    }

    handleCloseModal();
  };

  const handleDeleteTask = (taskId) => {
    vibeAudio.playTaskMove();
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-surface-page p-4 sm:p-6 text-text-primary antialiased flex flex-col justify-between">
      <div className="mx-auto max-w-7xl w-full flex-1">
        {/* Header Bar */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center">
                VibeTracker
                <span className="inline-block h-2 w-2 rounded-full bg-brand-accent ml-1.5 align-baseline shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              </h1>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Team workspace · 4-stage flow · Linear-inspired dark workspace · Prepared for Prof. Dr. Ignacio Alvarez
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono text-text-muted hidden md:inline">
              {tasks.length} total tasks
            </span>

            {/* M13 Interactive Pitch Guide Trigger */}
            <button
              type="button"
              onClick={() => {
                vibeAudio.playToggle();
                setIsPitchGuideOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/50 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 px-3 py-2 text-xs font-semibold text-purple-200 hover:text-white hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all"
              title="Open 5-Minute Pitch Presentation Guide & Demo Script"
            >
              <span>🎙️</span>
              <span>Pitch Guide</span>
              <span className="hidden sm:inline rounded bg-purple-500/25 px-1.5 py-0.2 text-[10px] text-purple-200 font-mono">
                5m
              </span>
            </button>

            {/* M13 Reset Demo Data Trigger */}
            <button
              type="button"
              onClick={() => {
                vibeAudio.playToggle();
                setIsResetConfirmOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
              title="Restore clean pitch showcase dataset"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* M12 Prompt Synthesizer Hero Header Button */}
            <button
              type="button"
              onClick={() => handleOpenOptimizer(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-accent/40 bg-brand-accent/15 px-3 py-2 text-xs font-semibold text-purple-200 transition-all hover:bg-brand-accent/25 hover:text-white shadow-sm"
              title="Open AI Prompt Optimizer & Vibe Synthesizer"
            >
              <span>✨</span>
              <span className="hidden sm:inline">AI Synthesizer</span>
            </button>

            {/* New Task Hero Action */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              + New Task
            </button>
          </div>
        </header>

        {/* M12 Feature 1: Vibe Velocity & Flow Analytics Bar */}
        <VibeVelocityBar
          tasks={tasks}
          anchors={anchors}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenOptimizer={() => handleOpenOptimizer(null)}
          copiedCount={copiedPromptsCount}
        />

        {/* M11 Deliverable Anchor Board pinned above the Kanban board */}
        <AnchorBoard
          anchors={anchors}
          onUpdateAnchor={handleUpdateAnchor}
          onToast={setToastMessage}
        />

        {/* M4 Kanban Board */}
        <main>
          <Board
            stages={STAGES}
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onAssigneeChange={handleAssigneeChange}
            onTaskClick={handleOpenEditModal}
            onEditTask={handleOpenEditModal}
            onCopyPrompt={handleCopyPrompt}
            onOpenOptimizer={handleOpenOptimizer}
          />
        </main>

        {/* M5 CRUD TaskModal with M9 Context & M10 Prompt Copy & M12 Optimizer */}
        <TaskModal
          isOpen={isModalOpen}
          task={editingTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onCopyPrompt={handleCopyPrompt}
          onOpenOptimizer={handleOpenOptimizer}
        />

        {/* M12: AI Prompt Optimizer & Vibe Synthesizer Modal */}
        <PromptOptimizerModal
          isOpen={isOptimizerOpen}
          task={optimizerTask}
          tasks={tasks}
          onClose={handleCloseOptimizer}
          onApplyContext={handleApplyOptimizedContext}
          onToast={setToastMessage}
          onPromptCopied={() => setCopiedPromptsCount((prev) => (Number(prev) || 0) + 1)}
        />

        {/* M13: Interactive Pitch Guide Presentation Modal */}
        <PitchGuideModal
          isOpen={isPitchGuideOpen}
          onClose={() => setIsPitchGuideOpen(false)}
          onResetDemoData={() => {
            setIsPitchGuideOpen(false);
            handleConfirmResetDemo();
          }}
          onOpenSynthesizer={() => {
            setIsPitchGuideOpen(false);
            handleOpenOptimizer(null);
          }}
        />

        {/* M13: Reset Demo Dataset Confirmation Dialog */}
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-xl">
                  🎯
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Reset to Pitch Showcase Dataset?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clean slate for live judge evaluation
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                This restores 8 active sprint tasks across all 4 stages with calibrated due-date urgency tints (Overdue, Warning, Safe), curated AI context briefings, and sets Anchor Deliverables to presentation readiness.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetDemo}
                  className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/30 hover:bg-indigo-600 transition-colors"
                >
                  Confirm & Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Handoff, Anchor & Prompt Copy Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-brand-primary/40 bg-slate-900/95 px-4 py-3 text-xs font-medium text-slate-100 shadow-xl backdrop-blur transition-opacity duration-200">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Footer Navigation & Credits */}
      <footer className="mx-auto max-w-7xl w-full border-t border-slate-800/80 mt-10 pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-text-muted gap-3">
        <div className="flex items-center gap-2">
          <span>VibeTracker · Individual Hackathon Edition</span>
          <span>·</span>
          <span>Prof. Dr. Ignacio Alvarez</span>
          <span>·</span>
          <span className="text-emerald-400 font-medium">13/13 Milestones Complete</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              vibeAudio.playToggle();
              setIsPitchGuideOpen(true);
            }}
            className="hover:text-purple-300 transition-colors"
          >
            🎙️ Pitch Presentation Guide
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              vibeAudio.playToggle();
              setIsResetConfirmOpen(true);
            }}
            className="hover:text-slate-200 transition-colors"
          >
            🔄 Restore Demo State
          </button>
        </div>
      </footer>
    </div>
  );
}
