<script lang="ts">
  import { projectsStore } from '../stores/projects';
  import type { Plan } from '../types';
  import { marked } from 'marked';

  export let plan: Plan;

  let isEditing = false;
  let editContent = plan.content;

  function handleEdit() {
    editContent = plan.content;
    isEditing = true;
  }

  function handleSave() {
    projectsStore.editPlan(editContent);
    isEditing = false;
  }

  function handleCancel() {
    editContent = plan.content;
    isEditing = false;
  }

  function renderMarkdown(content: string): string {
    return marked(content, { async: false }) as string;
  }
</script>

<div class="plan-approval">
  <div class="plan-header">
    <div class="plan-info">
      <h2>Implementation Plan</h2>
      <span class="plan-status" data-status={plan.status}>
        {plan.status.replace('_', ' ')}
      </span>
    </div>
    <div class="plan-actions">
      {#if !isEditing}
        <button class="btn btn-secondary" on:click={handleEdit}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        <button class="btn btn-danger" on:click={() => projectsStore.rejectPlan()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Reject
        </button>
        <button class="btn btn-success" on:click={() => projectsStore.approvePlan()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Approve
        </button>
      {:else}
        <button class="btn btn-secondary" on:click={handleCancel}>Cancel</button>
        <button class="btn btn-primary" on:click={handleSave}>Save Changes</button>
      {/if}
    </div>
  </div>

  <div class="plan-content">
    {#if isEditing}
      <textarea
        class="plan-editor"
        bind:value={editContent}
        spellcheck="false"
      ></textarea>
    {:else}
      <div class="plan-preview">
        {@html renderMarkdown(plan.content)}
      </div>
    {/if}
  </div>
</div>

<style>
  .plan-approval {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    overflow: hidden;
  }

  .plan-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
  }

  .plan-info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .plan-info h2 {
    font-size: 16px;
    font-weight: 600;
  }

  .plan-status {
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .plan-status[data-status="draft"] {
    background-color: var(--bg-secondary);
    color: var(--text-muted);
  }

  .plan-status[data-status="awaiting_approval"] {
    background-color: var(--accent-warning);
    color: black;
  }

  .plan-status[data-status="approved"] {
    background-color: var(--accent-success);
    color: white;
  }

  .plan-status[data-status="rejected"] {
    background-color: var(--accent-error);
    color: white;
  }

  .plan-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .plan-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-lg);
  }

  .plan-editor {
    width: 100%;
    height: 100%;
    min-height: 400px;
    padding: var(--space-md);
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.6;
    resize: none;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-card);
    color: var(--text-primary);
  }

  .plan-editor:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  .plan-preview {
    font-size: 14px;
    line-height: 1.7;
  }

  .plan-preview :global(h1) {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--border-color);
  }

  .plan-preview :global(h2) {
    font-size: 18px;
    font-weight: 600;
    margin-top: var(--space-lg);
    margin-bottom: var(--space-sm);
  }

  .plan-preview :global(h3) {
    font-size: 15px;
    font-weight: 600;
    margin-top: var(--space-md);
    margin-bottom: var(--space-xs);
  }

  .plan-preview :global(p) {
    margin-bottom: var(--space-sm);
  }

  .plan-preview :global(ul),
  .plan-preview :global(ol) {
    margin-bottom: var(--space-sm);
    padding-left: var(--space-lg);
  }

  .plan-preview :global(li) {
    margin-bottom: var(--space-xs);
  }

  .plan-preview :global(code) {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background-color: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .plan-preview :global(pre) {
    background-color: var(--bg-tertiary);
    padding: var(--space-md);
    border-radius: var(--border-radius);
    overflow-x: auto;
    margin-bottom: var(--space-md);
  }

  .plan-preview :global(pre code) {
    background: none;
    padding: 0;
  }

  .plan-preview :global(strong) {
    font-weight: 600;
  }
</style>
