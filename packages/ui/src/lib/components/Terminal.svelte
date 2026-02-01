<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Terminal } from '@xterm/xterm';
  import { FitAddon } from '@xterm/addon-fit';
  import { Unicode11Addon } from '@xterm/addon-unicode11';
  import { CanvasAddon } from '@xterm/addon-canvas';
    import '@xterm/xterm/css/xterm.css';
  import { sessionStore } from '../stores/session';

  export let interactive: boolean = true;
  export let onResizeStart: ((e: MouseEvent) => void) | null = null;

  let terminalContainer: HTMLElement;
  let terminal: Terminal;
  let fitAddon: FitAddon;
  let lastOutputLength = 0;
  let resizeObserver: ResizeObserver;

  // Get reactive output from session store
  $: terminalOutput = $sessionStore.terminalOutput;
  $: sessionStatus = $sessionStore.status; // Used for clearing terminal on session start

  // Track previous status to detect session start
  let prevStatus = 'idle';

  onMount(() => {
    terminal = new Terminal({
      // Use actual font names - xterm.js can't resolve CSS variables
      // Platform-specific fonts with good Unicode block character support:
      // - macOS: Menlo, Monaco
      // - Windows: Cascadia Mono (Win Terminal), Consolas
      // - Linux: DejaVu Sans Mono, Liberation Mono, Ubuntu Mono
      fontFamily: 'Menlo, Monaco, "Cascadia Mono", "DejaVu Sans Mono", "Liberation Mono", "Ubuntu Mono", Consolas, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1,
      letterSpacing: 0,
      customGlyphs: true,  // Pixel-perfect block/box drawing (requires Canvas/WebGL renderer)
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#c9d1d9',
        cursorAccent: '#0d1117',
        selectionBackground: '#3392FF44',
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
      cursorBlink: false,
      cursorStyle: 'block',
      scrollback: 5000,
      convertEol: true,
      allowProposedApi: true,
    });

    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Load Unicode11 addon for proper character width handling (box-drawing, emojis)
    const unicode11Addon = new Unicode11Addon();
    terminal.loadAddon(unicode11Addon);
    terminal.unicode.activeVersion = '11';

    terminal.open(terminalContainer);

    fitAddon.fit();

    // Load Canvas addon AFTER open() and fit() - needs real container dimensions
    // Canvas addon supports customGlyphs for pixel-perfect block characters
    try {
      terminal.loadAddon(new CanvasAddon());
      fitAddon.fit();
      terminal.refresh(0, terminal.rows - 1);
    } catch (e) {
      console.warn('Canvas addon failed, using DOM renderer:', e);
    }

    // Handle keyboard input
    if (interactive) {
      terminal.onData((data: string) => {
        sessionStore.sendInput(data);
      });
    }

    // Handle resize
    resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      // Send resize event to server
      const { cols, rows } = terminal;
      sessionStore.resize(cols, rows);
    });
    resizeObserver.observe(terminalContainer);

    // Send initial size
    const { cols, rows } = terminal;
    sessionStore.resize(cols, rows);
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
    terminal?.dispose();
  });

  // Watch for output changes and write new content
  $: {
    if (terminal && terminalOutput.length > lastOutputLength) {
      const newContent = terminalOutput.slice(lastOutputLength);
      terminal.write(newContent);
      lastOutputLength = terminalOutput.length;
    }
  }

  // Clear terminal when a new session starts
  $: if (sessionStatus === 'running' && prevStatus !== 'running') {
    terminal?.clear();
    lastOutputLength = 0;
  }
  $: prevStatus = sessionStatus;

  // Reset output tracking when terminal is cleared
  $: if (terminalOutput.length === 0 && lastOutputLength > 0) {
    lastOutputLength = 0;
    terminal?.clear();
  }

  function handleClear() {
    terminal?.clear();
    sessionStore.clearTerminal();
    lastOutputLength = 0;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="terminal-wrapper">
  <div
    class="terminal-header"
    class:resizable={onResizeStart}
    on:mousedown={onResizeStart}
  >
    <span class="terminal-title">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
      Terminal
    </span>

    <!-- Chunky resize grip -->
    {#if onResizeStart}
      <div class="resize-grip">
        <span></span>
        <span></span>
        <span></span>
      </div>
    {/if}

    <div class="terminal-actions">
      <button class="terminal-btn" on:click|stopPropagation={handleClear} title="Clear terminal">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
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
    padding: 4px var(--space-md);
    background-color: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }

  .terminal-header.resizable {
    cursor: ns-resize;
  }

  .terminal-header.resizable:hover {
    background-color: var(--bg-hover);
  }

  .terminal-title {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .resize-grip {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 2px 24px;
  }

  .resize-grip span {
    display: block;
    width: 24px;
    height: 2px;
    background-color: var(--border-color);
    border-radius: 1px;
    transition: background-color 0.15s ease;
  }

  .terminal-header.resizable:hover .resize-grip span {
    background-color: var(--text-muted);
  }

  .terminal-actions {
    display: flex;
    gap: var(--space-xs);
  }

  .terminal-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
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
    height: 100%;
    min-height: 200px;
    padding: var(--space-sm);
  }

  .terminal-container :global(.xterm) {
    height: 100%;
  }

  .terminal-container :global(.xterm-viewport) {
    overflow-y: auto !important;
  }
</style>
