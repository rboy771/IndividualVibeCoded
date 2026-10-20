import { useState, useEffect } from 'react';
import { vibeAudio } from '../utils/vibeAudio';

/**
 * Slide definitions for the 5-Minute Pitch Presentation.
 * Tailored for Prof. Dr. Ignacio Alvarez and UXD Hackathon Judges.
 */
export const PITCH_SLIDES = [
  {
    id: 'hook',
    badge: 'Slide 1 / 5 · The Problem',
    title: 'Why Spreadsheets & Linear Fail for Vibecoding',
    subtitle: 'The Cognitive Context Gap in Modern AI-Assisted Sprints',
    icon: '🎣',
    accentColor: 'rose',
    speakerTime: '0:00 - 0:45 (45s)',
    takeaway: 'Traditional tools track "what" gets done, but vibecoders lose "how" the AI built it.',
    points: [
      {
        heading: '1. The Prompt Amnesia Trap',
        body: 'Vibecoders generate working code with LLMs in minutes, but 2 days later nobody remembers the exact prompt, constraints, or model parameters. Iteration starts from zero.',
      },
      {
        heading: '2. Tooling Overkill vs. Spreadsheets',
        body: 'Jira and Linear take hours to configure and ignore AI context entirely; Google Sheets collapse under sprint complexity with zero prompt awareness or urgency feedback.',
      },
      {
        heading: '3. Deliverable Blindness',
        body: 'Teams get lost inside micro-tasks and lose sight of the 4 core course deliverables: Slides, Live App Demo, Written Report, and Architecture Docs.',
      },
    ],
    script:
      'Good morning Prof. Alvarez and judges. Over the last 48 hours, every team here has written thousands of lines of code with LLMs. But ask any team what exact prompt generated their auth middleware or CSS grid three hours ago, and they draw a blank. That is the Prompt Amnesia Trap. Linear tracks tasks; spreadsheets track rows; but neither tracks the AI prompts that actually generate the code. That is why we built VibeTracker.',
  },
  {
    id: 'solution',
    badge: 'Slide 2 / 5 · The Solution',
    title: 'The Three Pillars of VibeTracker',
    subtitle: 'Kanban Workflow + Living Prompt Memory + Deliverable Anchors',
    icon: '💡',
    accentColor: 'indigo',
    speakerTime: '0:45 - 1:30 (45s)',
    takeaway: 'One-click context handoffs between human teammates and AI agents.',
    points: [
      {
        heading: 'Pillar 1: 4-Stage Kanban with Instant Handoff',
        body: 'Strict To Do → In Progress → Review → Done flow with 1-click assignee dropdowns and relative due date urgency tinting (Rose overdue, Amber warning, Emerald safe).',
      },
      {
        heading: 'Pillar 2: AI Context Briefing & Clipboard Serialization',
        body: 'Every task stores a dedicated AI briefing field and target tool tag (Claude, Cursor, ChatGPT). 1-click "Copy as Prompt Context" formats clean Markdown for continuation.',
      },
      {
        heading: 'Pillar 3: The Anchor Board Pinned Above the Sprint',
        body: 'Directly anchors the 4 mandatory course deliverables at the top of the viewport with live status validation, URL sanitation, and progress monitoring.',
      },
    ],
    script:
      'VibeTracker solves this with three tightly integrated pillars. First, a lightning-fast 4-stage Kanban with dynamic urgency tinting and instant hand-off dropdowns. Second, Prompt Memory: every single task carries its curated AI context briefing, serialized with one click directly into Claude, Cursor, or ChatGPT. And third, the Deliverable Anchor Board, pinning our final presentation, demo URL, report, and documentation right above the sprint so the team never loses the finish line.',
  },
  {
    id: 'demo',
    badge: 'Slide 3 / 5 · Live Walkthrough',
    title: 'The 3-Minute Live Demo Script',
    subtitle: 'Real-time Demonstration of Core Sprint Interactions',
    icon: '⚡',
    accentColor: 'emerald',
    speakerTime: '1:30 - 3:30 (120s)',
    takeaway: 'Watch tasks flow, prompt briefings serialize, and sound effects reinforce momentum.',
    demoSteps: [
      {
        step: 'Step 1: Visual Board & Dynamic Due Tints (20s)',
        action: 'Point to column layout, notice Rose overdue cards ("Web Audio chime distortion") vs Amber warning ("Synthesize AI Prompt Optimizer") vs Emerald safe cards.',
        cue: '"Notice how the cards visually scream urgency without noisy notification badges."',
      },
      {
        step: 'Step 2: Teammate Quick Handoff (20s)',
        action: 'Click the assignee avatar dropdown on any card. Select "Teammate B". Listen for the audio confirmation and toast: "Task handed off to Teammate B. Smooth sailing."',
        cue: '"Instant zero-click handoff between our three team roles."',
      },
      {
        step: 'Step 3: AI Context Briefing & Prompt Serialization (30s)',
        action: 'Open Task Modal on task-3 or task-5. Inspect the "AI Context Briefing" and target tool selector. Click "Copy as Prompt Context". Show toast and clipboard output.',
        cue: '"With one click, our entire task context, negative constraints, and history are ready to paste into Claude."',
      },
      {
        step: 'Step 4: AI Prompt Synthesizer & Personas (30s)',
        action: 'Click the "✨ AI Synthesizer" button in the header. Select the "Feature Architect" or "Debug Specialist" persona. Pick Claude 3.7. Show live prompt synthesis and inject it.',
        cue: '"Our secret sauce: structured prompt synthesis tailored to specific model strengths."',
      },
      {
        step: 'Step 5: Anchor Deliverable Completion (20s)',
        action: 'Click on the "Report" or "Presentation" deliverable anchor in the top bar. Toggle status to "Ready". Hear the victory chime and watch the progress bar leap forward.',
        cue: '"The anchor bar keeps our final deliverables front and center until the final bell rings."',
      },
    ],
    script:
      'Let me show you VibeTracker in action. First, look at our Kanban board: dynamic color tinting immediately flags overdue tasks in crimson red and upcoming deadlines in amber. When Teammate A finishes a prototype, one click on the avatar dropdown hands it off to Teammate B with immediate audio feedback. Now, open any task: here is the curated AI context. Clicking "Copy as Prompt Context" formats a complete Markdown prompt including files, constraints, and target model. And when an anchor deliverable reaches "Ready", our audio engine confirms the milestone.',
  },
  {
    id: 'secret-sauce',
    badge: 'Slide 4 / 5 · The Secret Sauce',
    title: 'Vibe Velocity & Prompt Synthesizer',
    subtitle: 'Real-Time Cognitive Flow Analytics & Model Persona Engine',
    icon: '🔮',
    accentColor: 'purple',
    speakerTime: '3:30 - 4:15 (45s)',
    takeaway: 'Gamifying sprint momentum while hardening prompt engineering quality.',
    points: [
      {
        heading: 'Vibe Velocity & Flow Analytics Bar',
        body: 'A persistent cognitive telemetry meter calculating live flow state (e.g. "Hyperfocus 94%"), prompt copies, tasks in flight, and velocity momentum multiplier with animated neon shimmer.',
      },
      {
        heading: 'AI Prompt Synthesizer with 5 Personas',
        body: 'Feature Architect, Debug Specialist, Speed Run MVP, TDD Test Engineer, and Clean Refactor. Enforces negative constraints ("Do not modify working CSS", "Zero external dependencies").',
      },
      {
        heading: 'Zero-Dependency Web Audio Micro-Sounds',
        body: 'Custom Web Audio API synthesizer generating tactile auditory cues for task moves, prompt copies, and anchor milestones, with one-click master mute control.',
      },
    ],
    script:
      'What makes VibeTracker uniquely ours is the Secret Sauce: Vibe Velocity and the AI Synthesizer. The Vibe Velocity bar computes our team flow state in real-time based on completion velocity and prompt context coverage. When we hit a blocker, the AI Synthesizer modal structures the prompt through 5 distinct persona lenses—injecting negative constraints and architecture boundaries before the prompt ever touches Claude or Cursor. Combined with our Web Audio engine, sprint momentum becomes tactile and addictive.',
  },
  {
    id: 'architecture',
    badge: 'Slide 5 / 5 · Tech & Architecture',
    title: 'Architecture & Hackathon Standards',
    subtitle: 'Zero-Backend Speed, LocalStorage Persistence, Multi-Agent Collaboration',
    icon: '🏗️',
    accentColor: 'sky',
    speakerTime: '4:15 - 5:00 (45s)',
    takeaway: 'Built according to strict PRD specifications across 13 verified milestones.',
    points: [
      {
        heading: 'Zero-Backend Architecture',
        body: 'Built on React 18, Vite 5, and Tailwind CSS. State is completely self-contained in reactive LocalStorage hooks with instantaneous zero-latency updates and 1.2s production builds.',
      },
      {
        heading: 'Synthesized Web Audio Engine',
        body: 'No bulky mp3 or wav assets. Uses pure native Web Audio API oscillators and gain envelopes for crisp, micro-latency feedback with full memory safety.',
      },
      {
        heading: 'Multi-Agent Autonomous Execution',
        body: 'Developed through 13 discrete milestones with git feature branches, atomic commits, automated build validations, and live coordination via an Obsidian Blackboard.',
      },
    ],
    script:
      'Under the hood, VibeTracker is built for maximum speed and zero operational friction: React 18, Vite, Tailwind CSS, and zero backend dependencies. Everything persists safely in LocalStorage, surviving refreshes without quota issues. The audio engine runs on pure browser Web Audio oscillators without downloading audio files. And our development process followed strict software engineering discipline: 13 isolated milestone branches, 100% build verification, and clean git history. Thank you, and we welcome your questions!',
  },
];

