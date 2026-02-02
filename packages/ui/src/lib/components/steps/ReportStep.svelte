<script lang="ts">
  import { workflowStore } from '../../stores/workflow';

  $: workflow = $workflowStore;

  function handleNewProject() {
    workflowStore.reset();
  }
</script>

<div class="step-content">
  <header class="step-header">
    <h2>Final Report</h2>
    <p class="step-description">Summary of completed work and results.</p>
  </header>

  <div class="placeholder-content">
    <div class="placeholder-icon success">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    </div>
    <p class="placeholder-text">
      Final report step coming soon. This will show a summary of all completed tasks, changes made, and any important notes.
    </p>
    {#if workflow.projectPath}
      <p class="project-context">
        Project: <code>{workflow.projectPath}</code>
      </p>
    {/if}
  </div>

  <div class="step-actions">
    <button class="btn btn-secondary" on:click={() => workflowStore.goToStep('review')}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back
    </button>
    <button class="btn btn-primary" on:click={handleNewProject}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      New Project
    </button>
  </div>
</div>

<style>
  .step-content {
    padding: var(--space-lg);
    max-width: 600px;
  }

  .step-header {
    margin-bottom: var(--space-xl);
  }

  .step-header h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: var(--space-xs);
  }

  .step-description {
    color: var(--text-muted);
    font-size: 14px;
  }

  .placeholder-content {
    text-align: center;
    padding: var(--space-xl);
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
    border: 1px dashed var(--border-color);
  }

  .placeholder-icon {
    color: var(--text-muted);
    margin-bottom: var(--space-md);
  }

  .placeholder-icon.success {
    color: var(--accent-success);
  }

  .placeholder-text {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: var(--space-md);
  }

  .project-context {
    font-size: 12px;
    color: var(--text-muted);
  }

  .project-context code {
    font-family: var(--font-mono);
    background-color: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .step-actions {
    margin-top: var(--space-xl);
    display: flex;
    justify-content: space-between;
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

  .btn-primary {
    background-color: var(--accent-primary);
    color: white;
  }

  .btn-primary:hover {
    filter: brightness(1.1);
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
