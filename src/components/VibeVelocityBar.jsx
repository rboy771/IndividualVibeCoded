import React, { useState } from 'react';

/**
 * VibeVelocityBar Component (Milestone 12: secret-sauce)
 *
 * Real-time Flow Analytics & Vibe Velocity Widget:
 * - Dynamic Vibe Level / Flow Velocity calculation
 * - Visual neon shimmer glow meter with animated sparkles
 * - Real-time metrics: Tasks in Flow, AI Prompt Coverage, Prompts Generated, Momentum Multiplier
 * - 1-Click Audio Sound Effects toggle (Vibe Sounds)
 * - 1-Click AI Prompt Optimizer & Vibe Synthesizer launcher
 * - Expandable Flow Diagnostics breakdown
 */
export default function VibeVelocityBar({
  tasks = [],
  anchors = [],
  soundEnabled = true,
  onToggleSound,
  onOpenOptimizer,
  copiedCount = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute live flow metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inFlowTasks = tasks.filter((t) => t.status === 'in-progress' || t.status === 'review').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const tasksWithContext = tasks.filter((t) => t.context && t.context.trim().length > 0).length;
  const readyAnchors = anchors.filter((a) => a.status === 'ready').length;

  const contextCoveragePct = totalTasks > 0 ? Math.round((tasksWithContext / totalTasks) * 100) : 0;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Calculate dynamic Vibe Velocity Score (0 - 100)
  // Higher weight given to active in-flow momentum + AI context coverage + deliverable readiness
  let calculatedScore = 50;
  if (totalTasks > 0) {
    const flowRatio = inFlowTasks / totalTasks;
    const doneRatio = doneTasks / totalTasks;
    const contextRatio = tasksWithContext / totalTasks;
    const anchorRatio = anchors.length > 0 ? readyAnchors / anchors.length : 0;

    // Composite algorithm: base 40 + in-flow (30%) + done (15%) + context (25%) + anchors (15%)
    const raw = 35 + flowRatio * 35 + doneRatio * 20 + contextRatio * 25 + anchorRatio * 15;
    calculatedScore = Math.min(99, Math.max(25, Math.round(raw)));
  }

  // Momentum multiplier calculation (e.g. 1.2x to 5.0x)
  const momentumMultiplier = (1 + (inFlowTasks * 0.4) + (tasksWithContext * 0.25) + (readyAnchors * 0.5)).toFixed(1);

  // Vibe State Title & Tone
  let vibeLabel = '🌱 Warming Up';
  let vibeGlowColor = 'from-slate-500 to-indigo-500';
  let badgeBorder = 'border-slate-500/40 text-slate-300';

  if (calculatedScore >= 90) {
    vibeLabel = '⚡ Hyperfocus';
    vibeGlowColor = 'from-indigo-500 via-purple-500 to-cyan-400';
    badgeBorder = 'border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.35)]';
  } else if (calculatedScore >= 75) {
    vibeLabel = '🔥 High Momentum';
    vibeGlowColor = 'from-indigo-500 via-purple-500 to-pink-500';
    badgeBorder = 'border-purple-400/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
  } else if (calculatedScore >= 60) {
    vibeLabel = '🌊 Steady Flow';
    vibeGlowColor = 'from-blue-500 to-indigo-500';
    badgeBorder = 'border-indigo-400/50 text-indigo-300';
  }

  // Teammate breakdown for expandable drawer
  const teammateCounts = tasks.reduce((acc, t) => {
    const name = t.assignee || 'Unassigned';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mb-6 rounded-xl border border-slate-700/80 bg-gradient-to-b from-slate-900/90 to-surface-card p-4 shadow-xl backdrop-blur relative overflow-hidden transition-all">
      {/* Decorative neon ambient background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl" />

      {/* Main Bar: Top Row */}
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side: Vibe Velocity Score & Live Meter */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Neon Animated Icon Orb */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary/30 to-brand-accent/30 border border-brand-primary/40 shadow-inner">
            <span className="text-xl animate-pulse">⚡</span>
            {/* Spinning orbital sparkle */}
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 opacity-30 blur-sm animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Vibe Velocity
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold tracking-tight border bg-slate-950/70 transition-all ${badgeBorder}`}
              >
                <span>{vibeLabel}</span>
                <span className="text-white font-extrabold">{calculatedScore}%</span>
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Live cognitive flow & AI context density meter
            </p>
          </div>
        </div>

        {/* Center / Stats Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Tasks in Flow */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5" title="Tasks currently in Progress or Review">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-400">In Flow:</span>
            <span className="font-mono font-semibold text-amber-300">{inFlowTasks}</span>
          </div>

          {/* AI Context Coverage */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5" title="Percentage of tasks with AI prompt context briefings">
            <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-slate-400">AI Briefed:</span>
            <span className="font-mono font-semibold text-indigo-300">{contextCoveragePct}%</span>
          </div>

          {/* Sprint Momentum */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5" title="Sprint velocity multiplier">
            <span className="text-xs">🚀</span>
            <span className="text-slate-400">Momentum:</span>
            <span className="font-mono font-semibold text-emerald-300">{momentumMultiplier}x</span>
          </div>

          {/* Prompts Generated */}
          {copiedCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5" title="AI Prompts Copied & Synthesized">
              <span className="text-xs">✨</span>
              <span className="text-cyan-300 font-mono font-semibold">{copiedCount} Prompts</span>
            </div>
          )}
        </div>

        {/* Right Side: Quick Action Triggers */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle (Feature 3) */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
              soundEnabled
                ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25'
                : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Vibe Audio: Enabled (Click to Mute)' : 'Vibe Audio: Muted (Click to Unmute)'}
            aria-label="Toggle Vibe Audio Feedback"
          >
            {soundEnabled ? (
              <>
                <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="hidden sm:inline font-mono text-[11px]">Audio ON</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <span className="hidden sm:inline font-mono text-[11px]">Muted</span>
              </>
            )}
          </button>

          {/* AI Prompt Synthesizer Hero Button (Feature 2) */}
          <button
            type="button"
            onClick={onOpenOptimizer}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-primary to-brand-accent px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand-primary/20 transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            title="Open AI Prompt Optimizer & Vibe Synthesizer"
          >
            <span>✨</span>
            <span className="hidden sm:inline">Vibe Synthesizer</span>
            <span className="sm:hidden">Optimize</span>
          </button>

          {/* Detailed Analytics Accordion Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg border border-slate-700/80 bg-slate-900/60 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Toggle Detailed Flow Diagnostics"
            aria-label="Toggle Detailed Flow Diagnostics"
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Neon Glow Bar */}
      <div className="relative mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-950/80 border border-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${vibeGlowColor} transition-all duration-500 ease-out relative`}
          style={{ width: `${calculatedScore}%` }}
        >
          {/* Shimmer light sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {/* Expandable Flow Diagnostics Panel */}
      {isExpanded && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
          {/* Column 1: Task Pipeline Flow */}
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Task Pipeline Health</span>
              <span className="text-[10px] text-text-muted font-mono">{completionPct}% finished</span>
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>To Do</span>
                <span className="font-mono text-slate-300">{todoTasks}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>In Progress</span>
                <span className="font-mono text-amber-300 font-semibold">{tasks.filter(t => t.status === 'in-progress').length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>In Review</span>
                <span className="font-mono text-indigo-300 font-semibold">{tasks.filter(t => t.status === 'review').length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Completed</span>
                <span className="font-mono text-emerald-400 font-semibold">{doneTasks}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Teammate Load Distribution */}
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <h4 className="font-semibold text-slate-300 mb-2">Teammate Active Focus</h4>
            <div className="space-y-1.5">
              {Object.entries(teammateCounts).map(([name, count]) => (
                <div key={name} className="flex justify-between text-slate-400">
                  <span className="truncate pr-2">{name}</span>
                  <span className="font-mono text-slate-300">{count} tasks</span>
                </div>
              ))}
              {Object.keys(teammateCounts).length === 0 && (
                <p className="text-slate-500 italic">No tasks assigned yet</p>
              )}
            </div>
          </div>

          {/* Column 3: Vibecoding Best Practices */}
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <span>💡 Flow Tip</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Keep prompts ultra-focused! Use the <span className="text-brand-accent font-medium">✨ Vibe Synthesizer</span> to inject constraints, persona roles, and repo design tokens before prompting Claude or Cursor.
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Submission Anchors:</span>
              <span className="font-mono font-bold text-cyan-300">{readyAnchors} of {anchors.length} Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
