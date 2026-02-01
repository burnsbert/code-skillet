import type { Project, Task, TaskPhase, LogEntry } from '../types.js';

const DEMO_TASKS: Omit<Task, 'id'>[] = [
  { title: 'Research existing patterns', phase: 'planned' },
  { title: 'Create data model', phase: 'planned' },
  { title: 'Implement API endpoint', phase: 'planned' },
  { title: 'Add validation logic', phase: 'planned' },
  { title: 'Write unit tests', phase: 'planned' },
  { title: 'Integration testing', phase: 'planned' },
];

const DEMO_PLAN = `# Implementation Plan

## Overview
Based on the story requirements, here's the proposed implementation approach.

## Tasks

### 1. Research Existing Patterns
- Review current codebase for similar implementations
- Identify reusable components and utilities
- Document any technical debt to address

### 2. Create Data Model
- Define TypeScript interfaces
- Set up database schema if needed
- Create validation schemas

### 3. Implement API Endpoint
- Create REST endpoint with proper error handling
- Add authentication/authorization checks
- Implement request/response serialization

### 4. Add Validation Logic
- Input validation using Zod or similar
- Business rule validation
- Error message formatting

### 5. Write Unit Tests
- Test individual functions
- Mock external dependencies
- Aim for 80%+ coverage

### 6. Integration Testing
- End-to-end API tests
- Database integration tests
- Error scenario coverage

## Estimated Complexity
Medium - Standard CRUD with validation

## Risks
- None identified at this time
`;

const AGENTS = ['scout', 'planner', 'dev-doer', 'validator', 'reviewer'];

let projectCounter = 0;
let taskCounter = 0;

export function createProject(name: string, story: string): Project {
  const now = new Date().toISOString();
  const id = `project-${++projectCounter}`;

  const tasks: Task[] = DEMO_TASKS.map((t) => ({
    ...t,
    id: `task-${++taskCounter}`,
  }));

  return {
    id,
    name,
    story,
    phase: 'idle',
    currentTask: null,
    tasks,
    plan: null,
    startedAt: now,
    updatedAt: now,
    log: [{ timestamp: now, message: 'Project created' }],
  };
}

export function addLogEntry(project: Project, message: string): void {
  project.log.push({
    timestamp: new Date().toISOString(),
    message,
  });
  project.updatedAt = new Date().toISOString();
}

export interface DemoWorkflow {
  project: Project;
  isRunning: boolean;
  stop: () => void;
}

