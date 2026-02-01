<script lang="ts">
  import { sessionStore } from '../lib/stores/session';
  import { settingsStore } from '../lib/stores/settings';
  import PermissionsModal from '../lib/components/PermissionsModal.svelte';

  $: session = $sessionStore;
  $: settings = $settingsStore;

  let projectPath = '';
  let showPermissionsModal = false;
  let recentProjects: string[] = [];

  // Load recent projects from localStorage
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

    // Add to front, remove duplicates, limit to 10
    recentProjects = [path, ...recentProjects.filter((p) => p !== path)].slice(0, 10);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('code-skillet-recent-projects', JSON.stringify(recentProjects));
      } catch {
        // Ignore errors
      }
    }
  }

  function handleOpenProject() {
    if (!projectPath.trim()) return;

    // Check if we need to show permissions modal
    if (!settings.dangerouslySkipPermissions) {
      showPermissionsModal = true;
    } else {
      startSession(settings.dangerouslySkipPermissions);
    }
  }

  function handleSelectRecent(path: string) {
    projectPath = path;
    handleOpenProject();
  }

  function handlePermissionsConfirm(e: CustomEvent<{ skipPermissions: boolean }>) {
    showPermissionsModal = false;
    startSession(e.detail.skipPermissions);
  }

  function handlePermissionsCancel() {
    showPermissionsModal = false;
  }

  function startSession(skipPermissions: boolean) {
    saveRecentProject(projectPath);
    sessionStore.startSession(projectPath);
  }

  function handleStopSession() {
    sessionStore.stopSession();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && projectPath.trim()) {
      handleOpenProject();
    }
  }

  function getProjectName(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
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
</script>

<div class="dashboard">
  {#if session.isRunning}
    <!-- Active Session View -->
    <header class="dashboard-header">
      <div class="project-info">
        <h1>{getProjectName(session.projectPath || '')}</h1>
        <code class="project-path">{session.projectPath}</code>
      </div>
      <div class="actions">
        <span class="status-badge" data-status={session.status}>
          {#if session.status === 'running'}
            <span class="status-dot"></span>
          {/if}
          {session.status}
        </span>
        <button class="btn btn-danger btn-sm" on:click={handleStopSession}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
          Stop
        </button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="session-info">
        <p class="info-text">
          Claude Code is running. Use the terminal below to interact with the session.
        </p>
        {#if session.lastError}
          <div class="error-banner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {session.lastError}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Project Selection View -->
    <div class="project-selection">
      <div class="selection-content">
        <div class="logo">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h1>Code-Skillet</h1>
        <p class="subtitle">Real-time visual dashboard for Claude Code</p>

        <div class="input-section">
          <label class="input-label" for="project-path">Project Directory</label>
          <div class="input-row">
            <input
              id="project-path"
              type="text"
              class="input"
              placeholder="/path/to/your/project"
              bind:value={projectPath}
              on:keydown={handleKeydown}
            />
            <button class="btn btn-primary" on:click={handleOpenProject} disabled={!projectPath.trim()}>
              Open Project
            </button>
          </div>
        </div>

        {#if recentProjects.length > 0}
          <div class="recent-section">
            <h3>Recent Directories</h3>
            <ul class="recent-list">
              {#each recentProjects as recent}
                <li>
                  <button class="recent-item" on:click={() => handleSelectRecent(recent)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span class="recent-name">{getProjectName(recent)}</span>
                    <span class="recent-path">{recent}</span>
                    <button
                      class="remove-btn"
                      on:click={(e) => removeRecentProject(recent, e)}
                      aria-label="Remove from recent"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </button>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if session.status === 'crashed'}
          <div class="error-banner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            Session crashed. Check the terminal for details.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<PermissionsModal
  open={showPermissionsModal}
  {projectPath}
  on:confirm={handlePermissionsConfirm}
  on:cancel={handlePermissionsCancel}
/>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Active Session View */
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }

  .project-info {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
    min-width: 0;
  }

  .project-info h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
  }

  .project-info .project-path {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-shrink: 0;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
  }

  .status-badge[data-status='running'] {
    background-color: rgba(59, 185, 80, 0.15);
    color: var(--accent-success);
  }

  .status-badge[data-status='starting'] {
    background-color: rgba(210, 153, 34, 0.15);
    color: var(--accent-warning);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--accent-success);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .btn-danger {
    background-color: var(--accent-error);
    color: white;
  }

  .btn-danger:hover {
    background-color: #d32f2f;
  }

  .dashboard-content {
    flex: 1;
    padding: var(--space-lg);
    overflow: auto;
  }

  .session-info {
    max-width: 600px;
  }

  .info-text {
    color: var(--text-secondary);
    margin-bottom: var(--space-md);
  }

  /* Project Selection View */
  .project-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: var(--space-xl);
    overflow: auto;
  }

  .selection-content {
    text-align: center;
    max-width: 500px;
    width: 100%;
  }

  .logo {
    color: var(--accent-primary);
    margin-bottom: var(--space-md);
  }

  .selection-content h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: var(--space-xs);
  }

  .subtitle {
    color: var(--text-muted);
    margin-bottom: var(--space-xl);
  }

  .input-section {
    text-align: left;
    margin-bottom: var(--space-xl);
  }

  .input-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: var(--space-sm);
  }

  .input-row {
    display: flex;
    gap: var(--space-sm);
  }

  .input {
    flex: 1;
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

  /* Recent Directories */
  .recent-section {
    text-align: left;
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius);
    padding: var(--space-md);
  }

  .recent-section h3 {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    margin-bottom: var(--space-sm);
  }

  .recent-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .recent-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--border-radius);
    text-align: left;
    color: var(--text-primary);
    transition: background-color 0.15s ease;
  }

  .recent-item:hover {
    background-color: var(--bg-hover);
  }

  .recent-item svg {
    flex-shrink: 0;
    color: var(--text-muted);
  }

  .recent-name {
    font-weight: 500;
  }

  .recent-path {
    flex: 1;
    font-size: 12px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--border-radius);
    color: var(--text-muted);
    opacity: 0;
    transition: all 0.15s ease;
  }

  .recent-item:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:hover {
    background-color: var(--bg-tertiary);
    color: var(--accent-error);
  }

  /* Error Banner */
  .error-banner {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid var(--accent-error);
    border-radius: var(--border-radius);
    color: var(--accent-error);
    font-size: 13px;
    margin-top: var(--space-md);
  }

  .error-banner svg {
    flex-shrink: 0;
  }
</style>
