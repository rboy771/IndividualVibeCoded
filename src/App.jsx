import { useState, useEffect } from 'react';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import AnchorBoard from './components/AnchorBoard';
import { seedTasks, generateSeedTasks } from './models/seedTasks';
import { INITIAL_ANCHORS, getDemoAnchors } from './models/anchors';
import { useFocusTrap } from './utils/useFocusTrap';
import * as api from './api/client';

/**
 * Vibecoding Project Tracker
 *
 * Full accessibility (WCAG 2.1 AA) compliance:
 * - Semantic Landmarks (<header>, <main id="main-board">, <section>, <footer>)
 * - Keyboard "Skip to main content" link
 * - Distinct, high-contrast focus rings (focus-visible:ring-indigo-400)
 * - Modal dialog accessibility (role="dialog" / "alertdialog", aria-modal="true", trapped focus, ESC key)
 * - Screen reader announcements (role="status", aria-live="polite")
 * - Reduced motion support (motion-reduce:transition-none motion-reduce:animate-none)
 * - Color contrast >= 4.5:1 on dark surfaces
 */

export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

export const TEAM = ['Teammate A', 'Teammate B', 'Teammate C'];

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
      /* quota or private-mode error — silently ignore */
    }
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks_clean', seedTasks);
  const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors_clean', INITIAL_ANCHORS);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Reset confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Reset confirmation modal focus trap
  const resetConfirmRef = useFocusTrap(isResetConfirmOpen, {
    initialFocusSelector: '#cancel-reset-btn',
  });

  // Handle Escape key for Reset confirmation dialog
  useEffect(() => {
    if (!isResetConfirmOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsResetConfirmOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResetConfirmOpen]);

  // Initial load from FastAPI Backend with graceful offline fallback
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [fetchedTasks, fetchedAnchors] = await Promise.all([
          api.fetchTasks(),
          api.fetchAnchors(),
        ]);
        if (isMounted) {
          if (Array.isArray(fetchedTasks) && fetchedTasks.length > 0) {
            setTasks(fetchedTasks);
          }
          if (Array.isArray(fetchedAnchors) && fetchedAnchors.length > 0) {
            setAnchors(fetchedAnchors);
          }
          setIsBackendOnline(true);
        }
      } catch {
        if (isMounted) {
          setIsBackendOnline(false);
        }
      }
    }
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Periodic health check ping
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const isHealthy = await api.checkBackendHealth();
        if (isMounted) setIsBackendOnline(Boolean(isHealthy));
      } catch {
        if (isMounted) setIsBackendOnline(false);
      }
    }, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Toast notification auto-dismiss timer
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage('');
    }, 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Move handler across stages
  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    api.updateTask(taskId, { status: newStatus })
      .then(() => setIsBackendOnline(true))
      .catch(() => setIsBackendOnline(false));
  };

  // Handoff handler across teammates
  const handleAssigneeChange = (taskId, newAssignee) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, assignee: newAssignee } : t))
    );
    setToastMessage(`Task assigned to ${newAssignee}.`);
    api.updateTask(taskId, { assignee: newAssignee })
      .then(() => setIsBackendOnline(true))
      .catch(() => setIsBackendOnline(false));
  };

  // Copy prompt feedback handler
  const handleCopyPrompt = () => {
    setToastMessage('Prompt context copied to clipboard.');
  };

  // Anchor update handler
  const handleUpdateAnchor = (updatedAnchor) => {
    setAnchors((prevAnchors) =>
      prevAnchors.map((a) => (a.id === updatedAnchor.id ? updatedAnchor : a))
    );
    api.updateAnchor(updatedAnchor.id, updatedAnchor)
      .then(() => setIsBackendOnline(true))
      .catch(() => setIsBackendOnline(false));
  };

  // Reset to clean sprint dataset
  const handleConfirmResetDemo = async () => {
    try {
      const [freshTasks, demoAnchors] = await Promise.all([
        api.resetTasks(),
        api.resetAnchors(),
      ]);
      setTasks(freshTasks);
      setAnchors(demoAnchors);
      setIsBackendOnline(true);
    } catch {
      const freshTasks = generateSeedTasks();
      const demoAnchors = getDemoAnchors();
      setTasks(freshTasks);
      setAnchors(demoAnchors);
      setIsBackendOnline(false);
    }
    setIsResetConfirmOpen(false);
    setToastMessage('Sprint dataset reset to initial state.');
  };

  // Modal open / close handlers
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Task save handler (create or update)
  const handleSaveTask = (savedTask) => {
    const isNew = !tasks.some((t) => t.id === savedTask.id);

    if (isNew) {
      setTasks((prevTasks) => [savedTask, ...prevTasks]);
      setToastMessage(`Created task "${savedTask.title}".`);
      api.createTask(savedTask)
        .then(() => setIsBackendOnline(true))
        .catch(() => setIsBackendOnline(false));
    } else {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === savedTask.id ? savedTask : t))
      );
      setToastMessage(`Saved changes to "${savedTask.title}".`);
      api.updateTask(savedTask.id, savedTask)
        .then(() => setIsBackendOnline(true))
        .catch(() => setIsBackendOnline(false));
    }

    handleCloseModal();
  };

  // Task delete handler
  const handleDeleteTask = (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
    setToastMessage(`Deleted task "${target ? target.title : taskId}".`);
    api.deleteTask(taskId)
      .then(() => setIsBackendOnline(true))
      .catch(() => setIsBackendOnline(false));
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-surface-page text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-brand-primary/30 selection:text-white">
      {/* WCAG Skip Link for keyboard navigation */}
      <a
        href="#main-board"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main Kanban board
      </a>

      {/* Screen Reader Live Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {toastMessage}
      </div>

      <div className="mx-auto max-w-7xl w-full space-y-6">
        {/* Header */}
        <header
          role="banner"
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5"
        >
          <div>
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/20 border border-brand-primary/30 text-indigo-400"
                aria-hidden="true"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-50 flex items-center">
                VibeTracker
              </h1>

              {/* Backend status indicator badge */}
              <div
                role="status"
                aria-label={
                  isBackendOnline
                    ? 'Connected to FastAPI backend'
                    : 'Running on resilient Local-First storage (localStorage)'
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono border transition-all ${
                  isBackendOnline
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300'
                }`}
                title={
                  isBackendOnline
                    ? 'Connected to FastAPI backend (http://127.0.0.1:8000)'
                    : 'Running on resilient Local-First storage (localStorage)'
                }
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isBackendOnline ? 'bg-emerald-400 animate-pulse motion-reduce:animate-none' : 'bg-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="font-medium">
                  {isBackendOnline ? 'FastAPI Online' : 'Local-First Active'}
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Team workspace · 4-stage flow · Prompt-native project tracker
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono text-slate-400 hidden md:inline" aria-label={`${tasks.length} total tasks on board`}>
              {tasks.length} total tasks
            </span>

            {/* Reset Demo Data Trigger */}
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              aria-label="Restore clean sprint dataset"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all shadow-sm"
              title="Restore clean sprint dataset"
            >
              <span aria-hidden="true">🔄</span>
              <span className="hidden sm:inline">Reset Sprint</span>
            </button>

            {/* New Task Hero Action */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              aria-label="Create new task"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* Deliverable Anchor Board pinned above the Kanban board */}
        <AnchorBoard
          anchors={anchors}
          onUpdateAnchor={handleUpdateAnchor}
          onToast={setToastMessage}
        />

        {/* Main Kanban Board with keyboard skip target */}
        <main
          id="main-board"
          tabIndex={-1}
          role="main"
          aria-label="Kanban Task Board"
          className="outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0" onMouseDown={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
        >
          <Board
            stages={STAGES}
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onAssigneeChange={handleAssigneeChange}
            onTaskClick={handleOpenEditModal}
            onEditTask={handleOpenEditModal}
            onCopyPrompt={handleCopyPrompt}
          />
        </main>

        {/* CRUD TaskModal */}
        <TaskModal
          isOpen={isModalOpen}
          task={editingTask}
          tasks={tasks}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onCopyPrompt={handleCopyPrompt}
        />

        {/* Reset Dataset Confirmation Dialog */}
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none">
            <div
              ref={resetConfirmRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="reset-modal-title"
              aria-describedby="reset-modal-desc"
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-xl"
                  aria-hidden="true"
                >
                  🔄
                </span>
                <div>
                  <h3 id="reset-modal-title" className="text-base font-bold text-white">
                    Reset Sprint Dataset?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Restores initial 4-task demonstration state
                  </p>
                </div>
              </div>

              <p id="reset-modal-desc" className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                This restores 4 clean sprint tasks across all 4 columns with calibrated due-date urgency tints and prompt briefing context.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  id="cancel-reset-btn"
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetDemo}
                  className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/30 hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
                >
                  Confirm & Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-brand-primary/40 bg-slate-900/95 px-4 py-3 text-xs font-medium text-slate-100 shadow-xl backdrop-blur transition-opacity duration-200"
          >
            <span
              className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <footer
        role="contentinfo"
        className="mx-auto max-w-7xl w-full border-t border-slate-800/80 mt-10 pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300">VibeTracker</span>
          <span aria-hidden="true">·</span>
          <span>Prompt-Native Sprint Workspace</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400/90 font-medium">WCAG 2.1 AA Accessible</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1 transition-colors"
            aria-label="Open restore sprint state confirmation dialog"
          >
            🔄 Reset Sprint State
          </button>
        </div>
      </footer>
    </div>
  );
}
