<script lang="ts">
  import type { Task } from '../types';

  export let task: Task;

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
</script>

<div class="task-card" data-task-id={task.id}>
  <div class="task-title">{task.title}</div>

  {#if task.agent || task.startedAt}
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

<style>
  .task-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--space-sm) var(--space-md);
    cursor: grab;
    transition: all 0.15s ease;
  }

  .task-card:hover {
    border-color: var(--card-hover-border, var(--accent-primary));
    box-shadow: var(--card-hover-shadow, var(--shadow-sm));
  }

  .task-card:active {
    cursor: grabbing;
  }

  .task-title {
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: var(--space-xs);
  }

  .task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    font-size: 11px;
    color: var(--text-muted);
  }

  .task-agent,
  .task-time,
  .task-completed {
    display: inline-flex;
    align-items: center;
    gap: 4px;
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
</style>
