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
  | { type: 'session:status'; status: SessionStatus; projectPath: string | null }
// Hot Skillet server messages
| { type: 'hot-skillet:stage-update'; projectId: string; stage: HotSkilletStage; status: StageStatus }
| { type: 'hot-skillet:research-complete'; projectId: string; findings: ResearchFindings }
| { type: 'hot-skillet:questions-ready'; projectId: string; questions: Question[] }
| { type: 'hot-skillet:plan-ready'; projectId: string; plan: string; tasks: HotSkilletTask[] }
| { type: 'hot-skillet:task-update'; projectId: string; taskId: string; status: HotSkilletTaskStatus }
| { type: 'hot-skillet:concern-update'; projectId: string; concernId: string; status: ConcernStatus }
| { type: 'hot-skillet:review-complete'; projectId: string; concerns: ReviewConcern[] }
| { type: 'hot-skillet:report-ready'; projectId: string; report: HotSkilletReport; prUrl?: string };

// Session status type
export type SessionStatus = 'idle' | 'starting' | 'running' | 'stopped' | 'crashed';

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
  createdAt: string;
  updatedAt: string;
}

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
  | { type: 'session:stop' }
  // Hot Skillet client messages
  | { type: 'hot-skillet:answer-questions'; projectId: string; answers: Record<string, string> }
  | { type: 'hot-skillet:plan-approve'; projectId: string }
  | { type: 'hot-skillet:plan-edit'; projectId: string; content: string }
  | { type: 'hot-skillet:plan-reject'; projectId: string; feedback: string }
  | { type: 'hot-skillet:unblock-task'; projectId: string; taskId: string; guidance: string }
  | { type: 'hot-skillet:create-pr'; projectId: string };
