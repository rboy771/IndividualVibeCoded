/**
 * VibeTracker REST API Client
 * Provides type-safe fetch bindings to the FastAPI backend with timeout
 * and error propagation for resilient local storage fallbacks.
 */

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Universal fetch wrapper with 4000ms timeout
 */
async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const config = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) errorMessage = errorJson.detail;
      } catch {
        // use default message
      }
      throw new ApiError(errorMessage, response.status);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
export async function checkBackendHealth() {
  return request('/health');
}

// ---------------------------------------------------------------------------
// Tasks Endpoints
// ---------------------------------------------------------------------------
export async function fetchTasks() {
  return request('/tasks');
}

export async function createTask(taskData) {
  return request('/tasks', {
    method: 'POST',
    body: taskData,
  });
}

export async function updateTask(taskId, updates) {
  return request(`/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    body: updates,
  });
}

export async function deleteTask(taskId) {
  return request(`/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
  });
}

export async function resetTasks() {
  return request('/tasks/reset', {
    method: 'POST',
  });
}

// ---------------------------------------------------------------------------
// Anchors Endpoints
// ---------------------------------------------------------------------------
export async function fetchAnchors() {
  return request('/anchors');
}

export async function updateAnchor(anchorId, updates) {
  return request(`/anchors/${encodeURIComponent(anchorId)}`, {
    method: 'PUT',
    body: updates,
  });
}

export async function resetAnchors() {
  return request('/anchors/reset', {
    method: 'POST',
  });
}

// ---------------------------------------------------------------------------
// Prompt Optimizer
// ---------------------------------------------------------------------------
export async function optimizePrompt(payload) {
  return request('/optimize-prompt', {
    method: 'POST',
    body: payload,
  });
}
