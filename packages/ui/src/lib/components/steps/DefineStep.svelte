<script lang="ts">
  import { workflowStore } from '../../stores/workflow';

  let projectPath = '';
  let storyType: 'file' | 'url' | 'jira' | 'write' = 'file';
  let storyValue = '';
  let isLoading = false;
  let storyError = '';

  // Load recent projects from localStorage
  let recentProjects: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('code-skillet-recent-projects');
      if (stored) {
        recentProjects = JSON.parse(stored);
      }
    } catch {
      // Ignore errors
    }
  }

  function saveRecentProject(path: string) {
    if (!path) return;
    recentProjects = [path, ...recentProjects.filter((p) => p !== path)].slice(0, 10);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('code-skillet-recent-projects', JSON.stringify(recentProjects));
      } catch {
        // Ignore errors
      }
    }
  }

  async function handleCommitStory() {
    if (!projectPath.trim()) return;

    storyError = '';
    isLoading = true;

    try {
      // TODO: Implement actual story loading logic
      // For now, simulate loading and always succeed
      await new Promise(resolve => setTimeout(resolve, 500));

      // If we get here, story loading was successful
      saveRecentProject(projectPath);
      workflowStore.setProjectDefinition(projectPath, storyValue ? { type: storyType, value: storyValue } : null);
      workflowStore.advanceStep();
    } catch (err) {
      storyError = err instanceof Error ? err.message : 'Story not found';
    } finally {
      isLoading = false;
    }
  }

  function handleSelectRecent(path: string) {
    projectPath = path;
    storyError = '';
  }

  function removeRecentProject(path: string, e: MouseEvent) {
    e.stopPropagation();
    recentProjects = recentProjects.filter((p) => p !== path);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('code-skillet-recent-projects', JSON.stringify(recentProjects));
      } catch {
        // Ignore errors
      }
    }
  }

  function getProjectName(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
  }

  $: canCommit = projectPath.trim().length > 0 && !isLoading;
</script>

<div class="step-content">
  <header class="step-header">
    <h2>Define Your Project</h2>
    <p class="step-description">Choose the project folder and provide the story details.</p>
  </header>

  <div class="form-section">
    <div class="form-group">
      <label class="form-label" for="project-path">Project Directory</label>
      <input
        id="project-path"
        type="text"
        class="input"
        placeholder="/path/to/your/project"
        bind:value={projectPath}
      />
    </div>

    {#if recentProjects.length > 0}
      <div class="recent-section">
        <span class="recent-label">Recent:</span>
        <div class="recent-chips">
          {#each recentProjects.slice(0, 5) as recent}
            <button class="recent-chip" on:click={() => handleSelectRecent(recent)}>
              {getProjectName(recent)}
              <button
                class="chip-remove"
                on:click={(e) => removeRecentProject(recent, e)}
                aria-label="Remove"
              >
                ×
              </button>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <div class="form-group">
      <span class="form-label">Story Source</span>
      <div class="story-type-tabs">
        <button class="tab" class:active={storyType === 'file'} on:click={() => (storyType = 'file')}>
          File
        </button>
        <button class="tab" class:active={storyType === 'url'} on:click={() => (storyType = 'url')}>
          URL
        </button>
        <button class="tab" class:active={storyType === 'jira'} on:click={() => (storyType = 'jira')}>
          Jira
        </button>
        <button class="tab" class:active={storyType === 'write'} on:click={() => (storyType = 'write')}>
          Write
        </button>
      </div>
      {#if storyType === 'write'}
        <textarea
          class="input textarea"
          placeholder="Describe what you want to build or change..."
          bind:value={storyValue}
          rows="12"
        ></textarea>
      {:else}
        <input
          type="text"
          class="input"
          placeholder={storyType === 'file'
            ? 'story.md or path/to/story.md'
            : storyType === 'url'
              ? 'https://...'
              : 'PROJ-123'}
          bind:value={storyValue}
        />
      {/if}

      {#if storyError}
        <div class="error-message">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {storyError}
        </div>
      {/if}

      <button class="btn btn-primary commit-btn" disabled={!canCommit} on:click={handleCommitStory}>
        {#if isLoading}
          Loading...
        {:else}
          Start Research
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        {/if}
      </button>
    </div>
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

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .form-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .input {
    padding: var(--space-md);
    font-size: 14px;
    font-family: var(--font-mono);
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-primary);
    transition: border-color 0.15s ease;
  }

  .input:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  .input::placeholder {
    color: var(--text-muted);
  }

  .textarea {
    resize: vertical;
    min-height: 200px;
    font-family: var(--font-sans, system-ui, sans-serif);
    line-height: 1.5;
  }

  .form-hint {
    font-size: 12px;
    color: var(--text-muted);
  }

  .recent-section {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin-top: calc(-1 * var(--space-sm));
  }

  .recent-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .recent-chips {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
  }

  .recent-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-size: 12px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 9999px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .recent-chip:hover {
    background-color: var(--bg-hover);
    border-color: var(--accent-primary);
    color: var(--text-primary);
  }

  .chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    font-size: 14px;
    line-height: 1;
    color: var(--text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .chip-remove:hover {
    color: var(--accent-error);
    background-color: rgba(244, 67, 54, 0.1);
  }

  .story-type-tabs {
    display: flex;
    gap: 2px;
    background-color: var(--bg-tertiary);
    border-radius: var(--border-radius);
    padding: 2px;
  }

  .tab {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    font-size: 13px;
    font-weight: 500;
    border-radius: calc(var(--border-radius) - 2px);
    color: var(--text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab:hover {
    color: var(--text-primary);
  }

  .tab.active {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid var(--accent-error);
    border-radius: var(--border-radius);
    color: var(--accent-error);
    font-size: 13px;
  }

  .commit-btn {
    margin-top: var(--space-md);
    align-self: flex-start;
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

  .btn-primary:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
