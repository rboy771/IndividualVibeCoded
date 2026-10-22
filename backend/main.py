"""
VibeTracker FastAPI Backend Service
Provides RESTful CRUD endpoints for tasks, deliverable anchors, and AI prompt synthesis.
Includes JSON file persistence with automatic seed generation and CORS support.
"""

from __future__ import annotations

import json
import os
import time
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# App initialization & CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="VibeTracker Backend API",
    description="REST backend for tasks, deliverable anchors, and prompt synthesis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent / "data"
STORE_FILE = DATA_DIR / "store.json"

# ---------------------------------------------------------------------------
# Pydantic Models matching PRD Section 5
# ---------------------------------------------------------------------------
TaskType = Literal["feature", "bug"]
TaskStatus = Literal["todo", "in-progress", "review", "done"]
AnchorStatus = Literal["pending", "in-progress", "ready"]
AnchorId = Literal["presentation", "demo", "report", "documentation"]


class Task(BaseModel):
    id: str
    title: str
    description: str = ""
    type: TaskType = "feature"
    status: TaskStatus = "todo"
    assignee: str = "Teammate A"
    dueDate: Optional[str] = None  # ISO 'YYYY-MM-DD'
    createdDate: Optional[str] = None  # ISO 'YYYY-MM-DD'
    context: Optional[str] = ""
    contextTool: Optional[str] = None
    contextUpdatedAt: Optional[str] = None
    prerequisiteId: Optional[str] = None


