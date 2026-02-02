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
| { type: 'hot-skillet:phase-update'; storyId: string; phase: HotSkilletPhase; status: PhaseStatus }
| { type: 'hot-skillet:research-complete'; storyId: string }
| { type: 'hot-skillet:questions-ready'; storyId: string; questions: HotSkilletQuestion[] }
| { type: 'hot-skillet:plan-ready'; storyId: string; tasks: HotSkilletTask[] }
| { type: 'hot-skillet:task-update'; storyId: string; taskId: string; status: HotSkilletTaskStatus }
| { type: 'hot-skillet:concern-update'; storyId: string; concernId: string; status: ConcernStatus }
| { type: 'hot-skillet:review-complete'; storyId: string; concerns: ReviewConcern[] }
| { type: 'hot-skillet:complete'; storyId: string; report: HotSkilletReport; prUrl?: string };

// Session status type
export type SessionStatus = 'idle' | 'starting' | 'running' | 'stopped' | 'crashed';

// ============================================================================
// Hot Skillet Types
// ============================================================================

// Phases (renamed from stages)
export type HotSkilletPhase = 'define' | 'research' | 'plan' | 'implement' | 'review' | 'complete';

export type PhaseStatus = 'pending' | 'in_progress' | 'waiting_user' | 'complete';

// Task status for workflow-implement.json
export type HotSkilletTaskStatus = 'pending' | 'in_progress' | 'verifying' | 'complete' | 'blocked';

// Concern status for workflow-code-review.json
export type ConcernStatus = 'pending' | 'investigating' | 'fixed' | 'dismissed';

export type ConcernSeverity = 'bug' | 'critical' | 'important' | 'minor';

// Learning categories for learnings.json
export type LearningCategory = 'pattern' | 'gotcha' | 'bug' | 'decision' | 'tip';

// ============================================================================
// questions.json - Questions & answers tied to phases
// ============================================================================

export interface HotSkilletQuestion {
  id: string; // Q1, Q2, Q3...
  phase: HotSkilletPhase;
  question: string;
  context?: string;
  answer?: string;
  answeredAt?: string;
}

export interface QuestionsFile {
  questions: HotSkilletQuestion[];
}

// ============================================================================
// workflow-implement.json - Implementation tasks
// ============================================================================

export interface HotSkilletTask {
  id: string; // A1, A2, B1, B2... (section letter + task number)
  section: string; // A, B, C... (maps to plan.md sections)
  title: string;
  description: string;
  difficulty: number; // 1-10
  status: HotSkilletTaskStatus;
  agent?: string;
  startedAt?: string;
  completedAt?: string;
  retryCount?: number;
  blockedReason?: string;
  unblockGuidance?: string;
}

export interface WorkflowImplementFile {
  activeTask: string | null; // e.g., "B2"
  tasks: HotSkilletTask[];
}

// ============================================================================
// workflow-code-review.json - Review concerns
// ============================================================================

export interface ReviewConcern {
  id: string; // CR-1, CR-2, CR-3...
  title: string;
  severity: ConcernSeverity;
  status: ConcernStatus;
  file: string;
  line?: number;
  description: string;
  suggestedFix?: string;
  resolution?: string;
}

export interface WorkflowCodeReviewFile {
  activeConcern: string | null; // e.g., "CR-2"
  concerns: ReviewConcern[];
}

// ============================================================================
// learnings.json - Insights captured during the project
// ============================================================================

export interface HotSkilletLearning {
  id: string; // L1, L2, L3...
  phase: HotSkilletPhase;
  category: LearningCategory;
  title: string;
  description: string;
  files?: string[];
  capturedAt: string;
}

export interface LearningsFile {
  learnings: HotSkilletLearning[];
}

// ============================================================================
// context.json - Project metadata and current phase
// ============================================================================

export interface HotSkilletContext {
  storyId: string;
  storySource: {
    type: 'file' | 'url' | 'jira' | 'text';
    value: string;
  };
  phase: HotSkilletPhase;
  phaseStatus: PhaseStatus;
  branch?: string;
  baseBranch?: string;
  planApproved?: boolean;
  planApprovedAt?: string;
  planRejectionFeedback?: string;
  prUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Legacy types for backward compatibility (used by UI dashboard)
// ============================================================================

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

// Kept for research.md parsing (not a separate file anymore)
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
  | { type: 'hot-skillet:answer-questions'; storyId: string; answers: Record<string, string> }
  | { type: 'hot-skillet:plan-approve'; storyId: string }
  | { type: 'hot-skillet:plan-edit'; storyId: string; content: string }
  | { type: 'hot-skillet:plan-reject'; storyId: string; feedback: string }
  | { type: 'hot-skillet:unblock-task'; storyId: string; taskId: string; guidance: string }
  | { type: 'hot-skillet:create-pr'; storyId: string };
