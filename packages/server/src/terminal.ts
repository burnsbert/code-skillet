import * as pty from 'node-pty';
import { platform } from 'os';

export interface TerminalSession {
  pid: number;
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
  onData: (callback: (data: string) => void) => void;
  onExit: (callback: (exitCode: number) => void) => void;
}

export interface TerminalOptions {
  cols?: number;
  rows?: number;
  cwd?: string;
  env?: Record<string, string>;
}

const shell = platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';

export function createTerminal(options: TerminalOptions = {}): TerminalSession {
  const { cols = 80, rows = 24, cwd = process.cwd(), env = process.env as Record<string, string> } = options;

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env,
  });

  const dataCallbacks: ((data: string) => void)[] = [];
  const exitCallbacks: ((exitCode: number) => void)[] = [];

  ptyProcess.onData((data) => {
    dataCallbacks.forEach((cb) => cb(data));
  });

  ptyProcess.onExit(({ exitCode }) => {
    exitCallbacks.forEach((cb) => cb(exitCode));
  });

  return {
    pid: ptyProcess.pid,
    write: (data: string) => ptyProcess.write(data),
    resize: (cols: number, rows: number) => ptyProcess.resize(cols, rows),
    kill: () => ptyProcess.kill(),
    onData: (callback) => dataCallbacks.push(callback),
    onExit: (callback) => exitCallbacks.push(callback),
  };
}
