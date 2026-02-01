<script lang="ts">
  import type { Task, TaskPhase } from '../types';
  import { PHASE_LABELS, PHASE_ORDER } from '../types';
  import TaskCard from './TaskCard.svelte';
  import Sortable from 'sortablejs';
  import { onMount } from 'svelte';

  export let tasks: Task[];

  let columnRefs: Record<string, HTMLElement> = {};

  function getTasksByPhase(phase: TaskPhase): Task[] {
    return tasks.filter((t) => t.phase === phase);
  }

  // Universal workflow colors - not theme-dependent
  // Chosen for intuitive meaning:
  // - Planned: Blue (queued, ready, calm)
  // - In Progress: Orange (active, hot, attention - like construction)
  // - Verifying: Cyan (analytical, inspection, quality check)
  // - Done: Green (universal success/completion)
  // - Learnings: Purple (wisdom, insights, knowledge gained)
  function getPhaseColor(phase: TaskPhase): string {
    switch (phase) {
      case 'planned': return '#3b82f6';     // Blue
      case 'in_progress': return '#f97316'; // Orange
      case 'verifying': return '#06b6d4';   // Cyan
      case 'done': return '#22c55e';        // Green
      case 'learnings': return '#a855f7';   // Purple
      default: return '#6b7280';
    }
  }

  onMount(() => {
    // Initialize Sortable on each column
    // Note: In V1, drag-drop is visual only (mock mode doesn't persist manual moves)
    PHASE_ORDER.forEach((phase) => {
      const el = columnRefs[phase];
      if (el) {
        Sortable.create(el, {
          group: 'tasks',
          animation: 150,
          ghostClass: 'task-ghost',
          dragClass: 'task-drag',
          onEnd: (evt) => {
            // In V1, we don't persist manual drag operations
            // The demo workflow controls task movement
            console.log('Drag ended:', evt.item.dataset.taskId, 'to', evt.to.dataset.phase);
          },
        });
      }
    });
  });
</script>

<div class="kanban-board">
  {#each PHASE_ORDER as phase}
    {@const phaseTasks = getTasksByPhase(phase)}
    <div class="kanban-column">
      <div class="column-header">
        <div class="column-indicator" style="background-color: {getPhaseColor(phase)}"></div>
        <span class="column-title">{PHASE_LABELS[phase]}</span>
        <span class="column-count">{phaseTasks.length}</span>
      </div>
      <div
        class="column-content"
        data-phase={phase}
        bind:this={columnRefs[phase]}
      >
        {#each phaseTasks as task (task.id)}
          <TaskCard {task} />
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .kanban-board {
    display: flex;
    gap: var(--space-md);
    height: 100%;
    overflow-x: auto;
    padding-bottom: var(--space-md);
  }

  .kanban-column {
    flex: 1;
    min-width: 220px;
    max-width: 300px;
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
    padding: var(--space-md);
    border-bottom: 1px solid var(--border-color);
  }

  .column-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .column-title {
    font-weight: 600;
    font-size: 13px;
    flex: 1;
  }

  .column-count {
    font-size: 12px;
    color: var(--text-muted);
    background-color: var(--bg-tertiary);
    padding: 2px 8px;
    border-radius: 9999px;
  }

  .column-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    min-height: 100px;
  }

  /* Sortable styles */
  :global(.task-ghost) {
    opacity: 0.4;
  }

  :global(.task-drag) {
    opacity: 0.8;
  }
</style>
