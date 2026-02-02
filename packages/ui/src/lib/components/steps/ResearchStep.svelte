<script lang="ts">
  import { workflowStore } from '../../stores/workflow';

  $: workflow = $workflowStore;
</script>

<div class="step-content">
  <header class="step-header">
    <h2>Research</h2>
    <p class="step-description">Claude researches the codebase and story requirements.</p>
  </header>

  <div class="placeholder-content">
    <div class="placeholder-icon">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
    <p class="placeholder-text">
      Research step coming soon. Claude will analyze the project and ask clarifying questions.
    </p>
    {#if workflow.projectPath}
      <p class="project-context">
        Project: <code>{workflow.projectPath}</code>
      </p>
    {/if}
  </div>

  <div class="step-actions">
    <button class="btn btn-secondary" on:click={() => workflowStore.goToStep('define')}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back
    </button>
    <button class="btn btn-primary" on:click={() => workflowStore.advanceStep()}>
      Continue to Plan
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
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
