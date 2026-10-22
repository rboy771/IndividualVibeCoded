# 🚀 VibeTracker — Vibecoding Project Tracker

> **CM6312: Adopting Technologies** · Vibecoding Project Tracker  
> **Repository:** `[https://github.com/rboy771/IndividualVibeCoded](https://github.com/rboy771/IndividualVibeCoded)`  
> **Status:** All 13 Milestones Completed & Production-Verified (`pitch-ready` / `pitch-done`)  
> **Pitch Documentation:** [`PITCH.md`](PITCH.md)  
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
   - Real-time status pills (`Pending`, `In Progress`, `Ready`) and URL validation.

5. **Ergonomic Drag-and-Drop & Accessibility (Milestone 12 & 13)**
   - **Native HTML5 Drag-and-Drop**: Smooth card dragging across all 4 workflow columns with electric glow on drag-over.
   - **WCAG 2.1 AA Dragging Alternatives (Criterion 2.5.7)**: Single-click inline dropdown selectors on every card ensuring full keyboard and motor accessibility.
   - **Sprint State Reset**: One-click restore button returning the board to a verified initial sprint showcase state.

---

## 🛠️ Tech Stack & Architecture

- **UI Framework:** React 18 (Vite 5)
- **Styling & Design Tokens:** Tailwind CSS v3 (Slate dark aesthetic: `slate-950`, `indigo-500`)
- **Persistence:** Pure reactive `useLocalStorage` hooks — 0ms latency, zero backend overhead, survives reloads.
- **Accessibility:** WCAG 2.1 AA compliant semantic landmarks, focus trapping, and contrast ratios >= 4.5:1.

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
| **M6** | `tag-style` | Tag icons & colors | ✅ Verified | `TaskCard.jsx` (feature / bug) |
| **M7** | `task-owner` | Teammate avatars & handoffs | ✅ Verified | `ASSIGNEE_CONFIG`, inline handoff |
| **M8** | `due-tint` | Due date urgency tinting | ✅ Verified | `dueTint.js`, `DueBadge.jsx` |
| **M9** | `task-context` | Prompt context & tool metadata | ✅ Verified | `contextHelper.js`, `TaskModal.jsx` |
| **M10** | `copy-context` | 1-click prompt serialization | ✅ Verified | `contextHelper.js`, clipboard API |
| **M11** | `project-deliverables` | Deliverable Anchor Board | ✅ Verified | `AnchorBoard.jsx`, `anchors.js` |
| **M12** | `secret-sauce` | Upstream Prompt Lineage & Tool-Adaptive Prompts | ✅ Verified | `contextHelper.js`, `TaskModal.jsx`, `TaskCard.jsx` |
| **M13** | `pitch-ready` | Production verification & sprint reset | ✅ Verified | `PITCH.md`, zero-barrier URL |

---

## 🎙️ 3-Minute Live Demo Choreography

1. **Board & Urgency Tints:** Inspect the 4 columns and observe dynamic border tints (Rose Overdue vs. Amber Warning vs. Emerald Safe).
2. **Teammate Handoff:** Click any card's avatar dropdown to reassign a task with instant toast feedback.
3. **Secret Sauce (Task Lineage & Model-Adaptive Prompts):** Open **Task #3** or **Task #4**. In the modal, switch to **`[ 👁️ Live Prompt Preview ]`** and change the **Target AI Tool** (Claude, Cursor, ChatGPT, Lovable, Replit). Show how the prompt structure, tags, and directives dynamically morph in real-time while chaining upstream prerequisite context.
4. **Anchor Milestone:** Set a deliverable anchor to `Ready` and observe the live status badge transition.
5. **Drag-and-Drop Demo:** Grab any card and drag it smoothly across columns with real-time drop-target glow borders, or use the accessible inline dropdown.
