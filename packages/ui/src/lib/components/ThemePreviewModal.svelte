<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Task, TaskPhase } from '../types';
  import { PHASE_LABELS } from '../types';

  export let open = false;

  const dispatch = createEventDispatcher<{ close: void }>();

  // Sample tasks for preview - 3 columns shown
  const previewTasks: Task[] = [
    // Planned
    { id: 'p1', title: 'Add user authentication', phase: 'planned' },
    { id: 'p2', title: 'Design settings page', phase: 'planned' },
    { id: 'p3', title: 'Write integration tests', phase: 'planned' },
    // In Progress - only one task at a time
    { id: 'ip1', title: 'Implement API endpoints', phase: 'in_progress', startedAt: new Date(Date.now() - 5 * 60000).toISOString() },
    // Done
    { id: 'd1', title: 'Set up project structure', phase: 'done', completedAt: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: 'd2', title: 'Configure build tools', phase: 'done', completedAt: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: 'd3', title: 'Create database schema', phase: 'done', completedAt: new Date(Date.now() - 20 * 60000).toISOString() },
  ];

  // The active task ID - the one being worked on right now
  const activeTaskId = 'ip1';

  // Columns to show in preview
  const previewPhases: TaskPhase[] = ['planned', 'in_progress', 'done'];

  function getTasksByPhase(phase: TaskPhase): Task[] {
    return previewTasks.filter((t) => t.phase === phase);
  }

  function getPhaseColor(phase: TaskPhase): string {
    switch (phase) {
      case 'planned': return '#3b82f6';
      case 'in_progress': return '#f97316';
      case 'done': return '#22c55e';
      default: return '#6b7280';
    }
  }

  function formatTime(isoString?: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getElapsedTime(startedAt?: string): string {
    if (!startedAt) return '';
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - start) / 1000);

    if (elapsed < 60) return `${elapsed}s`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m`;
    return `${Math.floor(elapsed / 3600)}h ${Math.floor((elapsed % 3600) / 60)}m`;
  }

  function handleClose() {
    dispatch('close');
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if open}
  <div class="modal-backdrop" on:click={handleBackdropClick} role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h2 id="modal-title">Theme Preview</h2>
        <button class="close-button" on:click={handleClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="preview-description">
          Preview showing sample tasks. The highlighted card shows an <strong>active task</strong> being worked on.
        </p>

        <div class="preview-kanban">
          {#each previewPhases as phase}
            {@const phaseTasks = getTasksByPhase(phase)}
            <div class="preview-column">
              <div class="column-header">
                <div class="column-indicator" style="background-color: {getPhaseColor(phase)}"></div>
                <span class="column-title">{PHASE_LABELS[phase]}</span>
                <span class="column-count">{phaseTasks.length}</span>
              </div>
              <div class="column-content">
                {#each phaseTasks as task (task.id)}
                  <div class="task-card" class:active={task.id === activeTaskId}>
                    <div class="task-title">{task.title}</div>
                    {#if task.agent || task.startedAt || task.completedAt}
                      <div class="task-meta">
                        {#if task.agent}
                          <span class="task-agent">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            </svg>
                            {task.agent}
                          </span>
                        {/if}
                        {#if task.startedAt && !task.completedAt}
                          <span class="task-time">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {getElapsedTime(task.startedAt)}
                          </span>
                        {/if}
                        {#if task.completedAt}
                          <span class="task-completed">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {formatTime(task.completedAt)}
                          </span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={handleClose}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.15s ease;
  }

  .close-button:hover {
    color: var(--text-primary);
    background-color: var(--bg-hover);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-lg);
  }

  .preview-description {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: var(--space-lg);
  }

  .preview-kanban {
    display: flex;
    gap: var(--space-md);
    overflow-x: auto;
    padding-bottom: var(--space-sm);
  }

  .preview-column {
    flex: 1;
    min-width: 200px;
    max-width: 280px;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
  }

  .column-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--border-color);
  }

  .column-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .column-title {
    font-weight: 600;
    font-size: 12px;
    flex: 1;
  }

  .column-count {
    font-size: 11px;
    color: var(--text-muted);
    background-color: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 9999px;
  }

  .column-content {
    padding: var(--space-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  /* Task card - duplicated from TaskCard for self-contained preview */
  .task-card {
    position: relative;
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--space-sm) var(--space-md);
    transition: all 0.15s ease;
  }

  .task-card:hover {
    border-color: var(--card-hover-border, var(--accent-primary));
    box-shadow: var(--card-hover-shadow, var(--shadow-sm));
  }

  /* Active task styling inherited from themes.css */

  .task-title {
    font-size: 12px;
    line-height: 1.4;
    margin-bottom: var(--space-xs);
  }

  .task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    font-size: 10px;
    color: var(--text-muted);
  }

  .task-agent,
  .task-time,
  .task-completed {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .task-agent {
    color: var(--accent-secondary);
  }

  .task-time {
    color: var(--accent-warning);
  }

  .task-completed {
    color: var(--accent-success);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-md) var(--space-lg);
    border-top: 1px solid var(--border-color);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--border-radius);
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
  }

  .btn-secondary {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
</style>
