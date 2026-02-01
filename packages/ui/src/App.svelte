<script lang="ts">
  import Sidebar from './lib/components/Sidebar.svelte';
  import Dashboard from './routes/Dashboard.svelte';
  import Settings from './routes/Settings.svelte';
  import Terminal from './lib/components/Terminal.svelte';
  import { wsStore } from './lib/stores/websocket';
  import { settingsStore } from './lib/stores/settings';

  let currentView: 'dashboard' | 'settings' = 'dashboard';

  $: connected = $wsStore.connected;
  $: settings = $settingsStore;

  // Terminal resize state
  let isResizing = false;
  let terminalHeight = 200; // Default value

  // Sync with settings store when it's available
  $: if (settings?.terminalHeight !== undefined) {
    terminalHeight = settings.terminalHeight;
  }

  function handleResizeStart(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }

  function handleResizeMove(e: MouseEvent) {
    if (!isResizing) return;

    const windowHeight = window.innerHeight;
    const newHeight = windowHeight - e.clientY;

    // Clamp between 100 and 500px
    terminalHeight = Math.max(100, Math.min(500, newHeight));
  }

  function handleResizeEnd() {
    isResizing = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);

    // Save to settings
    settingsStore.setTerminalHeight(terminalHeight);
  }
</script>

<div class="app" class:resizing={isResizing}>
  <Sidebar bind:currentView {connected} />

  <div class="main-wrapper">
    <main class="main-content">
      {#if currentView === 'dashboard'}
        <Dashboard />
      {:else if currentView === 'settings'}
        <Settings />
      {/if}
    </main>

    {#if settings.terminalVisible && currentView !== 'settings'}
      <div class="terminal-panel" style="height: {terminalHeight}px">
        <Terminal onResizeStart={handleResizeStart} />
      </div>
    {/if}
  </div>
</div>

<style>
  .app {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .app.resizing {
    cursor: ns-resize;
    user-select: none;
  }

  .main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .terminal-panel {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--border-color);
    position: relative;
  }

</style>
