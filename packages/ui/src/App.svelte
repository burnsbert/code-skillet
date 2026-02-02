<script lang="ts">
  import Sidebar from './lib/components/Sidebar.svelte';
  import Terminal from './lib/components/Terminal.svelte';
  import Settings from './routes/Settings.svelte';
  import DefineStep from './lib/components/steps/DefineStep.svelte';
  import ResearchStep from './lib/components/steps/ResearchStep.svelte';
  import PlanStep from './lib/components/steps/PlanStep.svelte';
  import ImplementStep from './lib/components/steps/ImplementStep.svelte';
  import ReviewStep from './lib/components/steps/ReviewStep.svelte';
  import ReportStep from './lib/components/steps/ReportStep.svelte';
  import { settingsStore } from './lib/stores/settings';
  import { workflowStore } from './lib/stores/workflow';

  $: settings = $settingsStore;
  $: workflow = $workflowStore;

  let showSettings = false;

  function toggleSettings() {
    showSettings = !showSettings;
  }

  function closeSettings() {
    showSettings = false;
  }

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
  <Sidebar {showSettings} onToggleSettings={toggleSettings} onCloseSettings={closeSettings} />

  <div class="main-wrapper">
    <main class="main-content">
      {#if showSettings}
        <Settings on:back={closeSettings} />
      {:else if workflow.currentStep === 'define'}
        <DefineStep />
      {:else if workflow.currentStep === 'research'}
        <ResearchStep />
      {:else if workflow.currentStep === 'plan'}
        <PlanStep />
      {:else if workflow.currentStep === 'implement'}
        <ImplementStep />
      {:else if workflow.currentStep === 'review'}
        <ReviewStep />
      {:else if workflow.currentStep === 'report'}
        <ReportStep />
      {/if}
    </main>

    {#if settings.terminalVisible && workflow.currentStep === 'implement' && !showSettings}
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
