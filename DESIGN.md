# Vibecoding Project Tracker — Design

**Status:** Completed · Milestone 3 (`design-done`)

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

A sleek, focused developer dark-workspace with deep slate backgrounds, vibrant electric purple/indigo accents, and crisp typography that keeps vibecoders in high-velocity flow.

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- Linear dark interface (linear.app) — dark slate, ultra-crisp borders, subtle glow accents
- Raycast dark theme — refined violet/indigo neon highlights, clean typography, compact badges
- Vercel dashboard dark mode — high-contrast text, slate-900 surfaces, minimal visual noise

Anti-references — what we are explicitly **not** trying to look like:

- Blinding white default Trello / Jira boards with washed-out pastel sticky notes
- Cluttered enterprise tables with 20 tiny unreadable icon buttons and low contrast

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#6366F1` | Header, "+" button, focus rings (Indigo 500) |
| `brand-accent` | `#8B5CF6` | Highlights, hover states, links (Purple 500) |
| `surface-page` | `#0F172A` | Page background (Slate 900) |
| `surface-card` | `#1E293B` | Card background (Slate 800) |
| `text-primary` | `#F8FAFC` | Body text (Slate 50) |
| `text-muted` | `#94A3B8` | Captions, dates, counts (Slate 400) |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#10B981` | Cards tagged `feature` (accent stripe + icon, Emerald 500) |
| `type-bug` | `#EF4444` | Cards tagged `bug` (accent stripe + icon, Red 500) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#10B981` | More than 2 days out (Emerald 500) |
| `due-warning` | `#F59E0B` | Less than 24 hours (Amber 500) |
| `due-overdue` | `#EF4444` | Past due (Red 500) |
| `due-neutral` | `#64748B` | Done (overrides date, Slate 500) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Clean, crisp geometric sans designed for interfaces |
| Body | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Highly legible at standard and dense body sizes |
| Monospace (tags, badges, code) | `"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace` | Distinct tabular figures and prompt context readability |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** Crisp dark slate-800 surfaces with a 1px slate-700/60 border, subtle hover elevation and smooth brand focus outline.
- **Buttons:** Solid vibrant brand-primary fill, rounded-lg, crisp font weight with hover/focus ring transitions.
- **Modal:** Centered, max-w-lg, deep slate-800 surface with slate-950 backdrop at 75% opacity and blur.
- **Empty states:** Dashed slate-700 border, slate-500 muted text, encouraging and clean.
- **Drag affordance (if used):** None — we use a clean status dropdown or click-to-move for maximum speed and simplicity.

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `+ New Task` |
| Empty column placeholder | `Nothing here yet — stay in flow.` |
| Toast after "Copy as Prompt Context" | `Prompt context copied to clipboard. Ready to paste.` |
| Confirm-delete message | `Delete this task permanently? This cannot be undone.` |
| Handoff toast (M7 `task-owner`) | `Task handed off to {name}. Smooth sailing.` |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** `VibeTracker`
- **Wordmark style:** `VibeTracker` in semibold heading font with an electric purple gradient highlight dot (`brand-accent`).

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-completed v1*
