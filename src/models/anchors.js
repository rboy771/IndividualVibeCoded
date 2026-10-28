/**
 * Anchor Model & Deliverable Specifications (Milestone 11: project-deliverables)
 *
 * Defines the 4 final project deliverables pinned above the Kanban board:
 * 1. Presentation (Slides URL, status)
 * 2. Demo (Live App URL, status)
 * 3. Report (PDF / Doc URL, status)
 * 4. Documentation (Readme URL, status)
 */

/**
 * @typedef {'pending' | 'in-progress' | 'ready'} AnchorStatus
 *
 * @typedef {Object} Anchor
 * @property {'presentation' | 'demo' | 'report' | 'documentation'} id
 * @property {string} label
 * @property {string} category
 * @property {string} icon
 * @property {string} url
 * @property {AnchorStatus} status
 * @property {string | null} lastUpdated ISO timestamp
 */

export const ANCHOR_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'slate' },
  { id: 'in-progress', label: 'In Progress', color: 'amber' },
  { id: 'ready', label: 'Ready', color: 'emerald' },
];

/**
 * Visual styling and metadata for each anchor deliverable.
 */
export const ANCHOR_CONFIG = {
  presentation: {
    id: 'presentation',
    label: 'Presentation',
    subtitle: 'Slides & Pitch Deck',
    icon: '📽️',
    placeholder: 'https://slides.google.com/presentation/d/...',
    accentColor: 'indigo',
    borderClass: 'border-indigo-500/30 hover:border-indigo-500/60',
    bgGradient: 'from-indigo-950/30 via-slate-900/60 to-slate-900',
    iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    badgeClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    glowClass: 'hover:shadow-[0_0_25px_rgba(99,102,241,0.18)]',
  },
  demo: {
    id: 'demo',
    label: 'Demo',
    subtitle: 'Live App Deployment',
    icon: '⚡',
    placeholder: 'https://your-app.vercel.app',
    accentColor: 'emerald',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
    bgGradient: 'from-emerald-950/30 via-slate-900/60 to-slate-900',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    glowClass: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.18)]',
  },
  report: {
    id: 'report',
    label: 'Report',
    subtitle: 'Project Write-up & PDF',
    icon: '📄',
    placeholder: 'https://docs.google.com/document/d/...',
    accentColor: 'amber',
    borderClass: 'border-amber-500/30 hover:border-amber-500/60',
    bgGradient: 'from-amber-950/30 via-slate-900/60 to-slate-900',
    iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    glowClass: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.18)]',
  },
  documentation: {
    id: 'documentation',
    label: 'Documentation',
    subtitle: 'Architecture & Readme',
    icon: '📚',
    placeholder: 'https://github.com/user/repo#readme',
    accentColor: 'cyan',
    borderClass: 'border-cyan-500/30 hover:border-cyan-500/60',
    bgGradient: 'from-cyan-950/30 via-slate-900/60 to-slate-900',
    iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
    badgeClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    glowClass: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.18)]',
  },
};

/**
 * Clean slate initial 4 anchors
 */
export const INITIAL_ANCHORS = [
  {
    id: 'presentation',
    label: 'Presentation',
    category: 'Slides & Pitch Deck',
    icon: '📽️',
    url: '',
    status: 'pending',
    lastUpdated: null,
  },
  {
    id: 'demo',
    label: 'Demo',
    category: 'Live App Deployment',
    icon: '⚡',
    url: 'https://individual-vibe-coded.vercel.app',
    status: 'ready',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'report',
    label: 'Report',
    category: 'Project Write-up & PDF',
    icon: '📄',
    url: '',
    status: 'pending',
    lastUpdated: null,
  },
  {
    id: 'documentation',
    label: 'Documentation',
    category: 'Architecture & Readme',
    icon: '📚',
    url: 'https://docs.workspace.dev/vibetracker',
    status: 'ready',
    lastUpdated: new Date().toISOString(),
  },
];

/**
 * Returns clean demo anchors
 */
export function getDemoAnchors() {
  return [
    {
      id: 'presentation',
      label: 'Presentation',
      category: 'Slides & Pitch Deck',
      icon: '📽️',
      url: '',
      status: 'pending',
      lastUpdated: null,
    },
    {
      id: 'demo',
      label: 'Demo',
      category: 'Live App Deployment',
      icon: '⚡',
      url: 'https://individual-vibe-coded.vercel.app',
      status: 'ready',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'report',
      label: 'Report',
      category: 'Project Write-up & PDF',
      icon: '📄',
      url: '',
      status: 'pending',
      lastUpdated: null,
    },
    {
      id: 'documentation',
      label: 'Documentation',
      category: 'Architecture & Readme',
      icon: '📚',
      url: 'https://docs.workspace.dev/vibetracker',
      status: 'ready',
      lastUpdated: new Date().toISOString(),
    },
  ];
}

export function formatAnchorUpdated(isoString) {
  if (!isoString) return 'Not yet updated';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffMin < 1) return 'Updated just now';
    if (diffMin < 60) return `Updated ${diffMin}m ago`;
    if (diffHr < 24) return `Updated ${diffHr}h ago`;
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently updated';
  }
}

export function formatDisplayUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    const urlObj = new URL(rawUrl);
    let display = urlObj.hostname.replace(/^www\./, '') + urlObj.pathname;
    if (display.endsWith('/')) display = display.slice(0, -1);
    if (display.length > 28) {
      display = display.slice(0, 25) + '...';
    }
    return display;
  } catch {
    return rawUrl.length > 28 ? rawUrl.slice(0, 25) + '...' : rawUrl;
  }
}
