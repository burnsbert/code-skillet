<script lang="ts">
  import Sidebar from './lib/components/Sidebar.svelte';
  import Dashboard from './routes/Dashboard.svelte';
  import Settings from './routes/Settings.svelte';
  import { wsStore } from './lib/stores/websocket';

  let currentView: 'dashboard' | 'settings' = 'dashboard';

  $: connected = $wsStore.connected;
</script>

<div class="app">
  <Sidebar
    bind:currentView
    {connected}
  />

  <main class="main-content">
    {#if currentView === 'dashboard'}
      <Dashboard />
    {:else if currentView === 'settings'}
      <Settings />
    {/if}
  </main>
</div>

<style>
  .app {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