class TaskCreate(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    type: Optional[TaskType] = "feature"
    status: Optional[TaskStatus] = "todo"
    assignee: Optional[str] = "Teammate A"
    dueDate: Optional[str] = None
    createdDate: Optional[str] = None
    context: Optional[str] = ""
    contextTool: Optional[str] = None
    contextUpdatedAt: Optional[str] = None
    prerequisiteId: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[TaskType] = None
    status: Optional[TaskStatus] = None
    assignee: Optional[str] = None
    dueDate: Optional[str] = None
    createdDate: Optional[str] = None
    context: Optional[str] = None
    contextTool: Optional[str] = None
    contextUpdatedAt: Optional[str] = None
    prerequisiteId: Optional[str] = None


class Anchor(BaseModel):
    id: AnchorId
    label: str
    category: Optional[str] = ""
    icon: Optional[str] = ""
    url: Optional[str] = ""
    status: AnchorStatus = "pending"
    notes: Optional[str] = ""
    lastUpdated: Optional[str] = None


class AnchorUpdate(BaseModel):
    url: Optional[str] = None
    status: Optional[AnchorStatus] = None
    notes: Optional[str] = None
    lastUpdated: Optional[str] = None
    label: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None


class OptimizePromptRequest(BaseModel):
    task: Optional[Dict[str, Any]] = None
    templateId: Optional[str] = "feature_architect"
    persona: Optional[str] = None
    targetModelId: Optional[str] = "claude"
    includeArchitecture: Optional[bool] = True
    includeConstraints: Optional[bool] = True
    customDirective: Optional[str] = ""


class OptimizePromptResponse(BaseModel):
    prompt: str
    templateId: str
    targetModelId: str


# ---------------------------------------------------------------------------
# Initial Seeds Generation (Mirrors seedTasks.js and anchors.js)
# ---------------------------------------------------------------------------
def get_relative_iso_date(offset_days: int = 0) -> str:
    target = datetime.now(timezone.utc) + timedelta(days=offset_days)
    return target.strftime("%Y-%m-%d")


def generate_seed_tasks() -> List[Dict[str, Any]]:
    now_utc = datetime.now(timezone.utc)
    return [
        {
            "id": "task-1",
            "title": "Scaffold Tailwind design tokens and dark workspace",
            "description": "Configure slate background surfaces, indigo brand colors, and accessible text contrast in tailwind.config.js.",
            "type": "feature",
            "status": "done",
            "assignee": "Teammate B",
            "dueDate": get_relative_iso_date(-4),
            "createdDate": get_relative_iso_date(-7),
            "context": "Configured dark theme tokens in tailwind.config.js and verified WCAG 2.1 AA text contrast ratio >= 4.5:1.",
            "contextTool": "Claude",
            "contextUpdatedAt": (now_utc - timedelta(days=2)).isoformat(),
            "prerequisiteId": None,
        },
        {
            "id": "task-2",
            "title": "Build Deliverable Anchor Board banner",
            "description": "Create pinned top header tracking Presentation, Demo, Report, and Documentation deliverables with real-time status indicators.",
            "type": "feature",
            "status": "done",
            "assignee": "Teammate A",
            "dueDate": get_relative_iso_date(-2),
            "createdDate": get_relative_iso_date(-5),
            "context": "Built AnchorBoard.jsx with responsive layout, URL input modal, and localStorage persistence.",
            "contextTool": "Cursor",
            "contextUpdatedAt": (now_utc - timedelta(days=1)).isoformat(),
            "prerequisiteId": None,
        },
        {
            "id": "task-3",
            "title": "Implement prompt briefing context and 1-click clipboard copy",
            "description": "Store Markdown instructions and target LLM tool on each task, serializing to clipboard on click.",
            "type": "feature",
            "status": "in-progress",
            "assignee": "Teammate C",
            "dueDate": get_relative_iso_date(1),
            "createdDate": get_relative_iso_date(-2),
            "context": "Added contextHelper.js with Markdown prompt serializer and clipboard fallback for cross-origin environments.",
            "contextTool": "ChatGPT",
            "contextUpdatedAt": (now_utc - timedelta(hours=3)).isoformat(),
            "prerequisiteId": "task-1",
        },
        {
            "id": "task-4",
            "title": "Test relative due-date border urgency tinting",
            "description": "Verify overdue tasks display crimson borders, upcoming tasks show warning amber, and completed tasks remain neutral.",
            "type": "bug",
            "status": "todo",
            "assignee": "Teammate A",
            "dueDate": get_relative_iso_date(3),
            "createdDate": get_relative_iso_date(-1),
            "context": "Audited dueTint.js boundary calculations against local midnight and verified high-contrast focus rings.",
            "contextTool": "Claude",
            "contextUpdatedAt": (now_utc - timedelta(hours=5)).isoformat(),
            "prerequisiteId": "task-2",
        },
    ]


def get_default_anchors() -> List[Dict[str, Any]]:
    return [
        {
            "id": "presentation",
            "label": "Presentation",
            "category": "Slides & Pitch Deck",
            "icon": "📽️",
            "url": "",
            "status": "pending",
            "notes": "",
            "lastUpdated": None,
        },
        {
            "id": "demo",
            "label": "Demo",
            "category": "Live App Deployment",
            "icon": "⚡",
            "url": "https://vibetracker.vercel.app",
            "status": "ready",
            "notes": "",
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "report",
            "label": "Report",
            "category": "Project Write-up & PDF",
            "icon": "📄",
            "url": "",
            "status": "pending",
            "notes": "",
            "lastUpdated": None,
        },
        {
            "id": "documentation",
            "label": "Documentation",
            "category": "Architecture & Readme",
            "icon": "📚",
            "url": "https://github.com/rboy771/IndividualVibeCoded#readme",
            "status": "ready",
            "notes": "",
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
        },
    ]


def get_demo_anchors() -> List[Dict[str, Any]]:
    now_iso = datetime.now(timezone.utc).isoformat()
    return [
        {
            "id": "presentation",
            "label": "Presentation",
            "category": "Slides & Pitch Deck",
            "icon": "📽️",
            "url": "",
            "status": "pending",
            "notes": "",
            "lastUpdated": None,
        },
        {
            "id": "demo",
            "label": "Demo",
            "category": "Live App Deployment",
            "icon": "⚡",
            "url": "https://vibetracker.vercel.app",
            "status": "ready",
            "notes": "",
            "lastUpdated": now_iso,
        },
        {
            "id": "report",
            "label": "Report",
            "category": "Project Write-up & PDF",
            "icon": "📄",
            "url": "",
            "status": "pending",
            "notes": "",
            "lastUpdated": None,
        },
        {
            "id": "documentation",
            "label": "Documentation",
            "category": "Architecture & Readme",
            "icon": "📚",
            "url": "https://github.com/rboy771/IndividualVibeCoded#readme",
            "status": "ready",
            "notes": "",
            "lastUpdated": now_iso,
        },
    ]


# ---------------------------------------------------------------------------
# Data Persistence Manager
# ---------------------------------------------------------------------------
class DataStore:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.tasks: List[Dict[str, Any]] = []
        self.anchors: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.tasks = data.get("tasks", [])
                    self.anchors = data.get("anchors", [])
                    if self.tasks and self.anchors:
                        return
            except Exception:
                pass
        # Fallback to defaults
        self.tasks = generate_seed_tasks()
        self.anchors = get_default_anchors()
        self._save()

    def _save(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        temp_file = self.file_path.with_suffix(".tmp")
        payload = {
            "tasks": self.tasks,
            "anchors": self.anchors,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        temp_file.replace(self.file_path)

    # Tasks operations
    def get_tasks(self) -> List[Dict[str, Any]]:
        return self.tasks

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        for t in self.tasks:
            if t["id"] == task_id:
                return t
        return None

    def add_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        if not task_data.get("id"):
            task_data["id"] = f"task-{int(time.time() * 1000)}"
        if not task_data.get("createdDate"):
            task_data["createdDate"] = get_relative_iso_date(0)
        self.tasks.append(task_data)
        self._save()
        return task_data

    def update_task(self, task_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for i, t in enumerate(self.tasks):
            if t["id"] == task_id:
                clean_updates = {k: v for k, v in updates.items() if v is not None}
                self.tasks[i] = {**t, **clean_updates}
                self._save()
                return self.tasks[i]
        return None

    def delete_task(self, task_id: str) -> bool:
        initial_len = len(self.tasks)
        self.tasks = [t for t in self.tasks if t["id"] != task_id]
        if len(self.tasks) < initial_len:
            self._save()
            return True
        return False

    def reset_tasks(self) -> List[Dict[str, Any]]:
        self.tasks = generate_seed_tasks()
        self._save()
        return self.tasks

    # Anchors operations
    def get_anchors(self) -> List[Dict[str, Any]]:
        return self.anchors

    def get_anchor(self, anchor_id: str) -> Optional[Dict[str, Any]]:
        for a in self.anchors:
            if a["id"] == anchor_id:
                return a
        return None

    def update_anchor(self, anchor_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for i, a in enumerate(self.anchors):
            if a["id"] == anchor_id:
                clean_updates = {k: v for k, v in updates.items() if v is not None}
                # Update lastUpdated if not explicitly passed
                if "lastUpdated" not in clean_updates or not clean_updates["lastUpdated"]:
                    clean_updates["lastUpdated"] = datetime.now(timezone.utc).isoformat()
                self.anchors[i] = {**a, **clean_updates}
                self._save()
                return self.anchors[i]
        return None

    def reset_anchors(self) -> List[Dict[str, Any]]:
        self.anchors = get_demo_anchors()
        self._save()
        return self.anchors


store = DataStore(STORE_FILE)

# ---------------------------------------------------------------------------
# Prompt Synthesizer Engine (Mirrors promptOptimizer.js)
# ---------------------------------------------------------------------------
PROMPT_TEMPLATES = {
    "feature_architect": {
        "name": "Feature Architect",
        "badge": "Architecture & Design",
        "rolePrompt": (
            "You are an elite Senior Frontend Architect specializing in React, Vite, and modern UI engineering.\n"
            "Your objective is to implement a robust, scalable feature following clean component architecture, "
            "deterministic state flow, and seamless user experience."
        ),
        "directives": [
            "Design modular, testable components with explicit prop contracts.",
            "Maintain deterministic state with local persistence hooks.",
            "Ensure tight alignment with design tokens and color variables.",
            "Handle loading, empty, and edge cases gracefully.",
        ],
    },
    "debug_specialist": {
        "name": "Debug Specialist",
        "badge": "Root Cause & Fix",
        "rolePrompt": (
            "You are a Principal Software Debugging Engineer and diagnostic specialist.\n"
            "Your objective is to identify the exact root cause of the reported issue, trace state anomalies, "
            "and deliver an elegant, surgical fix without regressions."
        ),
        "directives": [
            "Perform step-by-step root cause analysis (RCA).",
            "Identify race conditions, stale closures, or unhandled null/undefined values.",
            "Provide minimal, high-precision surgical diffs rather than broad rewrites.",
            "Verify fix preserves existing behavior and passes edge conditions.",
        ],
    },
    "speed_run": {
        "name": "Speed Run / Hackathon MVP",
        "badge": "High Velocity",
        "rolePrompt": (
            "You are a legendary 10x Hackathon Vibecoder with hyperfocus and high velocity.\n"
            "Your objective is to ship a blazing-fast, visually polished, fully functional implementation "
            "in record time with pragmatic simplicity."
        ),
        "directives": [
            "Zero bloat — build what works immediately and cleanly.",
            "Leverage Tailwind utility classes directly for maximum speed.",
            "Use existing helper hooks and utility patterns already in the repo.",
            "Make it immediately testable and pitch-ready.",
        ],
    },
    "test_driven": {
        "name": "Test-Driven (TDD)",
        "badge": "Quality & Verification",
        "rolePrompt": (
            "You are a Quality Assurance and Test-Driven Development (TDD) Specialist.\n"
            "Your objective is to craft comprehensive acceptance criteria, edge-case assertions, and "
            "verifiable test scenarios for this task."
        ),
        "directives": [
            "Define clear given/when/then acceptance scenarios.",
            "Enumerate boundary edge cases (null inputs, empty states, network blips).",
            "Provide runnable assertions or unit test scaffolding.",
            "Verify 100% adherence to product requirements.",
        ],
    },
    "refactor_clean": {
        "name": "Refactor & Clean Code",
        "badge": "Code Polish",
        "rolePrompt": (
            "You are a Staff Refactoring Engineer and Clean Code Advocate.\n"
            "Your objective is to streamline existing code, eliminate code smells, eliminate redundant re-renders, "
            "and maximize maintainability."
        ),
        "directives": [
            "Simplify complex branching into declarative constructs.",
            "Extract reusable hooks and pure utility functions.",
            "Ensure consistent naming, self-documenting code, and preserved comments.",
            "Ensure zero regressions or broken imports.",
        ],
    },
}

TARGET_MODELS = {
    "claude": "Claude 3.7 Sonnet / Thinking",
    "cursor": "Cursor Composer (Fast & Agentic)",
    "chatgpt": "ChatGPT o3-mini / GPT-4o",
    "lovable": "Lovable / Replit AI",
    "gemini": "Gemini 2.0 Flash / Pro",
}


def synthesize_prompt(
    task: Dict[str, Any],
    template_id: str = "feature_architect",
    target_model_id: str = "claude",
    include_architecture: bool = True,
    include_constraints: bool = True,
    custom_directive: str = "",
) -> str:
    template = PROMPT_TEMPLATES.get(template_id, PROMPT_TEMPLATES["feature_architect"])
    model_name = TARGET_MODELS.get(target_model_id, "Claude 3.7 Sonnet / Thinking")

    title = (task.get("title") or "Untitled Feature / Task").strip()
    task_type = task.get("type", "feature")
    status_val = task.get("status", "todo")
    assignee = task.get("assignee", "Unassigned")
    due_date = task.get("dueDate") or "None"
    description = (task.get("description") or "No description provided.").strip()
    context_briefing = (
        task.get("context") or "No existing context briefing logged yet."
    ).strip()

    sections = []

    # 1. Header & Role Instruction
    sections.append(
        f"# Prompt Request for {model_name}\n"
        f"Role Persona: {template['name']} ({template['badge']})\n\n"
        f"{template['rolePrompt']}"
    )

    # 2. Task Specification & Live State
    type_label = (
        "Defect fix" if task_type == "bug" else "New capability"
    )
    sections.append(
        f"## 🎯 Task Objective & Live State\n"
        f"- **Title:** {title}\n"
        f"- **Type:** {task_type.upper()} ({type_label})\n"
        f"- **Current Stage:** {status_val.upper()}\n"
        f"- **Assigned Teammate:** {assignee}\n"
        f"- **Due Date:** {due_date}\n\n"
        f"### Description & User Story\n"
        f"{description}"
    )

    # 3. AI Context Briefing
    sections.append(
        f"### 🧠 AI Context Briefing & Background Knowledge\n{context_briefing}"
    )

    # 4. Directives
    dir_lines = "\n".join(f"- {d}" for d in template["directives"])
    if custom_directive and custom_directive.strip():
        dir_lines += f"\n- **Custom Directive:** {custom_directive.strip()}"
    sections.append(f"## 📋 Execution Protocol & Directives\n{dir_lines}")

    # 5. Architecture
    if include_architecture:
        sections.append(
            "## 🏛️ Project Architecture & Design System Guidelines\n"
            "- **Core Framework:** React 18+ bundled with Vite (ES modules, fast refresh).\n"
            "- **Backend API:** FastAPI (Python 3.14) REST endpoints with Pydantic schemas and JSON persistence.\n"
            "- **Styling Architecture:** Tailwind CSS utility classes strictly following `DESIGN.md`:\n"
            "  - Background: Slate 900 (`#0F172A`, `bg-surface-page`)\n"
            "  - Cards: Slate 800 (`#1E293B`, `bg-surface-card`, 1px `border-slate-700/60`)\n"
            "  - Accent colors: Electric Indigo (`#6366F1`) & Violet Neon (`#8B5CF6`)\n"
            "  - Feature badge: Emerald 500 (`#10B981`) | Bug badge: Rose/Red 500 (`#EF4444`)\n"
            "  - Monospace font: JetBrains Mono / Fira Code for prompt context & tags.\n"
            "- **State & Sync:** React local-first state with resilient localStorage persistence."
        )

    # 6. Constraints
    if include_constraints:
        sections.append(
            "## ⚠️ Strict Output Constraints\n"
            "1. **Preserve Integrity:** Preserve all existing docstrings, component interfaces, and comments.\n"
            "2. **Deterministic & Safe:** Do NOT introduce random third-party npm libraries unless strictly requested.\n"
            "3. **Completeness:** Provide complete, drop-in replacement code blocks with file path headers. Do not use placeholder omissions like '// ... rest of code unchanged'.\n"
            "4. **Clean Verification:** Code must compile cleanly with `npm run build` with zero runtime errors."
        )

    # 7. Call to Action
    sections.append(
        "---\n*Synthesized by VibeTracker AI Prompt Optimizer (FastAPI Engine). Please proceed with the implementation.*"
    )

    return "\n\n".join(sections)


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": "VibeTracker API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# Tasks Endpoints
@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    """Retrieve all Kanban tasks."""
    return store.get_tasks()


@app.post("/api/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate):
    """Create a new task."""
    task_dict = payload.model_dump()
    created = store.add_task(task_dict)
    return created


@app.put("/api/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, payload: TaskUpdate):
    """Update an existing task."""
    updated = store.update_task(task_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found",
        )
    return updated


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    """Delete a task."""
    deleted = store.delete_task(task_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found",
        )
    return {
        "success": True,
        "id": task_id,
        "message": f"Task '{task_id}' deleted successfully",
    }


@app.post("/api/tasks/reset", response_model=List[Task])
def reset_tasks():
    """Reset tasks to initial demo dataset."""
    return store.reset_tasks()


# Anchors Endpoints
@app.get("/api/anchors", response_model=List[Anchor])
def get_anchors():
    """Retrieve the 4 deliverable anchors."""
    return store.get_anchors()


@app.put("/api/anchors/{anchor_id}", response_model=Anchor)
def update_anchor(anchor_id: AnchorId, payload: AnchorUpdate):
    """Update a deliverable anchor."""
    updated = store.update_anchor(anchor_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Anchor with id '{anchor_id}' not found",
        )
    return updated


@app.post("/api/anchors/reset", response_model=List[Anchor])
def reset_anchors():
    """Reset deliverable anchors to pitch-ready showcase values."""
    return store.reset_anchors()


# AI Prompt Optimizer Endpoint
@app.post("/api/optimize-prompt", response_model=OptimizePromptResponse)
def optimize_prompt(payload: OptimizePromptRequest):
    """Synthesizes high-context prompts tailored for AI LLMs and role personas."""
    template_id = payload.persona or payload.templateId or "feature_architect"
    target_model_id = payload.targetModelId or "claude"
    task_data = payload.task or {}

    prompt = synthesize_prompt(
        task=task_data,
        template_id=template_id,
        target_model_id=target_model_id,
        include_architecture=payload.includeArchitecture
        if payload.includeArchitecture is not None
        else True,
        include_constraints=payload.includeConstraints
        if payload.includeConstraints is not None
        else True,
        custom_directive=payload.customDirective or "",
    )

    return OptimizePromptResponse(
        prompt=prompt,
        templateId=template_id,
        targetModelId=target_model_id,
    )
