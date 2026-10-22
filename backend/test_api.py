"""
FastAPI Backend Integration Tests
Tests all REST endpoints for tasks, anchors, and prompt synthesis.
"""

from fastapi.testclient import TestClient
import main

client = TestClient(main.app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_tasks_crud():
    # 1. Reset tasks
    res = client.post("/api/tasks/reset")
    assert res.status_code == 200
    initial_tasks = res.json()
    assert len(initial_tasks) == 4

    # 2. Get tasks
    res = client.get("/api/tasks")
    assert res.status_code == 200
    assert len(res.json()) == 4

    # 3. Create task
    new_task = {
        "title": "Backend Automated Integration Test",
        "description": "Verifying full CRUD capabilities via pytest/TestClient",
        "type": "feature",
        "status": "in-progress",
        "assignee": "Teammate A",
        "context": "Testing FastAPI endpoint responses.",
        "contextTool": "Claude",
    }
    res = client.post("/api/tasks", json=new_task)
    assert res.status_code == 201
    created = res.json()
    assert created["title"] == new_task["title"]
    assert created["id"].startswith("task-")
    task_id = created["id"]

    # 4. Update task
    update_payload = {"status": "done", "assignee": "Teammate B"}
    res = client.put(f"/api/tasks/{task_id}", json=update_payload)
    assert res.status_code == 200
    updated = res.json()
    assert updated["status"] == "done"
    assert updated["assignee"] == "Teammate B"

    # 5. Delete task
    res = client.delete(f"/api/tasks/{task_id}")
    assert res.status_code == 200
    assert res.json()["success"] is True

    # 6. Verify count is back to 8
    res = client.get("/api/tasks")
    assert res.status_code == 200
    assert len(res.json()) == 4


def test_anchors_crud():
    # 1. Reset anchors
    res = client.post("/api/anchors/reset")
    assert res.status_code == 200
    anchors = res.json()
    assert len(anchors) == 4

    # 2. Get anchors
    res = client.get("/api/anchors")
    assert res.status_code == 200
    assert len(res.json()) == 4

    # 3. Update anchor
    res = client.put(
        "/api/anchors/demo",
        json={
            "url": "https://vibetracker.vercel.app",
            "status": "ready",
            "notes": "",
        },
    )
    assert res.status_code == 200
    updated = res.json()
    assert updated["url"] == "https://vibetracker.vercel.app"
    assert updated["status"] == "ready"
    assert updated["notes"] == ""


def test_optimize_prompt():
    payload = {
        "task": {
            "title": "Build FastAPI integration",
            "description": "Expose endpoints and proxy Vite requests",
            "type": "feature",
            "status": "in-progress",
            "assignee": "Teammate A",
            "context": "Connecting React client to FastAPI.",
        },
        "persona": "speed_run",
        "targetModelId": "cursor",
        "includeArchitecture": True,
        "includeConstraints": True,
    }
    res = client.post("/api/optimize-prompt", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "prompt" in data
    assert "Cursor Composer" in data["prompt"]
    assert "Speed Run" in data["prompt"]


if __name__ == "__main__":
    test_health()
    test_tasks_crud()
    test_anchors_crud()
    test_optimize_prompt()
    print("[SUCCESS] All FastAPI backend integration tests passed successfully!")
