<script lang="ts">
  import { projectsStore } from '../lib/stores/projects';
  import { settingsStore } from '../lib/stores/settings';
  import KanbanBoard from '../lib/components/KanbanBoard.svelte';
  import PlanApproval from '../lib/components/PlanApproval.svelte';
  import Terminal from '../lib/components/Terminal.svelte';
  import EmptyState from '../lib/components/EmptyState.svelte';

  $: project = $projectsStore.currentProject;
  $: settings = $settingsStore;
  $: terminalOutput = $projectsStore.terminalOutput;
</script>

<div class="dashboard">
  {#if !project}
    <EmptyState />
  {:else}
    <header class="dashboard-header">
      <div class="project-info">
        <h1>{project.name}</h1>
        <p class="story">{project.story}</p>
      </div>
      <div class="actions">
        {#if project.phase === 'idle'}
          <button class="btn btn-primary" on:click={() => projectsStore.startDemo()}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Demo
          </button>
        {:else}
          <span class="phase-badge" data-phase={project.phase}>
            {project.phase.replace('_', ' ')}
          </span>
        {/if}
      </div>
    </header>

    <div class="dashboard-content">
      <div class="main-area">
        {#if project.plan?.status === 'awaiting_approval'}
          <PlanApproval plan={project.plan} />
        {:else}
          <KanbanBoard tasks={project.tasks} />
        {/if}
      </div>

      {#if settings.terminalVisible}
        <div class="terminal-area" style="height: {settings.terminalHeight}px">
          <Terminal output={terminalOutput} />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .dashboard-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-lg);
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }

  .project-info h1 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: var(--space-xs);
  }

  .story {
    color: var(--text-secondary);
    font-size: 14px;
    max-width: 600px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-shrink: 0;
  }

  .phase-badge {
    display: inline-flex;
    align-items: center;
    padding: var(--space-xs) var(--space-md);
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .phase-badge[data-phase="planning"] {
    background-color: var(--accent-secondary);
    color: white;
  }

  .phase-badge[data-phase="in_progress"] {
    background-color: var(--accent-warning);
    color: black;
  }

  .phase-badge[data-phase="verifying"] {
    background-color: var(--accent-primary);
    color: white;
  }

  .phase-badge[data-phase="done"] {
    background-color: var(--accent-success);
    color: white;
  }

  .dashboard-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .main-area {
    flex: 1;
    overflow: hidden;
    padding: var(--space-md);
  }

  .terminal-area {
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;
    min-height: 100px;
  }
</style>
