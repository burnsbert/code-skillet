import chokidar from 'chokidar';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import type { Project } from './types.js';

export interface FileWatcherOptions {
  directory: string;
  onProjectUpdate: (project: Project) => void;
}

export function createFileWatcher(options: FileWatcherOptions): chokidar.FSWatcher {
  const { directory, onProjectUpdate } = options;

  const watcher = chokidar.watch(`${directory}/.skillet-*.md`, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  watcher.on('add', async (path) => {
    console.log(`[watcher] New project file: ${basename(path)}`);
    await parseAndNotify(path, onProjectUpdate);
  });

  watcher.on('change', async (path) => {
    console.log(`[watcher] Project file changed: ${basename(path)}`);
    await parseAndNotify(path, onProjectUpdate);
  });

  watcher.on('unlink', (path) => {
    console.log(`[watcher] Project file removed: ${basename(path)}`);
  });

  watcher.on('error', (error) => {
    console.error('[watcher] Error:', error);
  });

  return watcher;
}

async function parseAndNotify(
  path: string,
  onProjectUpdate: (project: Project) => void
): Promise<void> {
  try {
    const content = await readFile(path, 'utf-8');
    const project = parseProjectFile(content, path);
    if (project) {
      onProjectUpdate(project);
    }
  } catch (err) {
    console.error(`[watcher] Failed to parse ${path}:`, err);
  }
}

function parseProjectFile(content: string, path: string): Project | null {
  // Extract project ID from filename: .skillet-{id}.md
  const filename = basename(path);
  const match = filename.match(/\.skillet-(.+)\.md$/);
  if (!match) return null;

  const id = match[1];

  // Parse markdown sections
  const sections = parseMarkdownSections(content);

  const name = extractTitle(content) || id;
  const story = sections['Story'] || '';
  const phase = parsePhase(sections['Status']);
  const tasks = parseTasks(sections['Tasks']);
  const plan = sections['Plan'] ? { content: sections['Plan'], status: 'draft' as const, updatedAt: new Date().toISOString() } : null;
  const log = parseLog(sections['Log']);

  return {
    id,
    name,
    story,
    phase,
    currentTask: null,
    tasks,
    plan,
    startedAt: log[0]?.timestamp || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    log,
  };
}

function parseMarkdownSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = content.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = headerMatch[1];
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+Project:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function parsePhase(statusSection: string | undefined): Project['phase'] {
  if (!statusSection) return 'idle';
  const match = statusSection.match(/Phase:\s*(\w+)/);
  if (!match) return 'idle';
  const phase = match[1].toLowerCase();
  if (['idle', 'planning', 'in_progress', 'verifying', 'done'].includes(phase)) {
    return phase as Project['phase'];
  }
  return 'idle';
}

function parseTasks(tasksSection: string | undefined): Project['tasks'] {
  if (!tasksSection) return [];
  const tasks: Project['tasks'] = [];
  const lines = tasksSection.split('\n');
  let taskId = 0;

  for (const line of lines) {
    const match = line.match(/^-\s+\[([ x])\]\s+(.+?)(?:\s+\[phase:(\w+)\])?$/);
    if (match) {
      const completed = match[1] === 'x';
      const title = match[2].trim();
      const phase = match[3] as Project['tasks'][0]['phase'] || (completed ? 'done' : 'backlog');
      tasks.push({
        id: `task-${++taskId}`,
        title,
        phase,
      });
    }
  }

  return tasks;
}

function parseLog(logSection: string | undefined): Project['log'] {
  if (!logSection) return [];
  const entries: Project['log'] = [];
  const lines = logSection.split('\n');

  for (const line of lines) {
    const match = line.match(/^-\s+(\d{2}:\d{2}:\d{2})\s+-\s+(.+)$/);
    if (match) {
      const today = new Date().toISOString().split('T')[0];
      entries.push({
        timestamp: `${today}T${match[1]}.000Z`,
        message: match[2].trim(),
      });
    }
  }

  return entries;
}
