<script lang="ts">
  import { projectsStore } from '../stores/projects';
  import type { Project } from '../types';

  $: projects = $projectsStore.projects;
  $: currentProjectId = $projectsStore.currentProjectId;

  function getPhaseColor(phase: Project['phase']): string {
    switch (phase) {
      case 'idle': return 'var(--text-muted)';
      case 'planning': return 'var(--accent-secondary)';
      case 'in_progress': return 'var(--accent-warning)';
      case 'verifying': return 'var(--accent-primary)';
      case 'done': return 'var(--accent-success)';
      default: return 'var(--text-muted)';
    }
  }

  function getPhaseLabel(phase: Project['phase']): string {
    switch (phase) {
      case 'idle': return 'Idle';
      case 'planning': return 'Planning';
      case 'in_progress': return 'In Progress';
      case 'verifying': return 'Verifying';
      case 'done': return 'Done';
      default: return phase;
    }
  }
</script>

<div class="project-list">
  {#if projects.length === 0}
    <div class="empty-state">
      <p>No projects yet</p>
      <p class="text-muted">Create a project to get started</p>
    </div>
  {:else}
    {#each projects as project (project.id)}
      <button
        class="project-item"
        class:active={currentProjectId === project.id}
        on:click={() => projectsStore.selectProject(project.id)}
      >
        <div class="project-info">
          <span class="project-name truncate">{project.name}</span>
          <span class="project-phase" style="color: {getPhaseColor(project.phase)}">
            {getPhaseLabel(project.phase)}
          </span>
        </div>
        <div class="project-tasks">
          <span class="task-count">
            {project.tasks.filter(t => t.phase === 'done').length}/{project.tasks.length}
          </span>
        </div>
      </button>
    {/each}
  {/if}
</div>

<style>
  .project-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .empty-state {
    padding: var(--space-md);
    text-align: center;
    font-size: 13px;
  }

  .project-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--border-radius);
    text-align: left;
    transition: all 0.15s ease;
  }

  .project-item:hover {
    background-color: var(--bg-hover);
  }

  .project-item.active {
    background-color: var(--bg-tertiary);
  }

  .project-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .project-name {
    font-size: 13px;
    color: var(--text-primary);
  }

  .project-phase {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .project-tasks {
    flex-shrink: 0;
  }

  .task-count {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }
</style>
