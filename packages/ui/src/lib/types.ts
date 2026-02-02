export type TaskPhase = 'planned' | 'in_progress' | 'verifying' | 'done' | 'learnings';

export interface Task {
  id: string;
  title: string;
  phase: TaskPhase;
  agent?: string;
  startedAt?: string;
  completedAt?: string;
}

export type PlanStatus = 'draft' | 'awaiting_approval' | 'approved' | 'rejected';

export interface Plan {
  content: string;
  status: PlanStatus;
  updatedAt: string;
}

export type ProjectPhase = 'idle' | 'planning' | 'in_progress' | 'verifying' | 'done';

export interface Project {
  id: string;
  name: string;
  story: string;
  phase: ProjectPhase;
  currentTask: string | null;
  tasks: Task[];
  plan: Plan | null;
  startedAt: string;
  updatedAt: string;
  log: LogEntry[];
}

export interface LogEntry {
  timestamp: string;
  message: string;
}

// WebSocket message types
export type ServerMessage =
  | { type: 'project:update'; project: Project }
  | { type: 'project:list'; projects: Project[] }
  | { type: 'task:moved'; projectId: string; taskId: string; fromPhase: TaskPhase; toPhase: TaskPhase }
  | { type: 'plan:ready'; projectId: string; plan: string }
  | { type: 'terminal:output'; data: string }
  | { type: 'error'; message: string }
  | { type: 'session:started'; projectPath: string }
  | { type: 'session:ended'; exitCode: number; reason: string }
  | { type: 'session:error'; message: string }
  | { type: 'session:status'; status: SessionStatus; projectPath: string | null };

// Session status type
export type SessionStatus = 'idle' | 'starting' | 'running' | 'stopped' | 'crashed';

export type ClientMessage =
  | { type: 'project:subscribe'; projectId: string }
  | { type: 'project:unsubscribe'; projectId: string }
  | { type: 'project:create'; name: string; story: string }
  | { type: 'project:start-demo'; projectId: string }
  | { type: 'demo:start' }
  | { type: 'plan:approve'; projectId: string }
  | { type: 'plan:reject'; projectId: string }
  | { type: 'plan:edit'; projectId: string; content: string }
  | { type: 'terminal:input'; data: string }
  | { type: 'terminal:resize'; cols: number; rows: number }
  | { type: 'session:start'; projectPath: string; skipPermissions: boolean; cols?: number; rows?: number }
  | { type: 'session:stop' };

export const PHASE_LABELS: Record<TaskPhase, string> = {
  planned: 'Planned Tasks',
  in_progress: 'In Progress',
  verifying: 'Verifying',
  done: 'Done',
  learnings: 'Learnings',
};

export const PHASE_ORDER: TaskPhase[] = ['planned', 'in_progress', 'verifying', 'done', 'learnings'];

// ============================================================================
// Hot Skillet Types
// ============================================================================

export type HotSkilletStage = 'define' | 'research' | 'plan' | 'implement' | 'review' | 'report';

export type StageStatus = 'pending' | 'in_progress' | 'waiting_user' | 'complete';

export type HotSkilletTaskStatus = 'pending' | 'in_progress' | 'verifying' | 'complete' | 'blocked';

export type ConcernStatus = 'pending' | 'investigating' | 'fixed' | 'dismissed';

export type ConcernSeverity = 'bug' | 'critical' | 'important' | 'minor';

export interface Question {
  id: string;
  question: string;
  context?: string;
  answer?: string;
}

export interface ResearchFindings {
  storyType: 'fe-only' | 'be-only' | 'full-stack' | 'bug-fix';
  summary: string;
  patterns: Array<{
    name: string;
    file: string;
    description: string;
  }>;
  testCoverage: {
    typesWithTests: string[];
    typesWithoutTests: string[];
  };
  unansweredQuestions: Question[];
}

export interface HotSkilletTask {
  id: string;
  title: string;
  description: string;
  difficulty: number; // 1-10
  status: HotSkilletTaskStatus;
  agent?: string;
  startedAt?: string;
  completedAt?: string;
  retryCount?: number;
  blockedReason?: string;
  unblockGuidance?: string; // User guidance when unblocking a task
}

export interface ReviewConcern {
  id: string;
  title: string;
  severity: ConcernSeverity;
  status: ConcernStatus;
  file: string;
  line?: number;
  description: string;
  suggestedFix?: string;
  resolution?: string;
}

export interface HotSkilletReport {
  summary: string;
  tasksCompleted: number;
  tasksFailed: number;
  concernsFixed: number;
  concernsDismissed: number;
  filesChanged: number;
  testsPassed: boolean;
  commitMessage?: string;
}

export interface HotSkilletContext {
  projectId: string;
  projectPath: string;
  stage: HotSkilletStage;
  stageStatus: StageStatus;
  storySource: {
    type: 'file' | 'url' | 'jira' | 'text';
    value: string;
  };
  storyContent?: string;
  branch?: string;
  baseBranch?: string;
  research?: ResearchFindings;
  questions?: Question[];
  plan?: string;
  tasks?: HotSkilletTask[];
  concerns?: ReviewConcern[];
  report?: HotSkilletReport;
  planRejectionFeedback?: string; // User feedback when plan is rejected
  createdAt: string;
  updatedAt: string;
}

// Hot Skillet Task Phase Labels (for Kanban)
export const HS_TASK_STATUS_LABELS: Record<HotSkilletTaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  verifying: 'Verifying',
  complete: 'Complete',
  blocked: 'Blocked',
};

export const HS_TASK_STATUS_ORDER: HotSkilletTaskStatus[] = ['pending', 'in_progress', 'verifying', 'complete', 'blocked'];

// Hot Skillet Concern Status Labels (for Review Kanban)
export const HS_CONCERN_STATUS_LABELS: Record<ConcernStatus, string> = {
  pending: 'Pending',
  investigating: 'Investigating',
  fixed: 'Fixed',
  dismissed: 'Dismissed',
};

export const HS_CONCERN_STATUS_ORDER: ConcernStatus[] = ['pending', 'investigating', 'fixed', 'dismissed'];