export default function PitchGuideModal({ isOpen, onClose, onResetDemoData, onOpenSynthesizer }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const slide = PITCH_SLIDES[currentSlideIndex];

  // 5-minute pitch countdown timer
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          vibeAudio.playAnchorComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard navigation: Left/Right arrow keys and Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlideIndex]);

  if (!isOpen) return null;

  const goToNextSlide = () => {
    if (currentSlideIndex < PITCH_SLIDES.length - 1) {
      vibeAudio.playToggle();
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      vibeAudio.playToggle();
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleSelectSlide = (idx) => {
    vibeAudio.playToggle();
    setCurrentSlideIndex(idx);
  };

  const formatTimer = (totalSec) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleCopySpeakerNotes = () => {
    vibeAudio.playPromptCopy();
    navigator.clipboard.writeText(slide.script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleResetTimer = () => {
    vibeAudio.playToggle();
    setIsTimerRunning(false);
    setTimerSeconds(300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-lg shadow-inner">
              🎙️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  5-Minute Pitch Presentation Guide
                </h2>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Judges Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prof. Dr. Ignacio Alvarez · UXD Hackathon 2026
              </p>
            </div>
          </div>

          {/* Live Pitch Countdown Timer & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* 5-Min Timer Widget */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 shadow-sm">
              <span className="text-xs text-slate-400 font-mono">⏱️</span>
              <span
                className={`font-mono text-sm font-bold ${
                  timerSeconds < 60
                    ? 'text-rose-400 animate-pulse'
                    : timerSeconds < 120
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {formatTimer(timerSeconds)}
              </span>
              <button
                type="button"
                onClick={() => {
                  vibeAudio.playToggle();
                  setIsTimerRunning((prev) => !prev);
                }}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                type="button"
                onClick={handleResetTimer}
                className="text-slate-500 hover:text-slate-300 text-xs px-1"
                title="Reset timer to 5:00"
              >
                ↺
              </button>
            </div>

            {/* Quick Demo Reset Trigger */}
            <button
              type="button"
              onClick={() => {
                if (onResetDemoData) {
                  onResetDemoData();
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="Restore clean pitch dataset"
            >
              <span>🔄</span>
              <span>Reset State</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Close presentation guide"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slide Indicator Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 py-2 gap-1 overflow-x-auto scrollbar-none">
          {PITCH_SLIDES.map((s, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSlide(idx)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span>{s.icon}</span>
                <span className="font-semibold">Slide {idx + 1}</span>
                <span className="text-[10px] text-slate-500 hidden md:inline">
                  {s.id === 'hook'
                    ? 'The Hook'
                    : s.id === 'solution'
                    ? 'The Solution'
                    : s.id === 'demo'
                    ? 'Live Demo'
                    : s.id === 'secret-sauce'
                    ? 'Secret Sauce'
                    : 'Tech Stack'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Slide Body View */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Slide Heading & Metadata */}
          <div className="border-b border-slate-800/80 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-0.5 text-xs font-semibold text-slate-300">
                {slide.badge}
              </span>
              <span className="rounded-md bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 text-xs font-mono font-medium text-purple-300">
                ⏱️ Target Time: {slide.speakerTime}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{slide.icon}</span>
              <span>{slide.title}</span>
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {slide.subtitle}
            </p>

            <div className="mt-3 inline-block rounded-lg bg-slate-800/50 border border-slate-700/50 px-3.5 py-2 text-xs text-slate-300">
              <strong className="text-purple-300">Key Takeaway: </strong>
              {slide.takeaway}
            </div>
          </div>

          {/* Slide Content Layout */}
          {slide.id === 'demo' ? (
            /* Dedicated Interactive Live Demo Script Checklist */
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <span>⚡</span> 3-Minute Live Screen Actions
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-400/80">
                    5 Click Sequences · Audio Feedback
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Follow these exact interactions during your live screen-share with Prof. Alvarez.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-1">
                {slide.demoSteps.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                          {item.step}
                        </h5>
                        <p className="mt-1 text-xs text-slate-200">
                          {item.action}
                        </p>
                        <p className="mt-2 text-xs italic text-slate-400 bg-slate-900/60 rounded px-2.5 py-1.5 border border-slate-800 font-serif">
                          Verbal Cue: {item.cue}
                        </p>
                      </div>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Bullet Points / Architecture Pillars Layout */
            <div className="grid gap-4 sm:grid-cols-3">
              {slide.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/90 bg-slate-800/30 p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <span className="text-purple-400">▹</span>
                      <span>{pt.heading}</span>
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      {pt.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Verbatim Speaker Script Box */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/15 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs">🎙️</span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Verbatim Speaker Script
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySpeakerNotes}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/20 px-2.5 py-1 text-[11px] font-semibold text-purple-200 hover:bg-purple-500/30 hover:text-white transition-all"
              >
                {copiedScript ? '✓ Copied to Clipboard!' : 'Copy Script'}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 font-sans italic bg-slate-950/40 p-3 rounded-lg border border-purple-500/10">
              "{slide.script}"
            </p>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/90 px-6 py-4">
          <button
            type="button"
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
            className={`inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold transition-all ${
              currentSlideIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            ← Previous Slide
          </button>

          <div className="flex items-center gap-2">
            {PITCH_SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {currentSlideIndex === PITCH_SLIDES.length - 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
              >
                ✓ Pitch Ready! Let's Demo
              </button>
            ) : (
              <button
                type="button"
                onClick={goToNextSlide}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all"
              >
                Next Slide →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
