# 🚀 VibeTracker — Vibecoding Project Tracker

> **UXD Vibecoding Hackathon 2026** · Prof. Dr. Ignacio Alvarez  
> **Repository:** `C:\Users\c24034652\Individualhackathon`  
> **Status:** All 13 Milestones Completed & Production-Verified (`pitch-ready` / `pitch-done`)  
> **Pitch Documentation:** [`PITCH.md`](file:///C:/Users/c24034652/Individualhackathon/PITCH.md)  
> **Live Demo URL:** [https://vibetracker.vercel.app](https://vibetracker.vercel.app)

VibeTracker is a prompt-native, zero-backend project workspace tailored for AI-assisted engineering teams. It bridges the gap between fast-moving task management, living prompt context memory, and final course deliverable accountability.

---

## 🌟 Key Features

1. **4-Stage Kanban Board with Kinetic Handoff**
   - Four distinct columns (`To Do`, `In Progress`, `Review`, `Done`).
   - 1-click teammate handoff via avatar dropdowns (`Teammate A`, `Teammate B`, `Teammate C`) with micro-sound feedback.
   - Distinct emerald feature pills & rose bug tags.

2. **Mathematical Due-Date Urgency Tinting (`dueTint.js`)**
   - Dynamically calculates relative days remaining against midnight local time.
   - Highlights tasks in crimson red (`due-overdue`), warning amber (`due-warning`), safe emerald (`due-safe`), or muted slate (`due-neutral`).

3. **AI Context Briefing & One-Click Prompt Serialization**
   - Dedicated briefing field and tool selector (`Claude`, `Cursor`, `ChatGPT`, `Lovable`, `Replit`).
   - One-click **"Copy as Prompt Context"** button serializes a structured, Markdown-formatted prompt with tasks, instructions, and constraints ready to paste directly into LLMs.

4. **Deliverable Anchor Board (`AnchorBoard.jsx`)**
   - Pinned above the sprint to keep the team laser-focused on the 4 mandatory course deliverables:
     - 📽️ **Presentation** (Slides Deck URL)
     - ⚡ **Demo** (Live Vercel Application URL)
     - 📄 **Report** (Project Write-up & PDF URL)
     - 📚 **Documentation** (Architecture & Readme URL)
   - Real-time status pills (`Pending`, `In Progress`, `Ready`), link validation, and celebratory sound effects.

5. **Signature Secret Sauce (Milestone 12)**
   - **Vibe Velocity & Flow Analytics Bar**: Real-time telemetry computing sprint flow percentage, velocity multiplier, and AI briefing coverage with neon shimmer glow.
   - **AI Prompt Optimizer & Vibe Synthesizer Modal**: 5 curated prompting personas (Feature Architect, Debugger, Speed Run MVP, TDD, Clean Refactor) with negative constraint injection.
   - **Web Audio Micro-Sounds Engine (`vibeAudio`)**: Zero-dependency browser oscillator synthesizer providing immediate tactile feedback for task transitions, prompt copying, and deliverable completions.

6. **Interactive In-App Pitch Guide & Demo Reset (Milestone 13)**
   - Built-in **"🎙️ Pitch Guide"** modal in the header featuring the 5-minute presentation slides, 3-minute live click script, and an interactive 5-minute countdown rehearsal timer.
   - 1-Click **"🔄 Reset Demo Data"** button to restore a calibrated 8-task hackathon showcase sprint at any moment.

---

## 🛠️ Tech Stack & Architecture

- **UI Framework:** React 18 (Vite 5)
- **Styling & Design Tokens:** Tailwind CSS v3 (Linear / Raycast dark aesthetic: `slate-950`, `indigo-500`, `purple-500`)
- **Persistence:** Pure reactive `useLocalStorage` hooks — 0ms latency, zero backend overhead, survives reloads.
- **Audio:** Web Audio API with native oscillators (no external media files).
- **Multi-Agent Execution:** Coordinated across 13 milestones using an Obsidian Blackboard (`Agent_Brain_Blackboard.md`).

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Production build & verification
npm run build
```

---

## 📋 Complete 13-Milestone Pipeline Verification

| # | Portal Tag | Milestone | Status | Key Artifacts |
|---|---|---|:---:|---|
| **M1** | `git-linked` | Repository initialization | ✅ Verified | Initial commit & repo setup |
| **M2** | `prd-done` | PRD & Scope Review | ✅ Verified | `PRD.md` confirmed |
| **M3** | `design-done` | Dark theme design tokens | ✅ Verified | `tailwind.config.js`, `DESIGN.md` |
| **M4** | `data-model` | 4-Stage Kanban layout | ✅ Verified | `Board.jsx`, `TaskCard.jsx`, `seedTasks.js` |
| **M5** | `crud-modal` | Task CRUD modal | ✅ Verified | `TaskModal.jsx`, localStorage state |
| **M6** | `tag-style` | Feature / Bug badge styling | ✅ Verified | `TaskCard.jsx` visual tokens |
| **M7** | `task-owner` | Teammate avatars & handoffs | ✅ Verified | Inline quick handoff dropdown |
| **M8** | `due-tint` | Relative deadline tinting | ✅ Verified | `dueTint.js`, `DueBadge.jsx` |
| **M9** | `context` | AI context briefing field | ✅ Verified | `TaskModal.jsx`, tool selectors |
| **M10** | `copy-prompt` | Markdown prompt serialization | ✅ Verified | `contextHelper.js`, 1-click copy |
| **M11** | `anchors` / `project-deliverables` | Deliverable Anchor Board | ✅ Verified | `AnchorBoard.jsx`, `anchors.js` |
| **M12** | `secret-sauce` | Vibe Velocity & Prompt Synthesizer | ✅ Verified | `VibeVelocityBar.jsx`, `promptOptimizer.js`, `vibeAudio.js` |
| **M13** | `pitch-ready` / `pitch-done` | Production Demo & In-App Pitch Guide | ✅ Verified | `PITCH.md`, `PitchGuideModal.jsx`, demo dataset |

---

## 🎙️ 3-Minute Live Demo Choreography

1. **Board & Urgency Tints:** Inspect the 4 columns and observe dynamic border tints (Rose Overdue vs. Amber Warning vs. Emerald Safe).
2. **Teammate Handoff:** Click any card's avatar dropdown to delegate a task with instant audio and toast feedback.
3. **Copy as Prompt Context:** Open any task and click **"Copy as Prompt Context"** to serialize the briefing into the clipboard.
4. **AI Synthesizer:** Click **"✨ AI Synthesizer"** to structure prompt constraints with tailored personas.
5. **Anchor Milestone:** Set a deliverable anchor to `Ready` and hear the victory audio fanfare.
6. **In-App Pitch Guide:** Click **"🎙️ Pitch Guide"** to rehearse or present the slides with the live timer.
