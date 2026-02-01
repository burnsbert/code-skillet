<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { projectsStore } from '../stores/projects';

  const dispatch = createEventDispatcher();

  let name = '';
  let story = '';
  let isSubmitting = false;

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!name.trim() || !story.trim()) return;

    isSubmitting = true;
    projectsStore.createProject(name.trim(), story.trim());

    // Close modal after a short delay
    setTimeout(() => {
      dispatch('close');
    }, 100);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      dispatch('close');
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="modal-backdrop" on:click={handleClose} on:keydown={() => {}} role="presentation">
  <div class="modal" on:click|stopPropagation={() => {}} on:keydown={() => {}} role="dialog" aria-modal="true">
    <div class="modal-header">
      <h2>Create New Project</h2>
      <button class="btn-close" on:click={handleClose} aria-label="Close">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <form on:submit={handleSubmit}>
      <div class="modal-body">
        <div class="form-group">
          <label for="project-name">Project Name</label>
          <input
            id="project-name"
            type="text"
            bind:value={name}
            placeholder="e.g., User Authentication Feature"
            required
          />
        </div>

        <div class="form-group">
          <label for="project-story">User Story</label>
          <textarea
            id="project-story"
            bind:value={story}
            placeholder="As a user, I want to..."
            rows="4"
            required
          ></textarea>
          <p class="help-text">Describe what you want to build in user story format</p>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={handleClose}>
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          disabled={!name.trim() || !story.trim() || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  </div>
</div>

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
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow: hidden;
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
    font-size: 16px;
    font-weight: 600;
  }

  .btn-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    color: var(--text-muted);
    transition: all 0.15s ease;
  }

  .btn-close:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  .modal-body {
    padding: var(--space-lg);
  }

  .form-group {
    margin-bottom: var(--space-md);
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    margin-bottom: var(--space-xs);
    font-weight: 500;
    font-size: 13px;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 100px;
  }

  .help-text {
    margin-top: var(--space-xs);
    font-size: 12px;
    color: var(--text-muted);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }
</style>
