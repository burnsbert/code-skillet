import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import type {
  HotSkilletContext,
  HotSkilletPhase,
  PhaseStatus,
  HotSkilletTask,
  ReviewConcern,
  HotSkilletQuestion,
  HotSkilletLearning,
  WorkflowImplementFile,
  WorkflowCodeReviewFile,
  QuestionsFile,
  LearningsFile,
} from '../types.js';

const HOT_SKILLET_DIR = '.hot-skillet';

// ============================================================================
// Path Helpers
// ============================================================================

export function getHotSkilletDir(projectPath: string): string {
  return join(projectPath, HOT_SKILLET_DIR);
}

export function getStoryDir(projectPath: string, storyId: string): string {
  return join(getHotSkilletDir(projectPath), storyId);
}

export function getContextPath(projectPath: string, storyId: string): string {
  return join(getStoryDir(projectPath, storyId), 'context.json');
}

export function getQuestionsPath(projectPath: string, storyId: string): string {
  return join(getStoryDir(projectPath, storyId), 'questions.json');
}

export function getResearchPath(projectPath: string, storyId: string): string {
  return join(getStoryDir(projectPath, storyId), 'research.md');
}

export function getPlanPath(projectPath: string, storyId: string): string {
  return join(getStoryDir(projectPath, storyId), 'plan.md');
}

export function getWorkflowImplementPath(projectPath: string, storyId: string): string {
  return join(getStoryDir(projectPath, storyId), 'workflow-implement.json');
}

export function getWorkflowCodeReviewPath(projectPath: string, storyId: string): string {
  return join(getStoryDir(projectPath, storyId), 'workflow-code-review.json');
}

export function getLearningsPath(projectPath: string, storyId: string): string {
  return join(getStoryDir(projectPath, storyId), 'learnings.json');
}

// ============================================================================
// Story ID Generation
// ============================================================================