export function startDemoWorkflow(
  project: Project,
  onUpdate: (project: Project) => void,
  onPlanReady: (plan: string) => void,
  onTaskMoved: (taskId: string, from: TaskPhase, to: TaskPhase) => void,
  onTerminalOutput: (data: string) => void
): DemoWorkflow {
  let timeoutId: NodeJS.Timeout | null = null;
  let isRunning = true;

  const workflow: DemoWorkflow = {
    project,
    isRunning: true,
    stop: () => {
      isRunning = false;
      workflow.isRunning = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };

  const schedule = (fn: () => void, delay: number) => {
    if (!isRunning) return;
    timeoutId = setTimeout(() => {
      if (isRunning) fn();
    }, delay);
  };

  const terminalLog = (msg: string) => {
    if (!isRunning) return;
    onTerminalOutput(`\x1b[32m[skillet]\x1b[0m ${msg}\r\n`);
  };

  const moveTask = (taskId: string, to: TaskPhase) => {
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const from = task.phase;
    task.phase = to;
    if (to === 'in_progress') {
      task.startedAt = new Date().toISOString();
      task.agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    }
    if (to === 'done') {
      task.completedAt = new Date().toISOString();
    }
    project.updatedAt = new Date().toISOString();
    onTaskMoved(taskId, from, to);
    onUpdate(project);
  };

  const addLearning = (title: string) => {
    const learningTask: Task = {
      id: `task-${++taskCounter}`,
      title,
      phase: 'learnings',
      completedAt: new Date().toISOString(),
    };
    project.tasks.push(learningTask);
    onUpdate(project);
    terminalLog(`\x1b[36m💡 Learning: ${title}\x1b[0m`);
  };

  // Start the workflow
  let step = 0;
  const taskIds = project.tasks.map((t) => t.id);

  const runStep = () => {
    if (!isRunning) return;

    switch (step) {
      case 0:
        // Start planning phase
        project.phase = 'planning';
        addLogEntry(project, 'Starting planning phase...');
        terminalLog('Starting planning phase...');
        onUpdate(project);
        step++;
        schedule(runStep, 1500);
        break;

      case 1:
        // Scout analyzing
        terminalLog(`Scout agent analyzing: "${project.tasks[0].title}"`);
        addLogEntry(project, `Scout researching: ${project.tasks[0].title}`);
        step++;
        schedule(runStep, 2000);
        break;

      case 2:
        // Generate plan
        project.plan = {
          content: DEMO_PLAN,
          status: 'awaiting_approval',
          updatedAt: new Date().toISOString(),
        };
        terminalLog('Plan generated - awaiting approval');
        addLogEntry(project, 'Plan ready for review');
        onPlanReady(DEMO_PLAN);
        onUpdate(project);
        // Pause here until plan is approved - workflow will resume via approvePlan
        break;

      case 3:
        // Plan approved - start implementation
        project.phase = 'in_progress';
        terminalLog('Plan approved! Starting implementation...');
        addLogEntry(project, 'Implementation started');
        moveTask(taskIds[0], 'in_progress');
        step++;
        schedule(runStep, 2000);
        break;

      case 4:
        // Progress through tasks
        moveTask(taskIds[0], 'verifying');
        terminalLog(`Verifying: "${project.tasks[0].title}"`);
        step++;
        schedule(runStep, 1500);
        break;

      case 5:
        moveTask(taskIds[0], 'done');
        moveTask(taskIds[1], 'in_progress');
        terminalLog(`Completed: "${project.tasks[0].title}"`);
        terminalLog(`Starting: "${project.tasks[1].title}"`);
        addLearning('Existing codebase uses Repository pattern');
        step++;
        schedule(runStep, 2000);
        break;

      case 6:
        moveTask(taskIds[1], 'verifying');
        moveTask(taskIds[2], 'in_progress');
        step++;
        schedule(runStep, 1800);
        break;

      case 7:
        moveTask(taskIds[1], 'done');
        moveTask(taskIds[2], 'verifying');
        moveTask(taskIds[3], 'in_progress');
        addLearning('TypeScript strict mode catches null errors early');
        step++;
        schedule(runStep, 2000);
        break;

      case 8:
        moveTask(taskIds[2], 'done');
        moveTask(taskIds[3], 'verifying');
        moveTask(taskIds[4], 'in_progress');
        step++;
        schedule(runStep, 1500);
        break;

      case 9:
        moveTask(taskIds[3], 'done');
        moveTask(taskIds[4], 'verifying');
        moveTask(taskIds[5], 'in_progress');
        step++;
        schedule(runStep, 2000);
        break;

      case 10:
        moveTask(taskIds[4], 'done');
        moveTask(taskIds[5], 'verifying');
        project.phase = 'verifying';
        terminalLog('Final verification in progress...');
        addLearning('Vitest runs faster than Jest for this project');
        step++;
        schedule(runStep, 2000);
        break;

      case 11:
        moveTask(taskIds[5], 'done');
        project.phase = 'done';
        project.currentTask = null;
        terminalLog('\x1b[32m✓ All tasks completed!\x1b[0m');
        addLogEntry(project, 'Project completed');
        onUpdate(project);
        workflow.isRunning = false;
        break;
    }
  };

  // Store step for external access (plan approval)
  (workflow as any).resumeFromPlanApproval = () => {
    if (step === 2 && isRunning) {
      step = 3;
      runStep();
    }
  };

  schedule(runStep, 1000);
  return workflow;
}

export function approvePlan(workflow: DemoWorkflow): void {
  if (workflow.project.plan) {
    workflow.project.plan.status = 'approved';
    workflow.project.plan.updatedAt = new Date().toISOString();
    addLogEntry(workflow.project, 'Plan approved');
  }
  // Resume workflow
  if ((workflow as any).resumeFromPlanApproval) {
    (workflow as any).resumeFromPlanApproval();
  }
}

export function rejectPlan(workflow: DemoWorkflow): void {
  if (workflow.project.plan) {
    workflow.project.plan.status = 'rejected';
    workflow.project.plan.updatedAt = new Date().toISOString();
    addLogEntry(workflow.project, 'Plan rejected - workflow paused');
  }
}

export function editPlan(workflow: DemoWorkflow, content: string): void {
  if (workflow.project.plan) {
    workflow.project.plan.content = content;
    workflow.project.plan.updatedAt = new Date().toISOString();
    addLogEntry(workflow.project, 'Plan edited');
  }
}
