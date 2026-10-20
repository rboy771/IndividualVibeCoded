import React, { useState, useEffect } from 'react';
import {
  ANCHOR_CONFIG,
  ANCHOR_STATUSES,
  formatAnchorUpdated,
  formatDisplayUrl,
} from '../models/anchors';

/**
 * AnchorBoard Component (Milestone 11)
 *
 * Pinned above the Kanban board, this component tracks the 4 primary project
 * deliverables required for hackathon submission:
 * 1. 📽️ Presentation (Slides URL)
 * 2. ⚡ Demo (Live App / Vercel URL)
 * 3. 📄 Report (PDF / Google Doc URL)
 * 4. 📚 Documentation (Readme / Architecture Doc URL)
 *
 * Each card displays:
 * - Deliverable title & category subtitle
 * - Distinctive theme colors & iconography
 * - Current deliverable status pill badge ('Pending', 'In Progress', 'Ready')
 * - Interactive clickable link (opens in new tab) or "+ Add link" prompt
 * - Last updated relative timestamp
 * - Edit trigger for updating the link, status, and notes
 */
export default function AnchorBoard({ anchors, onUpdateAnchor, onToast }) {
  const [editingAnchor, setEditingAnchor] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Edit modal form state
  const [formUrl, setFormUrl] = useState('');
  const [formStatus, setFormStatus] = useState('pending');
  const [formNotes, setFormNotes] = useState('');
  const [urlError, setUrlError] = useState('');

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingAnchor) {
        handleCloseEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingAnchor]);

  // Calculate completion stats
  const readyCount = anchors.filter((a) => a.status === 'ready').length;
  const inProgressCount = anchors.filter((a) => a.status === 'in-progress').length;
  const totalCount = anchors.length;
  const percentComplete = Math.round((readyCount / totalCount) * 100);

  const handleOpenEdit = (anchor, e) => {
    if (e) e.stopPropagation();
    setEditingAnchor(anchor);
    setFormUrl(anchor.url || '');
    setFormStatus(anchor.status || 'pending');
    setFormNotes(anchor.notes || '');
    setUrlError('');
  };

  const handleCloseEdit = () => {
    setEditingAnchor(null);
    setUrlError('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();

    let cleanUrl = formUrl.trim();
    if (cleanUrl) {
      // Auto-prefix protocol if missing for user convenience
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `https://${cleanUrl}`;
      }
      try {
        new URL(cleanUrl);
      } catch {
        setUrlError('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
    }

    const updated = {
      ...editingAnchor,
      url: cleanUrl,
      status: formStatus,
      notes: formNotes.trim(),
      lastUpdated: new Date().toISOString(),
    };

    onUpdateAnchor(updated);
    if (onToast) {
      onToast(`Anchor "${updated.label}" updated.`);
    }
    handleCloseEdit();
  };

  const handleCopyLink = async (anchor, e) => {
    e.stopPropagation();
    if (!anchor.url) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(anchor.url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = anchor.url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedId(anchor.id);
      setTimeout(() => setCopiedId(null), 2000);
      if (onToast) {
        onToast(`Copied ${anchor.label} link to clipboard.`);
      }
    } catch {
      if (onToast) {
        onToast('Unable to copy link.');
      }
    }
  };

  return (
    <section aria-labelledby="anchor-board-title" className="mb-8">
      {/* Anchor Section Header & Progress Metric */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-accent/20 text-brand-accent border border-brand-accent/30 text-xs">
            ⚓
          </span>
          <h2 id="anchor-board-title" className="text-sm font-semibold tracking-wide uppercase text-slate-200">
            Project Deliverables
          </h2>
          <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] font-mono text-slate-400 border border-slate-700/60">
            {readyCount}/{totalCount} Ready
          </span>
        </div>

        {/* Deliverable Readiness Bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>{readyCount} Ready</span>
            <span className="text-slate-600">·</span>
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            <span>{inProgressCount} In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-28 sm:w-36 overflow-hidden rounded-full bg-slate-800 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-brand-primary via-indigo-400 to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="font-mono text-xs font-semibold text-slate-300">
              {percentComplete}%
            </span>
          </div>
        </div>
      </div>

      {/* 4 Sleek Anchor Deliverable Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {anchors.map((anchor) => {
          const config = ANCHOR_CONFIG[anchor.id] || ANCHOR_CONFIG.presentation;
          const isCopied = copiedId === anchor.id;

          return (
            <div
              key={anchor.id}
              onClick={(e) => handleOpenEdit(anchor, e)}
              className={`group relative flex flex-col justify-between rounded-xl border bg-gradient-to-b ${config.bgGradient} p-4 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${config.borderClass} ${config.glowClass} shadow-card`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenEdit(anchor, e);
                }
              }}
              aria-label={`Edit ${anchor.label} deliverable`}
            >
              {/* Card Header: Icon, Label, and Status Pill Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg ${config.iconBg}`}
                    >
                      {config.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                        {anchor.label}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {config.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border ${
                      anchor.status === 'ready'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : anchor.status === 'in-progress'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        anchor.status === 'ready'
                          ? 'bg-emerald-400 animate-pulse'
                          : anchor.status === 'in-progress'
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                    />
                    {anchor.status === 'ready'
                      ? 'Ready'
                      : anchor.status === 'in-progress'
                      ? 'In Progress'
                      : 'Pending'}
                  </span>
                </div>

                {/* Optional Note / Summary */}
                {anchor.notes && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-1 italic">
                    "{anchor.notes}"
                  </p>
                )}
              </div>

              {/* Card Middle: URL Section */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                {anchor.url ? (
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={anchor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="group/link flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors truncate max-w-[80%]"
                      title={anchor.url}
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover/link:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span className="truncate underline decoration-slate-600 underline-offset-2 group-hover/link:decoration-indigo-400">
                        {formatDisplayUrl(anchor.url)}
                      </span>
                    </a>

                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(anchor, e)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(anchor, e)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-700/80 bg-slate-800/40 py-1.5 text-xs font-medium text-slate-400 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-slate-200"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add deliverable URL</span>
                  </button>
                )}
              </div>

              {/* Card Footer: Last Updated & Edit Button */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono">
                  {formatAnchorUpdated(anchor.lastUpdated)}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(anchor, e)}
                  className="rounded px-1.5 py-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  Edit ✎
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Anchor Deliverable Edit Modal */}
      {editingAnchor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="anchor-modal-title"
          onClick={handleCloseEdit}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-surface-card p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-700/80 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl ${
                    ANCHOR_CONFIG[editingAnchor.id]?.iconBg || 'bg-slate-800'
                  }`}
                >
                  {ANCHOR_CONFIG[editingAnchor.id]?.icon || '⚓'}
                </span>
                <div>
                  <h3 id="anchor-modal-title" className="text-lg font-bold text-white">
                    Edit {editingAnchor.label}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {ANCHOR_CONFIG[editingAnchor.id]?.subtitle} · Final Hackathon Deliverable
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              {/* URL Input */}
              <div>
                <label
                  htmlFor="anchor-url"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Deliverable Link / URL
                </label>
                <div className="relative">
                  <input
                    id="anchor-url"
                    type="text"
                    value={formUrl}
                    onChange={(e) => {
                      setFormUrl(e.target.value);
                      if (urlError) setUrlError('');
                    }}
                    placeholder={ANCHOR_CONFIG[editingAnchor.id]?.placeholder || 'https://...'}
                    className={`w-full rounded-lg border bg-slate-900 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                      urlError ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {formUrl && (
                    <button
                      type="button"
                      onClick={() => setFormUrl('')}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                      title="Clear URL"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {urlError ? (
                  <p className="mt-1 text-xs text-red-400">{urlError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Paste the published link (Google Slides, Vercel app, Doc, or GitHub Readme).
                  </p>
                )}
              </div>

              {/* Status Segmented Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Deliverable Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ANCHOR_STATUSES.map((status) => {
                    const isSelected = formStatus === status.id;
                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setFormStatus(status.id)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? status.id === 'ready'
                              ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                              : status.id === 'in-progress'
                              ? 'border-amber-500/60 bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                              : 'border-slate-500/60 bg-slate-700/60 text-slate-200 font-semibold shadow-sm'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            status.id === 'ready'
                              ? 'bg-emerald-400'
                              : status.id === 'in-progress'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                        />
                        {status.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes / Context */}
              <div>
                <label
                  htmlFor="anchor-notes"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Deliverable Notes (Optional)
                </label>
                <textarea
                  id="anchor-notes"
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes, version tags, or presentation tips for the team..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
