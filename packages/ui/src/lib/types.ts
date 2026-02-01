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
  | { type: 'error'; message: string };

export type ClientMessage =
  | { type: 'project:subscribe'; projectId: string }
  | { type: 'project:unsubscribe'; projectId: string }
  | { type: 'project:create'; name: string; story: string }
  | { type: 'project:start-demo'; projectId: string }
  | { type: 'demo:start' }
  | { type: 'plan:approve'; projectId: string }
  | { type: 'plan:reject'; projectId: string }
  | { type: 'plan:edit'; projectId: string; content: string }
  | { type: 'terminal:input'; data: string };

export const PHASE_LABELS: Record<TaskPhase, string> = {
  planned: 'Planned Tasks',
  in_progress: 'In Progress',
  verifying: 'Verifying',
  done: 'Done',
  learnings: 'Learnings',
};

export const PHASE_ORDER: TaskPhase[] = ['planned', 'in_progress', 'verifying', 'done', 'learnings'];
