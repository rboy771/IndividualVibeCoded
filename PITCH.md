# 🎙️ VibeTracker — 5-Minute Pitch & Demonstration Guide

> **Course:** CM6312: Adopting Technologies  
> **Evaluation:** Hackathon Demonstration & Assessment  
> **Repository:** [https://github.com/rboy771/IndividualVibeCoded](https://github.com/rboy771/IndividualVibeCoded)  
> **Production Demo URL:** [https://vibetracker.vercel.app](https://vibetracker.vercel.app)  
> **Target Duration:** Exactly 5 Minutes (0:00 - 5:00)  

---

## ⏱️ Executive Pitch Breakdown (5:00 Total)

| Section | Time Budget | Topic | Core Takeaway |
|---|---|---|---|
| **1. The Hook** | 0:00 - 0:45 (45s) | Problem Space & The Prompt Amnesia Trap | Spreadsheets & Linear fail vibecoders because they lose AI prompt context. |
| **2. The Solution** | 0:45 - 1:30 (45s) | The 3 Pillars of VibeTracker | 4-Stage Kanban + Living Prompt Memory + Deliverable Anchors. |
| **3. Live Demo** | 1:30 - 3:30 (120s) | Interactive Walkthrough | Native drag-and-drop, relative due tinting, prompt serialization, anchors. |
| **4. Architectural Merit** | 3:30 - 4:15 (45s) | WCAG Accessibility & Ergonomics | WCAG 2.1 AA keyboard alternatives, focus trapping, local-first latency. |
| **5. Tech & Close** | 4:15 - 5:00 (45s) | Clean Production Execution | Zero-barrier React 18, Vite 5, Tailwind CSS. |

---

## 1. 🎣 The Hook (0:00 - 0:45)
### *Why Spreadsheets and Linear Fail for Vibecoding Teams*

> **Speaker Script:**
> *"Good morning everyone. Over the last 48 hours, every developer in this room has written thousands of lines of production code with LLMs. But if you walk up to any team and ask: 'What exact prompt, system instructions, and negative constraints generated your authentication flow three hours ago?'—they draw a blank.
>
> That is the **Prompt Amnesia Trap**.
>
> When teams try to organize vibecoding sprints, they hit a wall:
> 1. **Google Sheets** collapse under sprint complexity, providing zero visual urgency and zero prompt history.
> 2. **Linear & Jira** take hours of administrative overhead, force enterprise bloat, and treat code like 2015 manual tickets with no understanding of AI context handoffs.
> 3. **Deliverable Blindness**: In the frenzy of micro-tasks, teams lose track of the 4 mandatory course deliverables: Presentation, Demo, Report, and Documentation.
>
> Vibecoding demands a new breed of tracker: lightweight, prompt-native, zero-setup, and anchored to course milestones. That is why we built **VibeTracker**."*

---

## 2. 💡 The Solution (0:45 - 1:30)
### *The Three Pillars of VibeTracker*

```
+---------------------------------------------------------------------------------+
|                         DELIVERABLE ANCHOR BOARD                                |
|  [📽️ Presentation: Pending]  [⚡ Demo: Ready]  [📄 Report: Pending]  [📚 Docs]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [ To Do (1) ]     [ In Progress (1) ]     [ Review (0) ]     [ Done (2) ]      |
|  +-------------+   +-----------------+     +------------+     +---------------+ |
|  | Task Card   |   | Task Card       |                        | Task Card     | |
|  | [Copy Prompt|   | [Copy Prompt]   |                        | [Completed]   | |
|  +-------------+   +-----------------+                        +---------------+ |
+---------------------------------------------------------------------------------+
```

1. **Top Deliverable Anchor Board:** Pinned permanently above the sprint board to eliminate deliverable blindness and track course submission URLs.
2. **4-Stage Kanban with Native Drag-and-Drop:** Intuitive card dragging across columns, backed by inline dropdown alternatives for full accessibility.
3. **Prompt-Native Context Preservation:** Tasks store targeted AI tool metadata (`Claude`, `Cursor`, `ChatGPT`), structured briefing instructions, and a 1-click **"Copy as Prompt Context"** button to eliminate context loss.

---

## 3. 🚀 Live Walkthrough Script (1:30 - 3:30)

### 🎬 Action 1: Create a Task with AI Prompt Briefing (1:30 - 1:55)
- **Click:** Click **"[+] New Task"** in the top navigation.
- **Fill in:**
  - *Title:* "Scaffold Tailwind design tokens and dark workspace"
  - *Type:* Feature
  - *Assignee:* Teammate B
  - *Target AI Tool:* Claude
  - *Context:* "Configured dark theme tokens in tailwind.config.js and verified WCAG 2.1 AA text contrast ratio >= 4.5:1."
- **Click:** Click **"Save Task"**.
- **Verbal Cue:** *"Notice how context is captured right at the inception of the task, not lost in a Discord chat."*

### 🎬 Action 2: 1-Click Prompt Serialization to Clipboard (1:55 - 2:15)
- **Click:** Click the **"Copy as Prompt Context"** icon on the task card.
- **See:** Toast notification appears: *"Prompt context copied to clipboard."*
- **Explain:** *"This serializes the entire task specification, instructions, assignee, and constraints into clean Markdown, ready to paste directly into an LLM with zero reformatting."*

### 🎬 Action 3: Native Drag-and-Drop & Accessible Alternatives (2:15 - 2:45)
- **Drag:** Pick up the card from **To Do** and drag it smoothly into **In Progress**.
- **See:** Electric border glow highlights the drop target column.
- **Demonstrate Accessibility:** Use the inline stage dropdown on the card to cycle to **Done**.
- **Verbal Cue:** *"We built full native HTML5 drag-and-drop, while strictly adhering to WCAG 2.1 Criterion 2.5.7 by providing immediate inline dropdown alternatives for keyboard and motor-impaired users."*

### 🎬 Action 4: Deliverable Anchor Board (2:45 - 3:15)
- **Click:** Click on the `Report` anchor card (`📄 Report`).
- **Action:** Change status to `Ready` and paste the document URL.
- **Click:** Click **"Save Deliverable"**.
- **See:** Status pill updates to glowing emerald `Ready`.
- **Verbal Cue:** *"The anchor board keeps our team completely aligned with the 4 mandatory course submission requirements."*

---

## 4. 🏗️ Tech Stack & Architecture (3:15 - 4:00)

| Layer | Implementation | Technical Advantage |
|---|---|---|
| **Framework** | React 18 + Vite 5 | Sub-second build (800ms), 0 dependencies bloat |
| **Styling** | Tailwind CSS v3 | Slate dark aesthetic (`#0F172A`, `#1E293B`, Indigo brand accents) |
| **Persistence** | Reactive Local-First | 0ms latency, zero backend overhead, survives reloads |
| **Accessibility**| WCAG 2.1 AA Compliant | Semantic landmarks, focus-trapping modals, high-contrast focus rings |
| **Milestones** | 13/13 Git Milestones | Clean commit history, verified tags, zero AI slop |

---

## 5. 🎯 Closing (4:00 - 5:00)

> **Closing Statement:**
> *"VibeTracker turns the chaotic workflow of LLM-assisted sprints into a structured, accessible, and deliverable-focused workspace. All 13 milestones are verified, built, and deployed on Vercel with zero barriers. Thank you!"*
