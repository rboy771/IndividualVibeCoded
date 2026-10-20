/**
 * Anchor Model & Deliverable Specifications (Milestone 11)
 *
 * Defines the 4 final project deliverables pinned above the Kanban board:
 * 1. Presentation (Slides URL, status, lastUpdated)
 * 2. Demo (Live App / Vercel URL, status, lastUpdated)
 * 3. Report (PDF / Google Doc URL, status, lastUpdated)
 * 4. Documentation (Readme / Architecture Doc URL, status, lastUpdated)
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
 * @property {string} [notes]
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
    placeholder: 'https://vibetracker.vercel.app',
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
    placeholder: 'https://github.com/org/repo#readme',
    accentColor: 'sky',
    borderClass: 'border-sky-500/30 hover:border-sky-500/60',
    bgGradient: 'from-sky-950/30 via-slate-900/60 to-slate-900',
    iconBg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
    badgeClass: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    glowClass: 'hover:shadow-[0_0_25px_rgba(14,165,233,0.18)]',
  },
};

/**
 * Initial 4 anchors seed data
 */
export const INITIAL_ANCHORS = [
  {
    id: 'presentation',
    label: 'Presentation',
    category: 'Slides & Pitch Deck',
    icon: '📽️',
    url: '',
    status: 'in-progress',
    notes: 'Final pitch deck covering problem, solution, AI prompt logs, and demo.',
    lastUpdated: '2026-10-20T10:15:00.000Z',
  },
  {
    id: 'demo',
    label: 'Demo',
    category: 'Live App Deployment',
    icon: '⚡',
    url: 'https://vibetracker.vercel.app',
    status: 'ready',
    notes: 'Production Vercel deployment for live hackathon demonstration.',
    lastUpdated: '2026-10-20T12:30:00.000Z',
  },
  {
    id: 'report',
    label: 'Report',
    category: 'Project Write-up & PDF',
    icon: '📄',
    url: '',
    status: 'pending',
    notes: 'Module 5 final project report detailing architecture and team retrospectives.',
    lastUpdated: null,
  },
  {
    id: 'documentation',
    label: 'Documentation',
    category: 'Architecture & Readme',
    icon: '📚',
    url: 'https://github.com/c24034652/Individualhackathon#readme',
    status: 'ready',
    notes: 'Comprehensive README, milestone specs, and design system documentation.',
    lastUpdated: '2026-10-20T13:45:00.000Z',
  },
];

/**
 * Format relative time from an ISO timestamp
 * @param {string | null} isoString
 * @returns {string}
 */
export function formatAnchorUpdated(isoString) {
  if (!isoString) return 'Not yet updated';

  try {
    const updated = new Date(isoString);
    if (isNaN(updated.getTime())) return 'Not yet updated';

    const now = new Date();
    const diffMs = now - updated;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Updated just now';
    if (diffMin < 60) return `Updated ${diffMin}m ago`;
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 7) return `Updated ${diffDays}d ago`;

    return `Updated ${updated.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })}`;
  } catch {
    return 'Not yet updated';
  }
}

/**
 * Format a URL for concise display
 * @param {string} url
 * @returns {string}
 */
export function formatDisplayUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname === '/' ? '' : parsed.pathname;
    const full = `${host}${pathname}`;
    return full.length > 28 ? `${full.slice(0, 26)}…` : full;
  } catch {
    return url.length > 28 ? `${url.slice(0, 26)}…` : url;
  }
}
