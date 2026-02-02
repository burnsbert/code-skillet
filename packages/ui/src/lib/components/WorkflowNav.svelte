<script lang="ts">
  import { workflowStore, stepStatus } from '../stores/workflow';

  export let onStepClick: () => void = () => {};

  $: steps = $stepStatus;

  function handleStepClick(stepId: string, isClickable: boolean) {
    if (isClickable) {
      workflowStore.goToStep(stepId as any);
      onStepClick();
    }
  }
</script>

<nav class="workflow-nav">
  <ol class="step-list">
    {#each steps as step}
      <li class="step-item">
        <button
          class="step-button"
          class:current={step.isCurrent}
          class:completed={step.isCompleted}
          class:future={step.isFuture}
          disabled={!step.isClickable}
          on:click={() => handleStepClick(step.id, step.isClickable)}
        >
          <span class="step-number">{step.number}</span>
          <span class="step-label">{step.label}</span>
          {#if step.isCompleted}
            <svg class="check-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          {/if}
        </button>
      </li>
    {/each}
  </ol>
</nav>

<style>
  .workflow-nav {
    flex: 1;
    padding: var(--space-sm);
  }

  .step-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .step-item {
    margin: 0;
  }

  .step-button {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--border-radius);
    text-align: left;
    transition: all 0.15s ease;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .step-button:not(:disabled):hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  .step-button.current {
    background-color: var(--bg-tertiary);
    color: var(--accent-primary);
  }

  .step-button.completed {
    color: var(--text-secondary);
  }

  .step-button.completed:hover {
    color: var(--text-primary);
  }

  .step-button.future {
    color: var(--text-muted);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    background-color: var(--bg-tertiary);
    flex-shrink: 0;
  }

  .step-button.current .step-number {
    background-color: var(--accent-primary);
    color: white;
  }

  .step-button.completed .step-number {
    background-color: var(--accent-success);
    color: white;
  }

  .step-button.future .step-number {
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
  }

  .step-label {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
  }

  .check-icon {
    color: var(--accent-success);
    flex-shrink: 0;
  }
</style>
