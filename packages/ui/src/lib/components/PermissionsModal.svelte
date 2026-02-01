<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { settingsStore } from '../stores/settings';

  export let open: boolean = false;
  export let projectPath: string = '';

  const dispatch = createEventDispatcher<{
    confirm: { skipPermissions: boolean };
    cancel: void;
  }>();

  let skipPermissions = true;
  let rememberChoice = false;

  function handleConfirm() {
    if (rememberChoice) {
      settingsStore.setDangerouslySkipPermissions(skipPermissions);
    }
    dispatch('confirm', { skipPermissions });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="modal-backdrop" on:click={handleBackdropClick} role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header">
        <h2>Start Claude Code Session</h2>
        <button class="close-btn" on:click={handleCancel} aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="project-info">
          <span class="label">Project:</span>
          <code class="project-path">{projectPath}</code>
        </div>

        <div class="permission-section">
          <h3>Permission Mode</h3>
          <p class="description">
            Claude Code normally asks for permission before running commands or editing files.
            For a smoother workflow, you can skip these prompts.
          </p>

          <div class="options">
            <label class="option" class:selected={!skipPermissions}>
              <input
                type="radio"
                name="permissions"
                value="false"
                bind:group={skipPermissions}
                checked={!skipPermissions}
                on:change={() => (skipPermissions = false)}
              />
              <div class="option-content">
                <span class="option-title">Standard Mode</span>
                <span class="option-description">Claude will ask for permission before actions (safer)</span>
              </div>
            </label>

            <label class="option recommended" class:selected={skipPermissions}>
              <input
                type="radio"
                name="permissions"
                value="true"
                bind:group={skipPermissions}
                on:change={() => (skipPermissions = true)}
              />
              <div class="option-content">
                <span class="option-title">
                  Skip Permissions (Recommended)
                </span>
                <span class="option-description">
                  Claude runs commands without asking - smoother workflow for trusted projects
                </span>
              </div>
            </label>
          </div>

          <label class="remember-choice">
            <input type="checkbox" bind:checked={rememberChoice} />
            <span>Remember this choice for future sessions</span>
          </label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={handleCancel}>Cancel</button>
        <button class="btn btn-primary" on:click={handleConfirm}>Start Session</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-lg);
  }

  .modal {
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-color);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h2 {
    font-size: 18px;
    font-weight: 600;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--border-radius);
    color: var(--text-muted);
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  .modal-body {
    padding: var(--space-lg);
  }

  .project-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius);
    margin-bottom: var(--space-lg);
  }

  .project-info .label {
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .project-path {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-primary);
    word-break: break-all;
  }

  .permission-section h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: var(--space-xs);
  }

  .permission-section .description {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: var(--space-md);
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  .option {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-md);
    border-radius: var(--border-radius);
    border: 2px solid var(--border-color);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .option:hover {
    background-color: var(--bg-hover);
  }

  .option.selected {
    border-color: var(--accent-primary);
    background-color: var(--bg-tertiary);
  }

  .option.recommended.selected {
    border-color: var(--accent-success);
  }

  .option.recommended .option-title {
    color: var(--accent-success);
  }

  .option input[type='radio'] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .option-content {
    flex: 1;
  }

  .option-title {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-weight: 500;
    margin-bottom: 2px;
  }


  .option-description {
    font-size: 12px;
    color: var(--text-muted);
  }

  .remember-choice {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .remember-choice input[type='checkbox'] {
    width: 16px;
    height: 16px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-lg);
    border-top: 1px solid var(--border-color);
  }
</style>
