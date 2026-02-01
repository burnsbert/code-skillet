<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Terminal } from '@xterm/xterm';
  import { FitAddon } from '@xterm/addon-fit';
  import '@xterm/xterm/css/xterm.css';
  import { projectsStore } from '../stores/projects';

  export let output: string;

  let terminalContainer: HTMLElement;
  let terminal: Terminal;
  let fitAddon: FitAddon;
  let lastOutputLength = 0;

  onMount(() => {
    terminal = new Terminal({
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#c9d1d9',
        black: '#0d1117',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc',
      },
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      convertEol: true,
    });

    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(terminalContainer);
    fitAddon.fit();

    // Write initial welcome message
    terminal.writeln('\x1b[32m╔══════════════════════════════════════╗\x1b[0m');
    terminal.writeln('\x1b[32m║       Code-Skillet Terminal          ║\x1b[0m');
    terminal.writeln('\x1b[32m╚══════════════════════════════════════╝\x1b[0m');
    terminal.writeln('');

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalContainer);

    return () => {
      resizeObserver.disconnect();
    };
  });

  onDestroy(() => {
    terminal?.dispose();
  });

  // Watch for output changes and write new content
  $: {
    if (terminal && output.length > lastOutputLength) {
      const newContent = output.slice(lastOutputLength);
      terminal.write(newContent);
      lastOutputLength = output.length;
    }
  }

  function handleClear() {
    terminal?.clear();
    projectsStore.clearTerminal();
    lastOutputLength = 0;
  }
</script>

<div class="terminal-wrapper">
  <div class="terminal-header">
    <span class="terminal-title">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
      Terminal
    </span>
    <div class="terminal-actions">
      <button class="terminal-btn" on:click={handleClear} title="Clear terminal">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  </div>
  <div class="terminal-container" bind:this={terminalContainer}></div>
</div>

<style>
  .terminal-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--terminal-bg);
  }

  .terminal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xs) var(--space-md);
    background-color: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }

  .terminal-title {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .terminal-actions {
    display: flex;
    gap: var(--space-xs);
  }

  .terminal-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    color: var(--text-muted);
    transition: all 0.15s ease;
  }

  .terminal-btn:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  .terminal-container {
    flex: 1;
    padding: var(--space-sm);
  }

  .terminal-container :global(.xterm) {
    height: 100%;
  }

  .terminal-container :global(.xterm-viewport) {
    overflow-y: auto !important;
  }
</style>
