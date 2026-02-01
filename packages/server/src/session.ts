import { spawn, IPty } from 'node-pty';
import { EventEmitter } from 'events';
import { homedir } from 'os';
import { resolve } from 'path';

export type SessionStatus = 'idle' | 'starting' | 'running' | 'stopped' | 'crashed';

export interface SessionConfig {
  projectPath: string;
  skipPermissions: boolean;
  cols?: number;
  rows?: number;
}

export interface SessionEvents {
  output: (data: string) => void;
  started: () => void;
  ended: (exitCode: number, reason: string) => void;
  error: (message: string) => void;
  statusChange: (status: SessionStatus) => void;
}

/**
 * Expand tilde (~) in paths to the user's home directory
 */
function expandPath(inputPath: string): string {
  if (inputPath.startsWith('~/')) {
    return resolve(homedir(), inputPath.slice(2));
  }
  if (inputPath === '~') {
    return homedir();
  }
  return resolve(inputPath);
}

/**
 * Manages a single Claude Code PTY session.
 * Only one session can be active at a time.
 */
export class SessionManager extends EventEmitter {
  private pty: IPty | null = null;
  private _status: SessionStatus = 'idle';
  private _projectPath: string | null = null;

  get status(): SessionStatus {
    return this._status;
  }

  get projectPath(): string | null {
    return this._projectPath;
  }

  get isRunning(): boolean {
    return this._status === 'running' || this._status === 'starting';
  }

  private setStatus(status: SessionStatus): void {
    this._status = status;
    this.emit('statusChange', status);
  }

  /**
   * Start a Claude Code session in the specified project directory.
   */
  startSession(config: SessionConfig): void {
    if (this.isRunning) {
      this.emit('error', 'A session is already running');
      return;
    }

    // Expand tilde and resolve the path
    const resolvedPath = expandPath(config.projectPath);
    this._projectPath = resolvedPath;
    this.setStatus('starting');

    try {
      // Build the command arguments
      const args: string[] = [];
      if (config.skipPermissions) {
        args.push('--dangerously-skip-permissions');
      }

      // Determine shell and platform-specific settings
      const shell = process.platform === 'win32' ? 'cmd.exe' : process.env.SHELL || '/bin/bash';
      const isWindows = process.platform === 'win32';

      // Spawn Claude Code via PTY
      // Use interactive login shell to ensure PATH is properly set
      const claudeCommand = isWindows
        ? `claude ${args.join(' ')}`
        : `claude ${args.join(' ')}`;

      // For Unix shells, use -ilc for interactive login shell
      // This ensures the user's profile is loaded (including PATH modifications)
      // Use provided dimensions or sensible defaults
      const cols = config.cols || 120;
      const rows = config.rows || 30;

      this.pty = spawn(shell, isWindows ? ['/c', claudeCommand] : ['-ilc', claudeCommand], {
        name: 'xterm-256color',
        cols,
        rows,
        cwd: resolvedPath,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          // Ensure Claude knows it's in a PTY
          COLORTERM: 'truecolor',
          // Add common local bin paths
          PATH: `${process.env.HOME}/.local/bin:${process.env.HOME}/.nvm/versions/node/v20.19.0/bin:${process.env.PATH}`,
        },
      });

      console.log(`[session] Started Claude Code in ${resolvedPath} (PID: ${this.pty.pid})`);

      // Handle PTY output
      this.pty.onData((data: string) => {
        this.emit('output', data);
      });

      // Handle PTY exit
      this.pty.onExit(({ exitCode, signal }) => {
        const reason = signal
          ? `Terminated by signal ${signal}`
          : exitCode === 0
            ? 'Normal exit'
            : `Exit code ${exitCode}`;

        console.log(`[session] Claude Code exited: ${reason}`);
        console.log(`[session] Exit details - exitCode: ${exitCode}, signal: ${signal}, typeof exitCode: ${typeof exitCode}`);

        this.pty = null;
        this._projectPath = null;
        // SIGTERM (signal 15) is intentional stop, treat as stopped not crashed
        const isStopped = exitCode === 0 || signal === 15;
        this.setStatus(isStopped ? 'stopped' : 'crashed');
        this.emit('ended', exitCode ?? 0, reason);
      });

      this.setStatus('running');
      this.emit('started');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      console.error('[session] Failed to start:', message);
      this.setStatus('crashed');
      this.emit('error', message);
      this._projectPath = null;
    }
  }

  /**
   * Stop the current session.
   */
  stopSession(): void {
    if (!this.pty) {
      this.emit('error', 'No session is running');
      return;
    }

    console.log('[session] Stopping Claude Code session');

    try {
      // Send SIGTERM first for graceful shutdown
      this.pty.kill();
    } catch (err) {
      console.error('[session] Error stopping session:', err);
    }
  }

  /**
   * Write data to the PTY stdin.
   */
  write(data: string): void {
    if (!this.pty) {
      console.warn('[session] Cannot write - no session running');
      return;
    }

    this.pty.write(data);
  }

  /**
   * Resize the PTY.
   */
  resize(cols: number, rows: number): void {
    if (!this.pty) {
      console.warn('[session] Cannot resize - no session running');
      return;
    }

    try {
      this.pty.resize(cols, rows);
    } catch (err) {
      console.error('[session] Error resizing:', err);
    }
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    if (this.pty) {
      try {
        this.pty.kill();
      } catch {
        // Ignore errors during cleanup
      }
      this.pty = null;
    }
    this._projectPath = null;
    this.setStatus('stopped');
    this.removeAllListeners();
  }
}

// Singleton instance
export const sessionManager = new SessionManager();
