import React, { useState, useEffect } from 'react';
import {
  PROMPT_TEMPLATES,
  TARGET_MODELS,
  synthesizeOptimizedPrompt,
} from '../utils/promptOptimizer';
import { copyTextToClipboard } from '../utils/contextHelper';
import { vibeAudio } from '../utils/vibeAudio';

/**
 * PromptOptimizerModal Component (Milestone 12: secret-sauce)
 *
 * "AI Prompt Optimizer & Vibe Synthesizer"
 * - Selects from specialized persona templates (Feature Architect, Debug Specialist, Speed Run, TDD, Clean Refactor)
 * - Synthesizes task specifications, state, and briefing into an ultra-high-context prompt
 * - Injects architectural rules, negative constraints, and strict verification protocols
 * - Allows 1-click clipboard copying and 1-click direct injection into task context
 */
export default function PromptOptimizerModal({
  isOpen,
  task,
  tasks = [],
  onClose,
  onApplyContext,
  onToast,
  onPromptCopied,
}) {
  const [selectedTaskId, setSelectedTaskId] = useState(task?.id || (tasks[0]?.id || ''));
  const [templateId, setTemplateId] = useState(task?.type === 'bug' ? 'debug_specialist' : 'feature_architect');
  const [targetModelId, setTargetModelId] = useState('claude');
  const [includeArchitecture, setIncludeArchitecture] = useState(true);
  const [includeConstraints, setIncludeConstraints] = useState(true);
  const [customDirective, setCustomDirective] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Sync when task changes or modal opens
  useEffect(() => {
    if (task && task.id) {
      setSelectedTaskId(task.id);
      if (task.type === 'bug') {
        setTemplateId('debug_specialist');
      }
    } else if (tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
    setIsCopied(false);
    setIsApplied(false);
  }, [task, isOpen, tasks]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Active task object
  const activeTask = tasks.find((t) => t.id === selectedTaskId) || task || {
    title: 'Freeform Vibecoding Session',
    description: 'Build a high-velocity feature with clean architecture.',
    type: 'feature',
    status: 'in-progress',
    assignee: 'Teammate A',
    dueDate: null,
    context: '',
  };

  // Generate real-time synthesized prompt
  const synthesizedPrompt = synthesizeOptimizedPrompt({
    task: activeTask,
    templateId,
    targetModelId,
    includeArchitecture,
    includeConstraints,
    customDirective,
  });

  const activeTemplate = PROMPT_TEMPLATES.find((t) => t.id === templateId) || PROMPT_TEMPLATES[0];
  const activeModel = TARGET_MODELS.find((m) => m.id === targetModelId) || TARGET_MODELS[0];

  const handleCopyPrompt = async () => {
    const success = await copyTextToClipboard(synthesizedPrompt);
    if (success) {
      setIsCopied(true);
      vibeAudio.playPromptCopy();
      if (onPromptCopied) onPromptCopied();
      if (onToast) {
        onToast(`✨ Synthesized prompt copied for ${activeModel.name}!`);
      }
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleApplyToTask = () => {
    if (!activeTask || !activeTask.id) return;

    if (onApplyContext) {
      onApplyContext(activeTask.id, synthesizedPrompt, activeModel.toolTag);
    }

    setIsApplied(true);
    vibeAudio.playSynthesize();
    if (onToast) {
      onToast(`✨ Enhanced briefing applied to "${activeTask.title}"!`);
    }
    setTimeout(() => setIsApplied(false), 2500);
  };

  const handleTemplateSelect = (id) => {
    setTemplateId(id);
    vibeAudio.playToggle();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-indigo-500/40 bg-surface-card p-5 sm:p-6 shadow-2xl transition-all relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="synthesizer-headline"
      >
        {/* Glow orb */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-brand-primary/20 blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 relative">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent text-white shadow-lg shadow-brand-primary/30">
              <span className="text-xl">✨</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="synthesizer-headline" className="text-lg font-bold text-text-primary tracking-tight">
                  AI Prompt Optimizer & Vibe Synthesizer
                </h2>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-300 border border-indigo-500/30">
                  M12 Secret Sauce
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Inject persona roles, PRD architectural rules, and quality constraints with 1-click
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700/60 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body: Two-Column Responsive Layout */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto pr-1">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Task Selector */}
            {tasks.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Task
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => {
                    setSelectedTaskId(e.target.value);
                    const sel = tasks.find(t => t.id === e.target.value);
                    if (sel && sel.type === 'bug') {
                      setTemplateId('debug_specialist');
                    }
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer truncate"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.type.toUpperCase()}] {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Template Persona Selector Cards */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Select Prompt Persona
              </label>
              <div className="space-y-2">
                {PROMPT_TEMPLATES.map((tmpl) => {
                  const isSelected = tmpl.id === templateId;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleTemplateSelect(tmpl.id)}
                      className={`cursor-pointer rounded-xl border p-2.5 transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/15 shadow-sm ring-1 ring-indigo-500/50'
                          : 'border-slate-700/70 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-xl mt-0.5 shrink-0">{tmpl.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                            {tmpl.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target AI Tool Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target AI Model / Tool
              </label>
              <select
                value={targetModelId}
                onChange={(e) => setTargetModelId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
              >
                {TARGET_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Guardrail Toggles */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeArchitecture}
                  onChange={(e) => setIncludeArchitecture(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                />
                <span>Include Project Architecture (React, Vite, Slate-900)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeConstraints}
                  onChange={(e) => setIncludeConstraints(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                />
                <span>Include Strict Output Constraints (zero regressions)</span>
              </label>
            </div>

            {/* Custom Directive Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Custom Directive <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={customDirective}
                onChange={(e) => setCustomDirective(e.target.value)}
                placeholder="e.g. Prioritize keyboard accessibility, use KaTeX..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-text-primary placeholder-slate-500 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Prompt Preview Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[360px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Synthesized Prompt Preview
                </span>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  Ready for {activeModel.toolTag}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {synthesizedPrompt.length} chars
              </span>
            </div>

            {/* Markdown Prompt Code Block */}
            <div className="mt-2.5 flex-1 rounded-xl border border-slate-700/80 bg-slate-950 p-3.5 font-mono text-xs text-slate-200 overflow-y-auto max-h-[380px] shadow-inner select-text leading-relaxed whitespace-pre-wrap">
              {synthesizedPrompt}
            </div>

            {/* Prompt Actions */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {activeTask && activeTask.id && (
                  <button
                    type="button"
                    onClick={handleApplyToTask}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all border ${
                      isApplied
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40 hover:bg-indigo-500/30 hover:text-white'
                    }`}
                    title="Write this synthesized briefing directly into the task's context field"
                  >
                    <span>{isApplied ? '✓' : '📥'}</span>
                    <span>{isApplied ? 'Applied to Task!' : 'Apply to Task Briefing'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-lg transition-all ${
                    isCopied
                      ? 'bg-emerald-600 shadow-emerald-500/30 ring-2 ring-emerald-400'
                      : 'bg-gradient-to-r from-brand-primary to-brand-accent shadow-brand-primary/30 hover:brightness-110 focus:ring-2 focus:ring-brand-accent'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Copy Optimized Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
