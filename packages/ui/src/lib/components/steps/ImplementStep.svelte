<script lang="ts">
  import { workflowStore } from '../../stores/workflow';

  $: workflow = $workflowStore;
</script>

<div class="step-content implement-step">
  <header class="step-header">
    <h2>Implement</h2>
    <p class="step-description">Watch Claude execute the plan in real-time.</p>
  </header>

  <div class="placeholder-content">
    <div class="placeholder-icon">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </div>
    <p class="placeholder-text">
      Implementation step coming soon. This will show the Kanban board with tasks moving from Planned → In Progress → Verifying → Done.
    </p>
  </div>

  <div class="step-actions">
    <button class="btn btn-secondary" on:click={() => workflowStore.goToStep('plan')}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back to Plan
    </button>
    <button class="btn btn-primary" on:click={() => workflowStore.advanceStep()}>
      Continue to Review
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </div>
</div>

<style>
  .step-content {
    padding: var(--space-lg);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .implement-step {
    max-width: none;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
    max-width: 400px;
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
