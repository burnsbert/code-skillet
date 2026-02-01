import { writable, derived, get } from 'svelte/store';
import type { Project, ServerMessage } from '../types';
import { wsStore } from './websocket';

function createProjectsStore() {
  const _projects = writable<Project[]>([]);
  const _currentProjectId = writable<string | null>(null);
  const _terminalOutput = writable<string>('');

  const currentProject = derived(
    [_projects, _currentProjectId],
    ([$projects, $currentProjectId]) => {
      return $projects.find((p) => p.id === $currentProjectId) ?? null;
    }
  );

  function handleMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'project:list':
        _projects.set(message.projects);
        break;

      case 'project:update':
        _projects.update((list) => {
          const index = list.findIndex((p) => p.id === message.project.id);
          if (index >= 0) {
            list[index] = message.project;
            return [...list];
          } else {
            return [...list, message.project];
          }
        });
        // Auto-select if no project is currently selected (e.g., from demo:start)
        if (!get(_currentProjectId)) {
          _currentProjectId.set(message.project.id);
        }
        break;

      case 'task:moved':
        // Task movement is handled via project:update
        break;

      case 'plan:ready':
        // Plan is included in project:update
        break;

      case 'terminal:output':
        _terminalOutput.update((output) => output + message.data);
        break;

      case 'error':
        console.error('[projects] Server error:', message.message);
        break;
    }
  }

  // Subscribe to WebSocket messages
  wsStore.addHandler(handleMessage);

  function selectProject(id: string | null): void {
    const currentId = get(_currentProjectId);

    // Unsubscribe from current project
    if (currentId) {
      wsStore.send({ type: 'project:unsubscribe', projectId: currentId });
    }

    _currentProjectId.set(id);
    _terminalOutput.set('');

    // Subscribe to new project
    if (id) {
      wsStore.send({ type: 'project:subscribe', projectId: id });
    }
  }

  function createProject(name: string, story: string): void {
    wsStore.send({ type: 'project:create', name, story });
  }

  function startDemo(): void {
    const projectId = get(_currentProjectId);
    if (projectId) {
      wsStore.send({ type: 'project:start-demo', projectId });
    }
  }

  function startDemoFromEmpty(): void {
    // Creates a demo project and starts the workflow in one step
    wsStore.send({ type: 'demo:start' });
  }

  function approvePlan(): void {
    const projectId = get(_currentProjectId);
    if (projectId) {
      wsStore.send({ type: 'plan:approve', projectId });
    }
  }

  function rejectPlan(): void {
    const projectId = get(_currentProjectId);
    if (projectId) {
      wsStore.send({ type: 'plan:reject', projectId });
    }
  }

  function editPlan(content: string): void {
    const projectId = get(_currentProjectId);
    if (projectId) {
      wsStore.send({ type: 'plan:edit', projectId, content });
    }
  }

  function clearTerminal(): void {
    _terminalOutput.set('');
  }

  // Combined store for subscription
  const state = derived(
    [_projects, _currentProjectId, _terminalOutput, currentProject],
    ([$projects, $currentProjectId, $terminalOutput, $currentProject]) => ({
      projects: $projects,
      currentProjectId: $currentProjectId,
      terminalOutput: $terminalOutput,
      currentProject: $currentProject,
    })
  );

  return {
    subscribe: state.subscribe,
    projects: _projects,
    currentProjectId: _currentProjectId,
    currentProject,
    terminalOutput: _terminalOutput,
    selectProject,
    createProject,
    startDemo,
    startDemoFromEmpty,
    approvePlan,
    rejectPlan,
    editPlan,
    clearTerminal,
  };
}

export const projectsStore = createProjectsStore();
