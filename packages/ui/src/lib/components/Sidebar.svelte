<script lang="ts">
  import { projectsStore } from '../stores/projects';
  import ProjectList from './ProjectList.svelte';
  import CreateProjectModal from './CreateProjectModal.svelte';

  export let currentView: 'dashboard' | 'settings';
  export let connected: boolean;

  let showCreateModal = false;
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <a href="/" class="logo-link">
      <h1 class="logo-text" data-text="CodeSkillet"><span class="logo-code">Code</span><span class="logo-skillet">Skillet</span></h1>
      <p class="tagline">"<span class="tagline-let-it">let it</span> <span class="tagline-cook">cook</span>"</p>
    </a>
    <div class="connection-status" class:connected>
      <span class="status-dot"></span>
      <span class="status-text">{connected ? 'Connected' : 'Disconnected'}</span>
    </div>
  </div>

  <nav class="sidebar-nav">
    <button
      class="nav-item"
      class:active={currentView === 'dashboard'}
      on:click={() => (currentView = 'dashboard')}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
      Dashboard
    </button>
    <button
      class="nav-item"
      class:active={currentView === 'settings'}
      on:click={() => (currentView = 'settings')}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
      Settings
    </button>
  </nav>

  <div class="sidebar-section">
    <div class="section-header">
      <span>Projects</span>
      <button class="btn-icon" on:click={() => (showCreateModal = true)} title="New Project">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
    <ProjectList />
  </div>

  <div class="sidebar-footer">
    <span class="version">v0.1.0</span>
  </div>
</aside>

{#if showCreateModal}
  <CreateProjectModal on:close={() => (showCreateModal = false)} />
{/if}

<style>
  .sidebar {
    width: 260px;
    min-width: 260px;
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sidebar-header {
    padding: var(--space-md);
    border-bottom: 1px solid var(--border-color);
    container-type: inline-size;
  }

  .logo-link {
    text-decoration: none;
    display: block;
    margin-bottom: var(--space-sm);
    text-align: center;
  }

  .logo-text {
    font-family: 'Pacifico', cursive;
    font-size: 2.4rem;
    font-weight: 400;
    background: linear-gradient(135deg, var(--logo-gradient-start) 0%, var(--logo-gradient-mid) 50%, var(--logo-gradient-end) 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-shift 3s ease infinite;
    text-shadow: 0 0 30px var(--logo-glow);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    margin: 0;
  }

  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .tagline {
    font-family: var(--font-sans, system-ui, sans-serif);
    font-size: 0.85rem;
    font-weight: 400;
    font-style: italic;
    color: var(--text-muted);
    margin: 0;
    margin-top: -2px;
    letter-spacing: 0.5px;
    opacity: 0.7;
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: 12px;
    color: var(--text-muted);
  }

  .connection-status.connected {
    color: var(--accent-success);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--accent-error);
  }

  .connection-status.connected .status-dot {
    background-color: var(--accent-success);
  }

  .sidebar-nav {
    padding: var(--space-sm);
    border-bottom: 1px solid var(--border-color);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--border-radius);
    color: var(--text-secondary);
    transition: all 0.15s ease;
  }

  .nav-item:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  .nav-item.active {
    background-color: var(--bg-tertiary);
    color: var(--accent-primary);
  }

  .sidebar-section {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-sm);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-sm);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    color: var(--text-muted);
    transition: all 0.15s ease;
  }

  .btn-icon:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  .sidebar-footer {
    padding: var(--space-sm) var(--space-md);
    border-top: 1px solid var(--border-color);
  }

  .version {
    font-size: 11px;
    color: var(--text-muted);
  }
</style>
