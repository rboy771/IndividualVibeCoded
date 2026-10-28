import { useState, useEffect } from 'react';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import AnchorBoard from './components/AnchorBoard';
import { getAssigneeMeta } from './components/TaskCard';
import { seedTasks } from './models/seedTasks';
import { INITIAL_ANCHORS } from './models/anchors';
import { useFocusTrap } from './utils/useFocusTrap';
import * as api from './api/client';

/**
 * Vibecoding Project Tracker
 *
 * Full accessibility (WCAG 2.1 AA) compliance:
 * - Semantic Landmarks (<header>, <aside>, <main id="main-board">, <section>, <footer>)
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
    email: 'john.lead@workspace.dev',
  },
  {
    name: 'Teammate B',
    role: 'UI & Accessibility',
    email: 'sarah.ux@workspace.dev',
  },
  {
    name: 'Teammate C',
    role: 'AI & Prompt Systems',
    email: 'liam.ai@workspace.dev',
  },
];

const INITIAL_EXTRA_BOARDS = [
  {
    id: 'board-api',
    name: 'Backend & API Sprint',
    workspace: 'Core Services',
    updatedAgo: '2d',
    tasks: [
      {
        id: 'api-1',
        title: 'Design REST endpoints for task & prompt sync',
        description: 'Define JSON schema validation and FastAPI routes for tasks and deliverable anchors.',
        type: 'feature',
        status: 'in-progress',
        assignee: 'Teammate A',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        createdDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        context: 'Create modular REST endpoints with graceful offline fallback to browser localStorage.',
        contextTool: 'Claude',
        contextUpdatedAt: new Date(Date.now() - 3600000).toISOString(),
        prerequisiteId: null,
      },
      {
        id: 'api-2',
        title: 'Fix CORS preflight headers on local dev server',
        description: 'Ensure OPTIONS requests return 200 OK for localhost:5173.',
        type: 'bug',
        status: 'done',
        assignee: 'Teammate C',
        dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
        createdDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
        context: 'Verify FastAPI CORSMiddleware allows localhost origin and standard methods.',
        contextTool: 'Cursor',
        contextUpdatedAt: new Date(Date.now() - 7200000).toISOString(),
        prerequisiteId: null,
      },
    ],
    anchors: INITIAL_ANCHORS,
  },
  {
    id: 'board-ux',
    name: 'UX & Accessibility Audit',
    workspace: 'Design System',
    updatedAgo: '5d',
    tasks: [
      {
        id: 'ux-1',
        title: 'Verify WCAG 2.1 AA contrast ratios across dark cards',
        description: 'Audit slate-900 card backgrounds and emerald/rose badges for >= 4.5:1 contrast.',
        type: 'feature',
        status: 'review',
        assignee: 'Teammate B',
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        createdDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        context: 'Pair all status colors with explicit text prefixes and SVG icons for color-vision accessibility.',
        contextTool: 'ChatGPT',
        contextUpdatedAt: new Date(Date.now() - 10800000).toISOString(),
        prerequisiteId: null,
      },
    ],
    anchors: INITIAL_ANCHORS,
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
  // Primary board state (preserves exact localStorage keys for backward compatibility)
  const [mainTasks, setMainTasks] = useLocalStorage('vibetracker.tasks_clean', seedTasks);
  const [mainAnchors, setMainAnchors] = useLocalStorage('vibetracker.anchors_clean', INITIAL_ANCHORS);

  // Additional project boards for sidebar & VS Code tabs
  const [extraBoards, setExtraBoards] = useLocalStorage(
    'vibetracker.extra_boards',
    INITIAL_EXTRA_BOARDS
  );
  const [openTabIds, setOpenTabIds] = useLocalStorage('vibetracker.open_tabs', [
    'board-main',
    'board-api',
  ]);
  const [activeBoardId, setActiveBoardId] = useLocalStorage(
    'vibetracker.active_board',
    'board-main'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage(
    'vibetracker.sidebar_open',
    true
  );
  const [boardHistory, setBoardHistory] = useState(['board-main']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  // Live clock state in top header center
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [teamMembers, setTeamMembers] = useLocalStorage(
    'vibetracker.team_clean',
    INITIAL_TEAM_MEMBERS
  );
  const [currentUser, setCurrentUser] = useLocalStorage(
    'vibetracker.current_user',
    'Teammate A'
  );

  // Auto-migrate any old @cardiff.ac.uk emails stored in browser localStorage to generic @workspace.dev emails
  useEffect(() => {
    const hasOldEmail = teamMembers.some(
      (m) => m.email && m.email.toLowerCase().includes('cardiff.ac.uk')
    );
    if (hasOldEmail) {
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (!m.email || !m.email.toLowerCase().includes('cardiff.ac.uk')) return m;
          if (m.name === 'Teammate A') return { ...m, email: 'john.lead@workspace.dev' };
          if (m.name === 'Teammate B') return { ...m, email: 'sarah.ux@workspace.dev' };
          if (m.name === 'Teammate C') return { ...m, email: 'liam.ai@workspace.dev' };
          return {
            ...m,
            email: m.email.replace(/@cardiff\.ac\.uk/i, '@workspace.dev'),
          };
        })
      );
    }
  }, [teamMembers, setTeamMembers]);

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

  // Combine main board + extra boards into unified list
  const allBoards = [
    {
      id: 'board-main',
      name: 'VibeTracker Core Sprint',
      workspace: 'Adopting Technology',
      updatedAgo: 'now',
      tasks: mainTasks,
      anchors: mainAnchors,
    },
    ...extraBoards,
  ];

  const currentBoard =
    allBoards.find((b) => b.id === activeBoardId) || allBoards[0];
  const tasks = currentBoard.tasks;
  const anchors = currentBoard.anchors;

  const setTasks = (updater) => {
    if (currentBoard.id === 'board-main') {
      setMainTasks(updater);
    } else {
      setExtraBoards((prev) =>
        prev.map((b) => {
          if (b.id !== currentBoard.id) return b;
          const nextTasks = typeof updater === 'function' ? updater(b.tasks) : updater;
          return { ...b, tasks: nextTasks, updatedAgo: 'now' };
        })
      );
    }
  };

  const setAnchors = (updater) => {
    if (currentBoard.id === 'board-main') {
      setMainAnchors(updater);
    } else {
      setExtraBoards((prev) =>
        prev.map((b) => {
          if (b.id !== currentBoard.id) return b;
          const nextAnchors = typeof updater === 'function' ? updater(b.anchors) : updater;
          return { ...b, anchors: nextAnchors };
        })
      );
    }
  };

  // Board switching & tab management
  const handleSelectBoard = (boardId, recordHistory = true) => {
    if (!openTabIds.includes(boardId)) {
      setOpenTabIds((prev) => [...prev, boardId]);
    }
    setActiveBoardId(boardId);
    if (recordHistory && boardHistory[historyIndex] !== boardId) {
      const nextHistory = [...boardHistory.slice(0, historyIndex + 1), boardId];
      setBoardHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleCloseTab = (e, boardId) => {
    e.stopPropagation();
    if (openTabIds.length <= 1) {
      setToastMessage('At least one project board tab must remain open.');
      return;
    }
    const nextTabs = openTabIds.filter((id) => id !== boardId);
    setOpenTabIds(nextTabs);
    if (activeBoardId === boardId) {
      const closedIdx = openTabIds.indexOf(boardId);
      const fallbackId = nextTabs[Math.max(0, closedIdx - 1)] || nextTabs[0];
      setActiveBoardId(fallbackId);
    }
  };

  const handleCreateBoard = (e) => {
    if (e) e.preventDefault();
    const trimmed = newBoardTitle.trim() || `Sprint Board ${allBoards.length + 1}`;
    const newId = `board-${Date.now()}`;
    const newBoard = {
      id: newId,
      name: trimmed,
      workspace: 'Project Workspace',
      updatedAgo: 'now',
      tasks: [],
      anchors: INITIAL_ANCHORS,
    };
    setExtraBoards((prev) => [newBoard, ...prev]);
    setOpenTabIds((prev) => [...prev, newId]);
    setActiveBoardId(newId);
    setNewBoardTitle('');
    setIsCreatingBoard(false);
    setToastMessage(`Created board "${trimmed}".`);
  };

  const handleDeleteBoard = (e, boardId, boardName) => {
    e.stopPropagation();
    if (boardId === 'board-main') return;
    setExtraBoards((prev) => prev.filter((b) => b.id !== boardId));
    const nextTabs = openTabIds.filter((id) => id !== boardId);
    const ensuredTabs = nextTabs.length > 0 ? nextTabs : ['board-main'];
    setOpenTabIds(ensuredTabs);
    if (activeBoardId === boardId) {
      setActiveBoardId(ensuredTabs[0]);
    }
    setToastMessage(`Removed board "${boardName}".`);
  };

  const handleNavigateHistory = (direction) => {
    const targetIdx = historyIndex + direction;
    if (targetIdx >= 0 && targetIdx < boardHistory.length) {
      const targetBoardId = boardHistory[targetIdx];
      if (allBoards.some((b) => b.id === targetBoardId)) {
        setHistoryIndex(targetIdx);
        handleSelectBoard(targetBoardId, false);
      }
    }
  };

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
            setMainTasks(fetchedTasks);
          }
          if (Array.isArray(fetchedAnchors) && fetchedAnchors.length > 0) {
            setMainAnchors(fetchedAnchors);
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
      email: trimmedEmail || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@workspace.dev`,
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

  const formattedClockTime = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formattedClockDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const filteredSidebarBoards = allBoards.filter(
    (b) =>
      b.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      b.workspace.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-page text-slate-100 flex font-sans selection:bg-brand-primary/30 selection:text-white">
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

      {/* Antigravity-Style Collapsible Left Sidebar */}
      {isSidebarOpen && (
        <aside
          id="project-boards-sidebar"
          aria-label="Project Boards Sidebar"
          className="w-64 shrink-0 bg-[#111318] border-r border-slate-800/90 flex flex-col justify-between select-none"
        >
          <div className="p-3 space-y-4">
            {/* Top utility bar matching Antigravity icon controls */}
            <div className="flex items-center justify-between px-1 pt-0.5 text-slate-400">
              <div className="flex items-center gap-3">
                {/* Brand emblem */}
                <span
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-200 font-bold"
                  aria-hidden="true"
                >
                  <svg className="h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L3 20h3.5l5.5-11 5.5 11H21L12 2z" />
                  </svg>
                </span>
                {/* Toggle Sidebar Button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-expanded={isSidebarOpen}
                  aria-controls="project-boards-sidebar"
                  aria-label="Collapse project sidebar"
                  title="Collapse sidebar"
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
                    <line x1="9" y1="4" x2="9" y2="20" strokeWidth="1.8" />
                  </svg>
                </button>
                {/* History Back / Forward */}
                <button
                  type="button"
                  onClick={() => handleNavigateHistory(-1)}
                  disabled={historyIndex <= 0}
                  aria-label="Previous board"
                  title="Previous board"
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateHistory(1)}
                  disabled={historyIndex >= boardHistory.length - 1}
                  aria-label="Next board"
                  title="Next board"
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {/* Search icon toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-expanded={isSearchOpen}
                aria-label="Search project boards"
                title="Search boards"
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {isSearchOpen && (
              <div className="px-0.5">
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Filter project boards..."
                  aria-label="Filter project boards"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                />
              </div>
            )}

            {/* + New Board Pill Button */}
            <div>
              {!isCreatingBoard ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingBoard(true)}
                  className="w-full flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 hover:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Project Board</span>
                </button>
              ) : (
                <form onSubmit={handleCreateBoard} className="space-y-2 rounded-lg border border-slate-700 bg-slate-900 p-2.5">
                  <input
                    type="text"
                    autoFocus
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="Board name..."
                    aria-label="New project board name"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingBoard(false);
                        setNewBoardTitle('');
                      }}
                      className="rounded px-2 py-0.5 text-[11px] text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-brand-primary px-2.5 py-0.5 text-[11px] font-semibold text-white hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      Create
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Navigation Links matching Antigravity Sidebar */}
            <div className="space-y-1 text-xs text-slate-400">
              <button
                type="button"
                aria-pressed={filterMyTasks}
                onClick={() => setFilterMyTasks((prev) => !prev)}
                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  filterMyTasks ? 'bg-slate-800/80 text-white' : 'hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>My Assigned Tasks</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {tasks.filter((t) => t.assignee === currentUser).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTeamModalError('');
                  setIsTeamModalOpen(true);
                }}
                className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left hover:bg-slate-800/40 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Team Directory</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{teamMembers.length}</span>
              </button>
            </div>

            {/* Pinned Project Boards List */}
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-semibold tracking-wide text-slate-400">
                  Pinned Boards
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {filteredSidebarBoards.length}
                </span>
              </div>

              <div className="space-y-1 max-h-[360px] overflow-y-auto pr-0.5" role="list" aria-label="Project boards">
                {filteredSidebarBoards.map((board) => {
                  const isSelected = board.id === currentBoard.id;
                  return (
                    <div
                      key={board.id}
                      role="listitem"
                      className={`group flex items-start justify-between gap-1 rounded-lg px-2 py-1.5 transition-colors ${
                        isSelected
                          ? 'bg-slate-800/90 text-white'
                          : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectBoard(board.id)}
                        aria-current={isSelected ? 'page' : undefined}
                        className="min-w-0 flex-1 text-left rounded px-0.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="text-xs font-medium truncate">{board.name}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {board.updatedAgo}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <svg className="h-3 w-3 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span className="truncate">{board.workspace}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[10px]">{board.tasks.length}</span>
                        </div>
                      </button>

                      {board.id !== 'board-main' && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteBoard(e, board.id, board.name)}
                          aria-label={`Delete board ${board.name}`}
                          title="Delete board"
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 rounded p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-800/80 p-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate font-mono">{currentUser}</span>
            <span>v1.2</span>
          </div>
        </aside>
      )}

      {/* Main Content Area (VS Code Tab Bar + Workspace) */}
      <div className="flex-1 flex flex-col min-w-0 justify-between">
        {/* VS Code-Style Multi-Board Tab Viewer Bar */}
        <div
          role="tablist"
          aria-label="Open project boards"
          className="flex items-center bg-[#0b0f19] border-b border-slate-800/90 px-2 overflow-x-auto select-none"
        >
          {/* Sidebar Open Button when collapsed */}
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-expanded={isSidebarOpen}
              aria-controls="project-boards-sidebar"
              aria-label="Expand project sidebar"
              title="Open sidebar"
              className="mr-2 rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
                <line x1="9" y1="4" x2="9" y2="20" strokeWidth="1.8" />
              </svg>
            </button>
          )}

          {openTabIds.map((tabId, idx) => {
            const tabBoard = allBoards.find((b) => b.id === tabId);
            if (!tabBoard) return null;
            const isTabActive = tabBoard.id === currentBoard.id;

            return (
              <div
                key={tabBoard.id}
                className={`group flex items-center border-r border-slate-800/90 text-xs transition-colors shrink-0 ${
                  isTabActive
                    ? 'bg-surface-page text-white border-t-2 border-t-indigo-500 font-medium'
                    : 'bg-[#0b0f19] text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border-t-2 border-t-transparent'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isTabActive}
                  onClick={() => handleSelectBoard(tabBoard.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      const nextId = openTabIds[(idx + 1) % openTabIds.length];
                      handleSelectBoard(nextId);
                    } else if (e.key === 'ArrowLeft') {
                      const prevId = openTabIds[(idx - 1 + openTabIds.length) % openTabIds.length];
                      handleSelectBoard(prevId);
                    }
                  }}
                  className="flex items-center gap-2 pl-3.5 pr-1.5 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400"
                >
                  <svg
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isTabActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="max-w-[160px] truncate">{tabBoard.name}</span>
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                    {tabBoard.tasks.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCloseTab(e, tabBoard.id)}
                  aria-label={`Close ${tabBoard.name} tab`}
                  title="Close tab"
                  className="mr-2 rounded p-0.5 text-slate-400 hover:bg-slate-700/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}

          {/* + Quick New Board Tab Button */}
          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(true);
              setIsCreatingBoard(true);
            }}
            aria-label="Open or create a new project board tab"
            title="New project board tab"
            className="ml-1.5 rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Workspace Container */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <div className="mx-auto max-w-7xl w-full space-y-6">
            {/* Header with Left Title, Center Live Clock, and Right Controls */}
            <header
              role="banner"
              className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-5"
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
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-50 flex items-center">
                        VibeTracker
                      </h1>
                      <span className="rounded-md bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 text-xs font-medium text-indigo-300">
                        {currentBoard.name}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Team workspace · 4-stage flow · Prompt-native project tracker
                </p>
              </div>

              {/* Center Live Clock Display */}
              <div
                aria-label={`Current local time ${formattedClockTime}, ${formattedClockDate}`}
                className="flex items-center gap-2.5 self-start lg:self-center rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 shadow-inner"
              >
                <svg
                  className="h-4 w-4 text-indigo-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-mono text-sm font-semibold tracking-wider text-slate-100">
                  {formattedClockTime}
                </span>
                <span className="text-slate-600" aria-hidden="true">|</span>
                <span className="text-xs font-medium text-slate-400">
                  {formattedClockDate}
                </span>
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
              className="outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) e.preventDefault();
              }}
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
                          placeholder="sam.patel@workspace.dev"
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
        </div>

        {/* Footer Navigation */}
        <footer
          role="contentinfo"
          className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 mt-6 pt-4 pb-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-300">VibeTracker</span>
            <span aria-hidden="true">·</span>
            <span>Prompt-Native Sprint Workspace</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
