import { useState, useEffect } from 'react';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import AnchorBoard from './components/AnchorBoard';
import { getAssigneeMeta } from './components/TaskCard';
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

export const INITIAL_TEAM_MEMBERS = [
  {
    name: 'Teammate A',
    role: 'Scrum Lead · Fullstack',
    email: 'alex.chen@cardiff.ac.uk',
  },
  {
    name: 'Teammate B',
    role: 'UI & Accessibility',
    email: 'b.designs@cardiff.ac.uk',
  },
  {
    name: 'Teammate C',
    role: 'AI & Prompt Systems',
    email: 'c.prompts@cardiff.ac.uk',
  },
];

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
  const [teamMembers, setTeamMembers] = useLocalStorage(
    'vibetracker.team_clean',
    INITIAL_TEAM_MEMBERS
  );
  const [currentUser, setCurrentUser] = useLocalStorage(
    'vibetracker.current_user',
    'Teammate A'
  );
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Team & User Profiles Modal state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Developer');
  const [teamModalError, setTeamModalError] = useState('');

  // Team management modal focus trap
  const teamModalRef = useFocusTrap(isTeamModalOpen, {
    initialFocusSelector: '#new-member-name',
  });

  // Handle Escape key for Team dialog
  useEffect(() => {
    if (!isTeamModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsTeamModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTeamModalOpen]);

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

  // Active user switch handler
  const handleSwitchUser = (userName) => {
    setCurrentUser(userName);
    const memberObj = teamMembers.find((m) => m.name === userName);
    const detail = memberObj?.email ? ` (${memberObj.email})` : '';
    setToastMessage(`Switched active user to ${userName}${detail}.`);
  };

  // Add new team member handler
  const handleAddTeamMember = (e) => {
    e.preventDefault();
    const trimmedName = newMemberName.trim();
    const trimmedEmail = newMemberEmail.trim();
    const trimmedRole = newMemberRole.trim() || 'Developer';

    if (!trimmedName) {
      setTeamModalError('Member name is required.');
      return;
    }
    if (teamMembers.some((m) => m.name.toLowerCase() === trimmedName.toLowerCase())) {
      setTeamModalError('A team member with this name already exists.');
      return;
    }

    const createdMember = {
      name: trimmedName,
      email: trimmedEmail || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@cardiff.ac.uk`,
      role: trimmedRole,
    };

    setTeamMembers((prev) => [...prev, createdMember]);
    setCurrentUser(createdMember.name);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Developer');
    setTeamModalError('');
    setToastMessage(`Added ${createdMember.name} to team and switched active profile.`);
  };

  // Remove custom team member handler
  const handleRemoveTeamMember = (memberName) => {
    if (teamMembers.length <= 1) return;
    const updated = teamMembers.filter((m) => m.name !== memberName);
    setTeamMembers(updated);
    if (currentUser === memberName) {
      setCurrentUser(updated[0].name);
    }
    setToastMessage(`Removed ${memberName} from team roster.`);
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
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Team workspace · 4-stage flow · Prompt-native project tracker
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Active User Switcher */}
            <div
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 shadow-sm"
              role="group"
              aria-label="Active user profile and switcher"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold border ${getAssigneeMeta(currentUser).bg} ${getAssigneeMeta(currentUser).text} ${getAssigneeMeta(currentUser).border}`}
                aria-hidden="true"
              >
                {getAssigneeMeta(currentUser).initials}
              </span>
              <label htmlFor="active-user-select" className="sr-only">
                Switch active user profile
              </label>
              <select
                id="active-user-select"
                value={teamMembers.some((m) => m.name === currentUser) ? currentUser : teamMembers[0]?.name || 'Teammate A'}
                onChange={(e) => handleSwitchUser(e.target.value)}
                aria-label="Switch active user profile"
                title="Switch active user session"
                className="bg-transparent text-xs font-medium text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded cursor-pointer pr-1"
              >
                {teamMembers.map((m) => (
                  <option key={m.name} value={m.name} className="bg-slate-900 text-slate-100">
                    {m.name} ({m.role.split('·')[0].trim()})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setTeamModalError('');
                  setIsTeamModalOpen(true);
                }}
                aria-label="Manage team members and contact emails"
                title="View team directory or add a team member"
                className="ml-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
              >
                + Team ({teamMembers.length})
              </button>
            </div>

            {/* My Tasks Filter Toggle */}
            <button
              type="button"
              onClick={() => setFilterMyTasks((prev) => !prev)}
              aria-pressed={filterMyTasks}
              aria-label={`Filter tasks assigned to ${currentUser}`}
              title={`Show only tasks assigned to ${currentUser}`}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                filterMyTasks
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-sm'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>My Tasks</span>
              <span className="rounded-full bg-slate-900/80 px-1.5 py-0.2 text-[10px] font-mono text-indigo-300">
                {tasks.filter((t) => t.assignee === currentUser).length}
              </span>
            </button>

            <span className="text-xs font-mono text-slate-400 hidden xl:inline" aria-label={`${tasks.length} total tasks on board`}>
              {tasks.length} total
            </span>

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
            tasks={filterMyTasks ? tasks.filter((t) => t.assignee === currentUser) : tasks}
            allTasks={tasks}
            teamMembers={teamMembers}
            currentUser={currentUser}
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
          teamMembers={teamMembers}
          currentUser={currentUser}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onCopyPrompt={handleCopyPrompt}
        />

        {/* Accessible Team Directory & User Switcher Modal */}
        {isTeamModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none"
            onClick={() => setIsTeamModalOpen(false)}
          >
            <div
              ref={teamModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="team-modal-title"
              aria-describedby="team-modal-desc"
              className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div>
                  <h2 id="team-modal-title" className="text-base font-bold text-white">
                    Team Roster & Active User Switcher
                  </h2>
                  <p id="team-modal-desc" className="text-xs text-slate-400 mt-0.5">
                    Switch active session profile or add a collaborator with contact details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  aria-label="Close team roster modal"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Team Members List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1" role="list" aria-label="Team members">
                {teamMembers.map((member) => {
                  const meta = getAssigneeMeta(member.name);
                  const isActive = currentUser === member.name;
                  const assignedCount = tasks.filter((t) => t.assignee === member.name).length;

                  return (
                    <div
                      key={member.name}
                      role="listitem"
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                        isActive
                          ? 'border-indigo-500/60 bg-indigo-950/30'
                          : 'border-slate-800 bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border}`}
                          aria-hidden="true"
                        >
                          {meta.initials}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-100 truncate">
                              {member.name}
                            </span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700">
                              {member.role}
                            </span>
                            {isActive && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                            {member.email} · {assignedCount} {assignedCount === 1 ? 'task' : 'tasks'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSwitchUser(member.name)}
                            className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
                          >
                            Switch to User
                          </button>
                        )}
                        {!INITIAL_TEAM_MEMBERS.some((m) => m.name === member.name) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(member.name)}
                            aria-label={`Remove ${member.name} from team`}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Team Member Form */}
              <form onSubmit={handleAddTeamMember} className="space-y-3 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Add Team Member
                </h3>
                {teamModalError && (
                  <p role="alert" className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-1.5">
                    {teamModalError}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="new-member-name" className="block text-[11px] font-medium text-slate-300 mb-1">
                      Name <span className="text-rose-400" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="new-member-name"
                      type="text"
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="e.g. Sam Patel"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-member-email" className="block text-[11px] font-medium text-slate-300 mb-1">
                      Contact Email
                    </label>
                    <input
                      id="new-member-email"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="patels@cardiff.ac.uk"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-member-role" className="block text-[11px] font-medium text-slate-300 mb-1">
                      Role
                    </label>
                    <input
                      id="new-member-role"
                      type="text"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      placeholder="UX / Backend"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsTeamModalOpen(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    Done
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    Add & Switch User
                  </button>
                </div>
              </form>
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
        </div>
      </footer>
    </div>
  );
}
