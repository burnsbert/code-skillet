<script lang="ts">
  import WorkflowNav from './WorkflowNav.svelte';

  export let showSettings: boolean = false;
  export let onToggleSettings: () => void = () => {};
  export let onCloseSettings: () => void = () => {};
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <a href="/" class="logo-link">
      <h1 class="logo-text" data-text="CodeSkillet"><span class="logo-code">Code</span><span class="logo-skillet">Skillet</span></h1>
      <p class="tagline">"<span class="tagline-let-it">let it</span> <span class="tagline-cook">cook</span>"</p>
    </a>
  </div>

  <WorkflowNav onStepClick={onCloseSettings} />

  <div class="sidebar-footer">
    <button class="settings-btn" class:active={showSettings} on:click={onToggleSettings}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
      Settings
    </button>
  </div>
</aside>


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

  .sidebar-footer {
    margin-top: auto;
    padding: var(--space-sm);
    border-top: 1px solid var(--border-color);
  }

  .settings-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--border-radius);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .settings-btn:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  .settings-btn.active {
    background-color: var(--bg-tertiary);
    color: var(--accent-primary);
  }
</style>
