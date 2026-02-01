<script lang="ts">
  import { projectsStore } from '../stores/projects';
</script>

<div class="empty-state">
  <div class="empty-content">
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </div>
    <h2>No Project Selected</h2>
    <p>Select a project from the sidebar or create a new one to get started.</p>
    <div class="hints">
      <div class="hint">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Click the <strong>+</strong> button in the sidebar to create a project</span>
      </div>
      <div class="hint">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span>Click <button class="demo-link" on:click={() => projectsStore.startDemoFromEmpty()}>Start Demo</button> to see the workflow in action</span>
      </div>
    </div>
  </div>
</div>

<style>
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: var(--space-xl);
  }

  .empty-content {
    text-align: center;
    max-width: 400px;
  }

  .empty-icon {
    color: var(--text-muted);
    margin-bottom: var(--space-lg);
    opacity: 0.5;
  }

  h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: var(--space-sm);
  }

  p {
    color: var(--text-secondary);
    margin-bottom: var(--space-xl);
  }

  .hints {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    text-align: left;
    background-color: var(--bg-secondary);
    padding: var(--space-md);
    border-radius: var(--border-radius);
  }

  .hint {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: 13px;
    color: var(--text-muted);
  }

  .hint svg {
    flex-shrink: 0;
  }

  .hint strong {
    color: var(--text-primary);
  }

  .demo-link {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-weight: 600;
    color: var(--accent-primary);
    cursor: pointer;
    text-decoration: underline;
  }

  .demo-link:hover {
    color: var(--accent-secondary);
  }
</style>
