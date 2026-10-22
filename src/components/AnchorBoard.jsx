import React, { useState, useEffect } from 'react';
import {
  ANCHOR_CONFIG,
  ANCHOR_STATUSES,
  formatAnchorUpdated,
  formatDisplayUrl,
} from '../models/anchors';
import { useFocusTrap } from '../utils/useFocusTrap';

/**
 * AnchorBoard Component (Milestone 11)
 *
 * Pinned above the Kanban board, this component tracks the 4 primary project
 * deliverables required for hackathon submission with full WCAG 2.1 AA accessibility:
 * - Semantic landmarks & progressbar ARIA
 * - High contrast focus indicators
 * - Trapped focus & Escape key in edit modal
 * - Descriptive icon labels and colorblind indicators
 */
export default function AnchorBoard({ anchors, onUpdateAnchor, onToast }) {
  const [editingAnchor, setEditingAnchor] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Edit modal form state
  const [formUrl, setFormUrl] = useState('');
  const [formStatus, setFormStatus] = useState('pending');
  const [urlError, setUrlError] = useState('');

  // Keyboard focus trapping for edit modal
  const modalRef = useFocusTrap(Boolean(editingAnchor), {
    initialFocusSelector: '#anchor-url',
  });

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
  const percentComplete = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  const handleOpenEdit = (anchor, e) => {
    if (e) e.stopPropagation();
    setEditingAnchor(anchor);
    setFormUrl(anchor.url || '');
    setFormStatus(anchor.status || 'pending');
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
    <section
      role="region"
      aria-labelledby="anchor-board-title"
      className="mb-8"
    >
      {/* Anchor Section Header & Progress Metric */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-accent/20 text-brand-accent border border-brand-accent/30 text-xs"
            aria-hidden="true"
          >
            ⚓
          </span>
          <h2 id="anchor-board-title" className="text-sm font-semibold tracking-wide uppercase text-slate-200">
            Deliverables Anchor Board
          </h2>
          <span
            className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-700/60"
            aria-label={`${readyCount} of ${totalCount} deliverables ready`}
          >
            {readyCount}/{totalCount} Ready
          </span>
        </div>

        {/* Deliverable Readiness Bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span>{readyCount} Ready</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
            <span>{inProgressCount} In Progress</span>
          </div>
          <div
            className="flex items-center gap-2"
            role="progressbar"
            aria-valuenow={percentComplete}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Deliverables readiness progress"
          >
            <div className="h-2 w-28 sm:w-36 overflow-hidden rounded-full bg-slate-800 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-brand-primary via-indigo-400 to-emerald-400 transition-all duration-500 ease-out motion-reduce:transition-none"
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
              className={`group relative flex flex-col justify-between rounded-xl border bg-gradient-to-b ${config.bgGradient} p-4 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${config.borderClass} ${config.glowClass} shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 motion-reduce:transition-none motion-reduce:hover:transform-none`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenEdit(anchor, e);
                }
              }}
              aria-label={`Edit ${anchor.label} deliverable. Status: ${anchor.status}. ${anchor.url ? `URL: ${anchor.url}` : 'No URL provided'}`}
            >
              {/* Card Header: Icon, Label, and Status Pill Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg ${config.iconBg}`}
                      aria-hidden="true"
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
                        : 'bg-slate-700/40 text-slate-300 border-slate-600/40'
                    }`}
                    aria-label={`Status: ${anchor.status === 'ready' ? 'Ready' : anchor.status === 'in-progress' ? 'In Progress' : 'Pending'}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        anchor.status === 'ready'
                          ? 'bg-emerald-400 animate-pulse motion-reduce:animate-none'
                          : anchor.status === 'in-progress'
                          ? 'bg-amber-400'
                          : 'bg-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    {anchor.status === 'ready'
                      ? 'Ready'
                      : anchor.status === 'in-progress'
                      ? 'In Progress'
                      : 'Pending'}
                  </span>
                </div>


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
                      onKeyDown={(e) => e.stopPropagation()}
                      className="group/link flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded transition-colors truncate max-w-[80%]"
                      title={anchor.url}
                      aria-label={`Open ${anchor.label} URL in new tab: ${anchor.url}`}
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover/link:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
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
                      onKeyDown={(e) => e.stopPropagation()}
                      className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
                      title={`Copy ${anchor.label} URL`}
                      aria-label={`Copy ${anchor.label} URL to clipboard`}
                    >
                      {isCopied ? (
                        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(anchor, e)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-700/80 bg-slate-800/40 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    aria-label={`Add link for ${anchor.label} deliverable`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add deliverable URL</span>
                  </button>
                )}
              </div>

              {/* Card Footer: Last Updated & Edit Button */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">
                  {formatAnchorUpdated(anchor.lastUpdated)}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(anchor, e)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="rounded px-1.5 py-0.5 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
                  aria-label={`Edit ${anchor.label} deliverable details`}
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
            ref={modalRef}
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
                  aria-hidden="true"
                >
                  {ANCHOR_CONFIG[editingAnchor.id]?.icon || '⚓'}
                </span>
                <div>
                  <h3 id="anchor-modal-title" className="text-lg font-bold text-white">
                    Edit {editingAnchor.label}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {ANCHOR_CONFIG[editingAnchor.id]?.subtitle} · Final Hackathon Deliverable
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
                aria-label="Close edit deliverable dialog"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                    aria-invalid={Boolean(urlError)}
                    aria-describedby={urlError ? 'anchor-url-error' : 'anchor-url-help'}
                    className={`w-full rounded-lg border bg-slate-900 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                      urlError ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {formUrl && (
                    <button
                      type="button"
                      onClick={() => setFormUrl('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                      title="Clear URL"
                      aria-label="Clear URL field"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {urlError ? (
                  <p id="anchor-url-error" className="mt-1 text-xs text-red-400" role="alert">{urlError}</p>
                ) : (
                  <p id="anchor-url-help" className="mt-1 text-[11px] text-slate-400">
                    Paste the published link (Google Slides, Vercel app, Doc, or GitHub Readme).
                  </p>
                )}
              </div>

              {/* Status Segmented Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Deliverable Status
                </label>
                <div
                  role="radiogroup"
                  aria-label="Deliverable Status"
                  className="grid grid-cols-3 gap-2"
                >
                  {ANCHOR_STATUSES.map((status) => {
                    const isSelected = formStatus === status.id;
                    return (
                      <button
                        key={status.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setFormStatus(status.id)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                          isSelected
                            ? status.id === 'ready'
                              ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                              : status.id === 'in-progress'
                              ? 'border-amber-500/60 bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                              : 'border-slate-500/60 bg-slate-700/60 text-slate-200 font-semibold shadow-sm'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            status.id === 'ready'
                              ? 'bg-emerald-400'
                              : status.id === 'in-progress'
                              ? 'bg-amber-400'
                              : 'bg-slate-400'
                          }`}
                          aria-hidden="true"
                        />
                        {status.label}
                      </button>
                    );
                  })}
                </div>
              </div>



              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
