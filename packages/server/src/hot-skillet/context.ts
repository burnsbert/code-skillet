import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import type {
  HotSkilletContext,
  HotSkilletStage,
  StageStatus,
  HotSkilletTask,
  ReviewConcern,
  ResearchFindings,
  Question,
  HotSkilletReport,
} from '../types.js';

const HOT_SKILLET_DIR = '.hot-skillet';

/**
 * Get the path to the Hot Skillet directory for a project
 */
export function getHotSkilletDir(projectPath: string): string {
  return join(projectPath, HOT_SKILLET_DIR);
}

/**
 * Get the path to a specific project's Hot Skillet data
 */
export function getProjectDir(projectPath: string, projectId: string): string {
  return join(getHotSkilletDir(projectPath), projectId);
}

/**
 * Get the path to the context.json file
 */
export function getContextPath(projectPath: string, projectId: string): string {
  return join(getProjectDir(projectPath, projectId), 'context.json');
}

/**
 * Generate a project ID from story source
 */
export function generateProjectId(storySource: { type: string; value: string }): string {
  const timestamp = Date.now();
  let slug = 'project';

  if (storySource.type === 'jira') {
    // Use Jira ticket ID directly
    slug = storySource.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  } else if (storySource.type === 'file') {
    // Extract filename without extension
    const filename = storySource.value.split('/').pop() || 'project';
    slug = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  } else if (storySource.type === 'url') {
    // Try to extract meaningful part from URL
    try {
      const url = new URL(storySource.value);
      slug = url.pathname.split('/').filter(Boolean).pop() || 'url-project';
      slug = slug.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    } catch {
      slug = 'url-project';
    }
  } else {
    // For text, use first few words
    const words = storySource.value.trim().split(/\s+/).slice(0, 3);
    slug = words.join('-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().substring(0, 30);
  }

  return `${slug}-${timestamp}`;
}

/**
 * Initialize a new Hot Skillet context
 */
export async function initializeContext(
  projectPath: string,
  storySource: { type: 'file' | 'url' | 'jira' | 'text'; value: string },
  storyContent?: string
): Promise<HotSkilletContext> {
  const projectId = generateProjectId(storySource);
  const projectDir = getProjectDir(projectPath, projectId);

  // Create directory structure
  await mkdir(projectDir, { recursive: true });

  const now = new Date().toISOString();
  const context: HotSkilletContext = {
    projectId,
    projectPath,
    stage: 'define',
    stageStatus: 'in_progress',
    storySource,
    storyContent,
    createdAt: now,
    updatedAt: now,
  };

  // Write context.json
  await writeContext(projectPath, projectId, context);

  // Write story.md if we have content
  if (storyContent) {
    await writeStoryFile(projectPath, projectId, storyContent);
  }

  return context;
}

/**
 * Read the context file for a project
 */
export async function readContext(projectPath: string, projectId: string): Promise<HotSkilletContext | null> {
  const contextPath = getContextPath(projectPath, projectId);

  if (!existsSync(contextPath)) {
    return null;
  }

  try {
    const content = await readFile(contextPath, 'utf-8');
    return JSON.parse(content) as HotSkilletContext;
  } catch (error) {
    console.error(`Error reading context file: ${error}`);
    return null;
  }
}

/**
 * Write the context file for a project
 */
export async function writeContext(
  projectPath: string,
  projectId: string,
  context: HotSkilletContext
): Promise<void> {
  const contextPath = getContextPath(projectPath, projectId);
  const projectDir = dirname(contextPath);

  // Ensure directory exists
  await mkdir(projectDir, { recursive: true });

  // Update timestamp
  context.updatedAt = new Date().toISOString();

  await writeFile(contextPath, JSON.stringify(context, null, 2), 'utf-8');
}

/**
 * Update specific fields in the context
 */
export async function updateContext(
  projectPath: string,
  projectId: string,
  updates: Partial<HotSkilletContext>
): Promise<HotSkilletContext | null> {
  const context = await readContext(projectPath, projectId);
  if (!context) {
    return null;
  }

  const updated = { ...context, ...updates };
  await writeContext(projectPath, projectId, updated);
  return updated;
}

/**
 * Update stage and status
 */
export async function updateStage(
  projectPath: string,
  projectId: string,
  stage: HotSkilletStage,
  status: StageStatus
): Promise<HotSkilletContext | null> {
  return updateContext(projectPath, projectId, { stage, stageStatus: status });
}

// ============================================================================
// Markdown File Operations
// ============================================================================

/**
 * Write the story.md file
 */
export async function writeStoryFile(
  projectPath: string,
  projectId: string,
  content: string
): Promise<void> {
  const filePath = join(getProjectDir(projectPath, projectId), 'story.md');
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Read the story.md file
 */
export async function readStoryFile(
  projectPath: string,
  projectId: string
): Promise<string | null> {
  const filePath = join(getProjectDir(projectPath, projectId), 'story.md');
  if (!existsSync(filePath)) {
    return null;
  }
  return readFile(filePath, 'utf-8');
}

/**
 * Write the research.md file
 */
export async function writeResearchFile(
  projectPath: string,
  projectId: string,
  content: string
): Promise<void> {
  const filePath = join(getProjectDir(projectPath, projectId), 'research.md');
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Read the research.md file
 */
export async function readResearchFile(
  projectPath: string,
  projectId: string
): Promise<string | null> {
  const filePath = join(getProjectDir(projectPath, projectId), 'research.md');
  if (!existsSync(filePath)) {
    return null;
  }
  return readFile(filePath, 'utf-8');
}

/**
 * Write the plan.md file
 */
export async function writePlanFile(
  projectPath: string,
  projectId: string,
  content: string
): Promise<void> {
  const filePath = join(getProjectDir(projectPath, projectId), 'plan.md');
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Read the plan.md file
 */
export async function readPlanFile(
  projectPath: string,
  projectId: string
): Promise<string | null> {
  const filePath = join(getProjectDir(projectPath, projectId), 'plan.md');
  if (!existsSync(filePath)) {
    return null;
  }
  return readFile(filePath, 'utf-8');
}

/**
 * Write the tasks.json file
 */
export async function writeTasksFile(
  projectPath: string,
  projectId: string,
  tasks: HotSkilletTask[]
): Promise<void> {
  const filePath = join(getProjectDir(projectPath, projectId), 'tasks.json');
  await writeFile(filePath, JSON.stringify(tasks, null, 2), 'utf-8');
}

/**
 * Read the tasks.json file
 */
export async function readTasksFile(
  projectPath: string,
  projectId: string
): Promise<HotSkilletTask[] | null> {
  const filePath = join(getProjectDir(projectPath, projectId), 'tasks.json');
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as HotSkilletTask[];
  } catch {
    return null;
  }
}

/**
 * Write the review.md file
 */
export async function writeReviewFile(
  projectPath: string,
  projectId: string,
  content: string
): Promise<void> {
  const filePath = join(getProjectDir(projectPath, projectId), 'review.md');
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Read the review.md file
 */
export async function readReviewFile(
  projectPath: string,
  projectId: string
): Promise<string | null> {
  const filePath = join(getProjectDir(projectPath, projectId), 'review.md');
  if (!existsSync(filePath)) {
    return null;
  }
  return readFile(filePath, 'utf-8');
}

/**
 * Write the report.md file
 */
export async function writeReportFile(
  projectPath: string,
  projectId: string,
  content: string
): Promise<void> {
  const filePath = join(getProjectDir(projectPath, projectId), 'report.md');
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Read the report.md file
 */
export async function readReportFile(
  projectPath: string,
  projectId: string
): Promise<string | null> {
  const filePath = join(getProjectDir(projectPath, projectId), 'report.md');
  if (!existsSync(filePath)) {
    return null;
  }
  return readFile(filePath, 'utf-8');
}

// ============================================================================
// Discovery
// ============================================================================

/**
 * Find all Hot Skillet projects in a directory
 */
export async function findProjects(projectPath: string): Promise<string[]> {
  const hsDir = getHotSkilletDir(projectPath);
  if (!existsSync(hsDir)) {
    return [];
  }

  const { readdir } = await import('fs/promises');
  const entries = await readdir(hsDir, { withFileTypes: true });

  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

/**
 * Find the most recent active Hot Skillet project
 */
export async function findActiveProject(projectPath: string): Promise<HotSkilletContext | null> {
  const projectIds = await findProjects(projectPath);

  let mostRecent: HotSkilletContext | null = null;
  let mostRecentTime = 0;

  for (const projectId of projectIds) {
    const context = await readContext(projectPath, projectId);
    if (context && context.stage !== 'report') {
      const time = new Date(context.updatedAt).getTime();
      if (time > mostRecentTime) {
        mostRecentTime = time;
        mostRecent = context;
      }
    }
  }

  return mostRecent;
}
