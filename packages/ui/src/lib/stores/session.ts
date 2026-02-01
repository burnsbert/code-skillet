import { writable, derived, get } from 'svelte/store';
import type { ServerMessage, SessionStatus } from '../types';
import { wsStore } from './websocket';
import { settingsStore } from './settings';

function createSessionStore() {
  const _status = writable<SessionStatus>('idle');
  const _projectPath = writable<string | null>(null);
  const _terminalOutput = writable<string>('');
  const _lastError = writable<string | null>(null);

  function handleMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'session:status':
        _status.set(message.status);
        _projectPath.set(message.projectPath);
        break;

      case 'session:started':
        _status.set('running');
        _projectPath.set(message.projectPath);
        _lastError.set(null);
        break;

      case 'session:ended':
        // Status is already set correctly by session:status message
        // Don't recalculate - server knows if it was a crash vs intentional stop
        _projectPath.set(null);
        break;

      case 'session:error':
        _lastError.set(message.message);
        break;

      case 'terminal:output':
        _terminalOutput.update((output) => output + message.data);
        break;
    }
  }

  // Subscribe to WebSocket messages
  wsStore.addHandler(handleMessage);

  /**
   * Start a Claude Code session for the given project path.
   * Shows permissions modal if needed, or uses saved preference.
   */
  function startSession(projectPath: string, cols?: number, rows?: number): void {
    const settings = get(settingsStore);

    wsStore.send({
      type: 'session:start',
      projectPath,
      skipPermissions: settings.dangerouslySkipPermissions,
      cols,
      rows,
    });

    _terminalOutput.set(''); // Clear terminal on new session
  }

  /**
   * Stop the current session.
   */
  function stopSession(): void {
    wsStore.send({ type: 'session:stop' });
  }

  /**
   * Send input to the terminal.
   */
  function sendInput(data: string): void {
    wsStore.send({ type: 'terminal:input', data });
  }

  /**
   * Send terminal resize event.
   */
  function resize(cols: number, rows: number): void {
    wsStore.send({ type: 'terminal:resize', cols, rows });
  }

  /**
   * Clear terminal output.
   */
  function clearTerminal(): void {
    _terminalOutput.set('');
  }

  // Combined state for subscription
  const state = derived(
    [_status, _projectPath, _terminalOutput, _lastError],
    ([$status, $projectPath, $terminalOutput, $lastError]) => ({
      status: $status,
      projectPath: $projectPath,
      terminalOutput: $terminalOutput,
      lastError: $lastError,
      isRunning: $status === 'running' || $status === 'starting',
    })
  );

  return {
    subscribe: state.subscribe,
    status: _status,
    projectPath: _projectPath,
    terminalOutput: _terminalOutput,
    lastError: _lastError,
    startSession,
    stopSession,
    sendInput,
    resize,
    clearTerminal,
  };
}

export const sessionStore = createSessionStore();