export function generateStoryId(storySource: { type: string; value: string }): string {
  if (storySource.type === 'jira') {
    // Use Jira ticket ID directly (e.g., "PROJ-123")
    return storySource.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  } else if (storySource.type === 'file') {
    // Extract filename without extension
    const filename = storySource.value.split('/').pop() || 'project';
    return filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  } else if (storySource.type === 'url') {
    // Try to extract meaningful part from URL
    try {
      const url = new URL(storySource.value);
      const slug = url.pathname.split('/').filter(Boolean).pop() || 'url-project';
      return slug.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    } catch {
      return 'url-project';
    }
  } else {
    // For text, use first few words + timestamp
    const words = storySource.value.trim().split(/\s+/).slice(0, 3);
    const slug = words.join('-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().substring(0, 30);
    const timestamp = Date.now();
    return `${slug}-${timestamp}`;
  }
}

// ============================================================================
// context.json Operations
// ============================================================================

export async function initializeContext(
  projectPath: string,
  storySource: { type: 'file' | 'url' | 'jira' | 'text'; value: string },
  storyId?: string
): Promise<HotSkilletContext> {
  const id = storyId || generateStoryId(storySource);
  const storyDir = getStoryDir(projectPath, id);

  // Create directory structure
  await mkdir(storyDir, { recursive: true });

  const now = new Date().toISOString();
  const context: HotSkilletContext = {
    storyId: id,
    storySource,
    phase: 'define',
    phaseStatus: 'in_progress',
    createdAt: now,
    updatedAt: now,
  };

  await writeContext(projectPath, id, context);

  // Initialize empty files
  await writeQuestions(projectPath, id, { questions: [] });
  await writeLearnings(projectPath, id, { learnings: [] });

  return context;
}

export async function readContext(projectPath: string, storyId: string): Promise<HotSkilletContext | null> {
  const contextPath = getContextPath(projectPath, storyId);

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

export async function writeContext(
  projectPath: string,
  storyId: string,
  context: HotSkilletContext
): Promise<void> {
  const contextPath = getContextPath(projectPath, storyId);
  const storyDir = dirname(contextPath);

  await mkdir(storyDir, { recursive: true });
  context.updatedAt = new Date().toISOString();
  await writeFile(contextPath, JSON.stringify(context, null, 2), 'utf-8');
}

export async function updateContext(
  projectPath: string,
  storyId: string,
  updates: Partial<HotSkilletContext>
): Promise<HotSkilletContext | null> {
  const context = await readContext(projectPath, storyId);
  if (!context) {
    return null;
  }

  const updated = { ...context, ...updates };
  await writeContext(projectPath, storyId, updated);
  return updated;
}

export async function updatePhase(
  projectPath: string,
  storyId: string,
  phase: HotSkilletPhase,
  status: PhaseStatus
): Promise<HotSkilletContext | null> {
  return updateContext(projectPath, storyId, { phase, phaseStatus: status });
}

// ============================================================================
// questions.json Operations
// ============================================================================

export async function readQuestions(projectPath: string, storyId: string): Promise<QuestionsFile | null> {
  const path = getQuestionsPath(projectPath, storyId);
  if (!existsSync(path)) {
    return null;
  }
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as QuestionsFile;
  } catch {
    return null;
  }
}

export async function writeQuestions(projectPath: string, storyId: string, data: QuestionsFile): Promise<void> {
  const path = getQuestionsPath(projectPath, storyId);
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

export async function addQuestion(
  projectPath: string,
  storyId: string,
  question: Omit<HotSkilletQuestion, 'id'>
): Promise<HotSkilletQuestion> {
  const data = await readQuestions(projectPath, storyId) || { questions: [] };
  const id = `Q${data.questions.length + 1}`;
  const newQuestion: HotSkilletQuestion = { id, ...question };
  data.questions.push(newQuestion);
  await writeQuestions(projectPath, storyId, data);
  return newQuestion;
}

export async function answerQuestion(
  projectPath: string,
  storyId: string,
  questionId: string,
  answer: string
): Promise<HotSkilletQuestion | null> {
  const data = await readQuestions(projectPath, storyId);
  if (!data) return null;

  const question = data.questions.find(q => q.id === questionId);
  if (!question) return null;

  question.answer = answer;
  question.answeredAt = new Date().toISOString();
  await writeQuestions(projectPath, storyId, data);
  return question;
}

// ============================================================================
// research.md Operations
// ============================================================================

export async function writeResearch(projectPath: string, storyId: string, content: string): Promise<void> {
  const path = getResearchPath(projectPath, storyId);
  await writeFile(path, content, 'utf-8');
}

export async function readResearch(projectPath: string, storyId: string): Promise<string | null> {
  const path = getResearchPath(projectPath, storyId);
  if (!existsSync(path)) {
    return null;
  }
  return readFile(path, 'utf-8');
}

// ============================================================================
// plan.md Operations
// ============================================================================

export async function writePlan(projectPath: string, storyId: string, content: string): Promise<void> {
  const path = getPlanPath(projectPath, storyId);
  await writeFile(path, content, 'utf-8');
}

export async function readPlan(projectPath: string, storyId: string): Promise<string | null> {
  const path = getPlanPath(projectPath, storyId);
  if (!existsSync(path)) {
    return null;
  }
  return readFile(path, 'utf-8');
}

// ============================================================================
// workflow-implement.json Operations
// ============================================================================

export async function readWorkflowImplement(projectPath: string, storyId: string): Promise<WorkflowImplementFile | null> {
  const path = getWorkflowImplementPath(projectPath, storyId);
  if (!existsSync(path)) {
    return null;
  }
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as WorkflowImplementFile;
  } catch {
    return null;
  }
}

export async function writeWorkflowImplement(projectPath: string, storyId: string, data: WorkflowImplementFile): Promise<void> {
  const path = getWorkflowImplementPath(projectPath, storyId);
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

export async function initializeWorkflowImplement(
  projectPath: string,
  storyId: string,
  tasks: HotSkilletTask[]
): Promise<WorkflowImplementFile> {
  const data: WorkflowImplementFile = {
    activeTask: null,
    tasks,
  };
  await writeWorkflowImplement(projectPath, storyId, data);
  return data;
}

export async function updateTask(
  projectPath: string,
  storyId: string,
  taskId: string,
  updates: Partial<HotSkilletTask>
): Promise<HotSkilletTask | null> {
  const data = await readWorkflowImplement(projectPath, storyId);
  if (!data) return null;

  const task = data.tasks.find(t => t.id === taskId);
  if (!task) return null;

  Object.assign(task, updates);
  await writeWorkflowImplement(projectPath, storyId, data);
  return task;
}

export async function setActiveTask(
  projectPath: string,
  storyId: string,
  taskId: string | null
): Promise<void> {
  const data = await readWorkflowImplement(projectPath, storyId);
  if (!data) return;

  data.activeTask = taskId;
  await writeWorkflowImplement(projectPath, storyId, data);
}

// ============================================================================
// workflow-code-review.json Operations
// ============================================================================

export async function readWorkflowCodeReview(projectPath: string, storyId: string): Promise<WorkflowCodeReviewFile | null> {
  const path = getWorkflowCodeReviewPath(projectPath, storyId);
  if (!existsSync(path)) {
    return null;
  }
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as WorkflowCodeReviewFile;
  } catch {
    return null;
  }
}

export async function writeWorkflowCodeReview(projectPath: string, storyId: string, data: WorkflowCodeReviewFile): Promise<void> {
  const path = getWorkflowCodeReviewPath(projectPath, storyId);
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

export async function initializeWorkflowCodeReview(
  projectPath: string,
  storyId: string,
  concerns: ReviewConcern[]
): Promise<WorkflowCodeReviewFile> {
  const data: WorkflowCodeReviewFile = {
    activeConcern: null,
    concerns,
  };
  await writeWorkflowCodeReview(projectPath, storyId, data);
  return data;
}

export async function updateConcern(
  projectPath: string,
  storyId: string,
  concernId: string,
  updates: Partial<ReviewConcern>
): Promise<ReviewConcern | null> {
  const data = await readWorkflowCodeReview(projectPath, storyId);
  if (!data) return null;

  const concern = data.concerns.find(c => c.id === concernId);
  if (!concern) return null;

  Object.assign(concern, updates);
  await writeWorkflowCodeReview(projectPath, storyId, data);
  return concern;
}

export async function setActiveConcern(
  projectPath: string,
  storyId: string,
  concernId: string | null
): Promise<void> {
  const data = await readWorkflowCodeReview(projectPath, storyId);
  if (!data) return;

  data.activeConcern = concernId;
  await writeWorkflowCodeReview(projectPath, storyId, data);
}

// ============================================================================
// learnings.json Operations
// ============================================================================

export async function readLearnings(projectPath: string, storyId: string): Promise<LearningsFile | null> {
  const path = getLearningsPath(projectPath, storyId);
  if (!existsSync(path)) {
    return null;
  }
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as LearningsFile;
  } catch {
    return null;
  }
}

export async function writeLearnings(projectPath: string, storyId: string, data: LearningsFile): Promise<void> {
  const path = getLearningsPath(projectPath, storyId);
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

export async function addLearning(
  projectPath: string,
  storyId: string,
  learning: Omit<HotSkilletLearning, 'id' | 'capturedAt'>
): Promise<HotSkilletLearning> {
  const data = await readLearnings(projectPath, storyId) || { learnings: [] };
  const id = `L${data.learnings.length + 1}`;
  const newLearning: HotSkilletLearning = {
    id,
    ...learning,
    capturedAt: new Date().toISOString(),
  };
  data.learnings.push(newLearning);
  await writeLearnings(projectPath, storyId, data);
  return newLearning;
}

// ============================================================================
// Discovery
// ============================================================================

export async function findStories(projectPath: string): Promise<string[]> {
  const hsDir = getHotSkilletDir(projectPath);
  if (!existsSync(hsDir)) {
    return [];
  }

  const entries = await readdir(hsDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

export async function findActiveStory(projectPath: string): Promise<HotSkilletContext | null> {
  const storyIds = await findStories(projectPath);

  let mostRecent: HotSkilletContext | null = null;
  let mostRecentTime = 0;

  for (const storyId of storyIds) {
    const context = await readContext(projectPath, storyId);
    if (context && context.phase !== 'complete') {
      const time = new Date(context.updatedAt).getTime();
      if (time > mostRecentTime) {
        mostRecentTime = time;
        mostRecent = context;
      }
    }
  }

  return mostRecent;
}
