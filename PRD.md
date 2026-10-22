# Vibecoding Project Tracker — PRD

**Status:** Finalized & Verified (Milestone 13 Complete) · Maintained by Robert Flores & VibeCraft Team

---

## 1. Problem

Vibecoding teams have two recurring pains with large projects:

1. **They lose track of tasks.** Three teammates, a hundred small things, no shared view. Nothing tells them what state each task is actually in.
2. **They lose track of prompts.** The AI gave them working code two days ago but no one remembers the prompt that produced it. When they need to iterate, they start from scratch.

A spreadsheet doesn't solve this. A real project tool (Linear, Jira, Notion) is overkill, doesn't know about prompts, and takes hours to set up.

## 2. Target users

- **Primary:** the team members, for the remaining weeks of the summer semester.
- **Secondary:** future cohorts of vibecoders taking the same class.

We are designing the tool we ourselves will use. The pitch demo is also our first real user test.

## 3. Product overview

A single-page web app with two persistent surfaces:

- A **Kanban board** where vibecoding tasks move through four states.
- An **Anchor Board** above it that pins the four final-project deliverables (Presentation, Demo, Report, Documentation).

Each task carries the prompt context that produced it, so any teammate can click a button and copy the task + prompt history back into an AI chat to continue work.

## 4. Primary user flow

1. Open the Webapp. The board loads from local storage.
2. Click "+" to add a task. Fill in title, type, assignee, due date, prompt context.
3. Move the task across columns as you work.
4. When stuck, click "Copy as Prompt Context" on a task and paste it into Claude/ChatGPT/Cursor to continue.
5. Hand off a task to a teammate with one dropdown.
6. Drop final deliverable links into the Anchor Board as you produce them.

## 5. Data model

Locked. Do not change without team agreement.

```js
// A single vibecoding task.
Task = {
  id: string,                    // uuid or timestamp string
  title: string,
  description: string,
  type: 'feature' | 'bug',       // visual color coding
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string,              // one of the three teammate names from §8
  dueDate: string | null,        // ISO date 'YYYY-MM-DD'
  createdDate: string,           // ISO date 'YYYY-MM-DD'

  // Added in later milestones:
  context: string,               // M9 context — curated briefing for the next AI / teammate
  contextTool: string | null,    // M9 context — 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other'
  contextUpdatedAt: string|null, // M9 context — ISO timestamp set automatically on save
  prerequisiteId: string | null, // M12 secret-sauce — upstream task ID for prompt context chaining
}

// One of four pinned deliverable slots.
Anchor = {
  id: 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,                 // human-readable
  url: string | null,            // the link the team pastes in
}
```

## 6. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React (via Vite) | What the scaffold ships with. Don't migrate. |
| Styling | Tailwind | Already configured. Use utility classes; no separate CSS files. |
| State | React `useState` + a `useLocalStorage` hook | Simple, no library needed. |
| Persistence | **localStorage** | Zero infra. Pick this. Do not switch to a backend mid-hackathon. |
| Deploy | Vercel | One-click deploy from GitHub. |

> **Decision:** localStorage, not a shared backend. If you want a shared backend later, that's M14 — out of scope for the hackathon.

## 7. Stage names

Four columns, in this order, with these exact labels in the UI:

1. **To Do**
2. **In Progress**
3. **Review**
4. **Done**

## 8. Team

Configured for individual execution covering all three primary tracks:

| Slot | Name | GitHub handle |
|---|---|---|
| Teammate A | Teammate A (Fullstack & State) | `@rboy771-state` |
| Teammate B | Teammate B (Design & UI Tokens) | `@rboy771-ui` |
| Teammate C | Teammate C (Prompt & AI Systems) | `@rboy771-ai` |

These three names become the **only** allowed values for `Task.assignee`. No auth — just a dropdown.

## 9. Milestone ownership

| # | Tag | Title | Suggested owner | Final owner | Status |
|---|---|---|---|---|:---:|
| 3 | `design-done` | Design system + voice (DESIGN.md) | **B** | Teammate B | ✅ Done |
| 4 | `data-model` | Task model + board view | **A** | Teammate A | ✅ Done |
| 5 | `crud-modal` | Add / edit / delete modal | **A** | Teammate A | ✅ Done |
| 6 | `tag-style` | Feature / bug colors | **B** | Teammate B | ✅ Done |
| 7 | `task-owner` | Owner indicator + handoff | **A** | Teammate A | ✅ Done |
| 8 | `due-tint` | Due-date color tinting | **B** | Teammate B | ✅ Done |
| 9 | `context` | Context field on the task modal | **C** | Teammate C | ✅ Done |
| 10 | `copy-prompt` | "Copy as Prompt Context" button | **C** | Teammate C | ✅ Done |
| 11 | `anchors` | Deliverable Anchor Board | **B** | Teammate B | ✅ Done |
| 12 | `secret-sauce` | The one thing that makes it yours | **C / All** | Teammate C / All | ✅ Done |
| 13 | `pitch-ready` | Demo + pitch rehearsal | **All** | All Tracks | ✅ Done |

Track A owns the state model and task ownership. Track B owns the visuals (and design — M3 runs parallel to M2 so the team starts Phase 3 with the palette already chosen). Track C owns the differentiator features (M9 + M10 — the context field and the Copy-as-Prompt button) and usually leads on M12 secret-sauce.

## 10. AI / vibe coding angle

Where AI was heavily used:
- M4, M5: scaffold the board and the modal from a single prompt each.
- M9, M10: write the Markdown serialization helper for the Context field.
- M7: animation polish for the handoff toast.
- M12: Upstream Prompt Context Chaining (Task Lineage), Tool-Adaptive Prompts (Claude XML, Cursor diffs, ChatGPT CoT), and HTML5 Drag-and-Drop.

Where AI did **not** save time (manual human judgment):
- M2 (this PRD review) — read and validated manually.
- M3 (DESIGN.md) — curated dark-mode taste and tokens.
- M12 (secret-sauce) — deterministic prompt inheritance architecture, model-specific directives, and accessibility safeguards.
- M13 (pitch) — authentic presentation script tailored for coursework evaluation.

## 11. Team identity

- **Team name:** VibeCraft Studio / Team VibeTracker
- **Tagline (one sentence):** A prompt-native Kanban and deliverable anchor workspace built for high-velocity vibecoding teams.
- **Tracker URL after deploy:** `https://individual-vibe-coded.vercel.app`

## 12. Out of scope (do not build)

- Authentication / accounts.
- Real GitHub integration.
- A real backend / shared database.
- Mobile responsive — desktop focused layout.
- Multi-team support.
- Real-time collaboration.

## 13. Definition of done

The hackathon is "done" when all 13 milestone tags are pushed to your repo and visible on the dashboard. The pitch is "done" when:

- [x] The board loads on Vercel without errors.
- [x] The "Copy as Prompt Context" demo works on stage.
- [x] 5 min pitch is rehearsed (`PITCH.md` demonstration script).

---

*PRD version: hackathon-final v1.0 · maintained by Robert Flores & VibeCraft Team*
