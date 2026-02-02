import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import projectsRouter, { getProject, getAllProjects, saveProject } from './api/projects.js';
import { createProject, startDemoWorkflow, approvePlan, rejectPlan, editPlan, type DemoWorkflow } from './mock/generator.js';
import { sessionManager } from './session.js';
import * as hotSkillet from './hot-skillet/index.js';
import type { ServerMessage, ClientMessage, Project } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3002;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../../ui/dist')));

// API routes
app.use('/api/projects', projectsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Track active workflows
const activeWorkflows = new Map<string, DemoWorkflow>();

// Track client subscriptions
const clientSubscriptions = new Map<WebSocket, Set<string>>();

// Set up session manager event handlers
sessionManager.on('output', (data: string) => {
  broadcast({ type: 'terminal:output', data });
});

sessionManager.on('started', () => {
  const projectPath = sessionManager.projectPath;
  if (projectPath) {
    broadcast({ type: 'session:started', projectPath });
  }
});

sessionManager.on('ended', (exitCode: number, reason: string) => {
  broadcast({ type: 'session:ended', exitCode, reason });
});

sessionManager.on('error', (message: string) => {
  broadcast({ type: 'session:error', message });
});

sessionManager.on('statusChange', () => {
  broadcast({
    type: 'session:status',
    status: sessionManager.status,
    projectPath: sessionManager.projectPath,
  });
});

function broadcast(message: ServerMessage, projectId?: string): void {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (projectId) {
        const subs = clientSubscriptions.get(client);
        if (subs?.has(projectId)) {
          client.send(data);
        }
      } else {
        client.send(data);
      }
    }
  });
}

function sendToClient(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

wss.on('connection', (ws) => {
  console.log('[ws] Client connected');
  clientSubscriptions.set(ws, new Set());

  // Send initial project list
  sendToClient(ws, { type: 'project:list', projects: getAllProjects() });

  // Send current session status
  sendToClient(ws, {
    type: 'session:status',
    status: sessionManager.status,
    projectPath: sessionManager.projectPath,
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString()) as ClientMessage;
      handleClientMessage(ws, message);
    } catch (err) {
      console.error('[ws] Failed to parse message:', err);
      sendToClient(ws, { type: 'error', message: 'Invalid message format' });
    }
  });

  ws.on('close', () => {
    console.log('[ws] Client disconnected');
    clientSubscriptions.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('[ws] Error:', err);
  });
});

async function handleClientMessage(ws: WebSocket, message: ClientMessage): Promise<void> {
  const subs = clientSubscriptions.get(ws);

  switch (message.type) {
    case 'project:subscribe': {
      subs?.add(message.projectId);
      const project = getProject(message.projectId);
      if (project) {
        sendToClient(ws, { type: 'project:update', project });
      }
      break;
    }

    case 'project:unsubscribe': {
      subs?.delete(message.projectId);
      break;
    }

    case 'project:create': {
      const project = createProject(message.name, message.story);
      saveProject(project);
      broadcast({ type: 'project:list', projects: getAllProjects() });
      sendToClient(ws, { type: 'project:update', project });
      break;
    }

    case 'demo:start': {
      // Create a demo project and immediately start the workflow
      const project = createProject(
        'User Authentication Feature',
        'As a user, I want to securely log in to the application so that I can access my personalized dashboard and settings.'
      );
      saveProject(project);

      // Subscribe this client to the new project
      subs?.add(project.id);

      // Broadcast updated project list to all clients
      broadcast({ type: 'project:list', projects: getAllProjects() });

      // Send project update to this client
      sendToClient(ws, { type: 'project:update', project });

      // Start the demo workflow
      const workflow = startDemoWorkflow(
        project,
        (updatedProject) => {
          saveProject(updatedProject);
          broadcast({ type: 'project:update', project: updatedProject }, project.id);
        },
        (plan) => {
          broadcast({ type: 'plan:ready', projectId: project.id, plan }, project.id);
        },
        (taskId, fromPhase, toPhase) => {
          broadcast(
            { type: 'task:moved', projectId: project.id, taskId, fromPhase, toPhase },
            project.id
          );
        },
        (data) => {
          broadcast({ type: 'terminal:output', data }, project.id);
        }
      );

      activeWorkflows.set(project.id, workflow);
      break;
    }

    case 'project:start-demo': {
      const project = getProject(message.projectId);
      if (!project) {
        sendToClient(ws, { type: 'error', message: 'Project not found' });
        return;
      }

      // Stop any existing workflow for this project
      const existingWorkflow = activeWorkflows.get(message.projectId);
      if (existingWorkflow) {
        existingWorkflow.stop();
      }

      const workflow = startDemoWorkflow(
        project,
        (updatedProject) => {
          saveProject(updatedProject);
          broadcast({ type: 'project:update', project: updatedProject }, message.projectId);
        },
        (plan) => {
          broadcast({ type: 'plan:ready', projectId: message.projectId, plan }, message.projectId);
        },
        (taskId, fromPhase, toPhase) => {
          broadcast(
            { type: 'task:moved', projectId: message.projectId, taskId, fromPhase, toPhase },
            message.projectId
          );
        },
        (data) => {
          broadcast({ type: 'terminal:output', data }, message.projectId);
        }
      );

      activeWorkflows.set(message.projectId, workflow);
      break;
    }

    case 'plan:approve': {
      const workflow = activeWorkflows.get(message.projectId);
      if (workflow) {
        approvePlan(workflow);
        saveProject(workflow.project);
        broadcast({ type: 'project:update', project: workflow.project }, message.projectId);
      }
      break;
    }

    case 'plan:reject': {
      const workflow = activeWorkflows.get(message.projectId);
      if (workflow) {
        rejectPlan(workflow);
        saveProject(workflow.project);
        broadcast({ type: 'project:update', project: workflow.project }, message.projectId);
      }
      break;
    }

    case 'plan:edit': {
      const workflow = activeWorkflows.get(message.projectId);
      if (workflow) {
        editPlan(workflow, message.content);
        saveProject(workflow.project);
        broadcast({ type: 'project:update', project: workflow.project }, message.projectId);
      }
      break;
    }

    case 'terminal:input': {
      // Send input to the active Claude Code session
      sessionManager.write(message.data);
      break;
    }

    case 'terminal:resize': {
      // Resize the PTY
      sessionManager.resize(message.cols, message.rows);
      break;
    }

    case 'session:start': {
      // Start a new Claude Code session
      sessionManager.startSession({
        projectPath: message.projectPath,
        skipPermissions: message.skipPermissions,
        cols: message.cols,
        rows: message.rows,
      });
      break;
    }

    case 'session:stop': {
      // Stop the current session
      sessionManager.stopSession();
      break;
    }

    // ========================================================================
    // Hot Skillet Message Handlers
    // ========================================================================

    case 'hot-skillet:answer-questions': {
      const projectPath = sessionManager.projectPath || process.cwd();
      const context = await hotSkillet.readContext(projectPath, message.storyId);
      if (!context) {
        sendToClient(ws, { type: 'error', message: `Hot Skillet project not found: ${message.storyId}` });
        return;
      }

      // Update questions with answers
      try {
        for (const [questionId, answer] of Object.entries(message.answers)) {
          await hotSkillet.answerQuestion(projectPath, message.storyId, questionId, answer);
        }
      } catch (err) {
        console.error(`Failed to save answers for ${message.storyId}:`, err);
        sendToClient(ws, { type: 'error', message: `Failed to save answers: ${(err as Error).message}` });
        return;
      }

      // Broadcast phase update
      broadcast({
        type: 'hot-skillet:phase-update',
        storyId: message.storyId,
        phase: context.phase,
        status: context.phaseStatus,
      }, message.storyId);
      break;
    }

    case 'hot-skillet:plan-approve': {
      const projectPath = sessionManager.projectPath || process.cwd();
      const context = await hotSkillet.readContext(projectPath, message.storyId);
      if (!context) {
        sendToClient(ws, { type: 'error', message: `Hot Skillet project not found: ${message.storyId}` });
        return;
      }

      // Update phase to implement and mark plan as approved
      const updated = await hotSkillet.updateContext(projectPath, message.storyId, {
        phase: 'implement',
        phaseStatus: 'pending',
        planApproved: true,
        planApprovedAt: new Date().toISOString(),
      });
      if (updated) {
        broadcast({
          type: 'hot-skillet:phase-update',
          storyId: message.storyId,
          phase: 'implement',
          status: 'pending',
        }, message.storyId);

        // Also broadcast the plan ready status with tasks
        const workflowData = await hotSkillet.readWorkflowImplement(projectPath, message.storyId);
        if (workflowData) {
          broadcast({
            type: 'hot-skillet:plan-ready',
            storyId: message.storyId,
            tasks: workflowData.tasks,
          }, message.storyId);
        }
      }
      break;
    }

    case 'hot-skillet:plan-edit': {
      const projectPath = sessionManager.projectPath || process.cwd();
      const context = await hotSkillet.readContext(projectPath, message.storyId);
      if (!context) {
        sendToClient(ws, { type: 'error', message: `Hot Skillet project not found: ${message.storyId}` });
        return;
      }

      // Update the plan content
      try {
        await hotSkillet.writePlan(projectPath, message.storyId, message.content);
      } catch (err) {
        console.error(`Failed to write plan for ${message.storyId}:`, err);
        sendToClient(ws, { type: 'error', message: `Failed to save plan: ${(err as Error).message}` });
        return;
      }

      // Broadcast updated plan with tasks
      const workflowData = await hotSkillet.readWorkflowImplement(projectPath, message.storyId);
      if (workflowData) {
        broadcast({
          type: 'hot-skillet:plan-ready',
          storyId: message.storyId,
          tasks: workflowData.tasks,
        }, message.storyId);
      }
      break;
    }

    case 'hot-skillet:plan-reject': {
      const projectPath = sessionManager.projectPath || process.cwd();
      const context = await hotSkillet.readContext(projectPath, message.storyId);
      if (!context) {
        sendToClient(ws, { type: 'error', message: `Hot Skillet project not found: ${message.storyId}` });
        return;
      }

      // Set phase status to waiting_user and store the rejection feedback
      try {
        const updated = await hotSkillet.updateContext(projectPath, message.storyId, {
          phaseStatus: 'waiting_user',
          planRejectionFeedback: message.feedback,
        });

        if (updated) {
          broadcast({
            type: 'hot-skillet:phase-update',
            storyId: message.storyId,
            phase: context.phase,
            status: 'waiting_user',
          }, message.storyId);
        }
      } catch (err) {
        console.error(`Failed to update context for ${message.storyId}:`, err);
        sendToClient(ws, { type: 'error', message: `Failed to reject plan: ${(err as Error).message}` });
      }
      break;
    }

    case 'hot-skillet:unblock-task': {
      const projectPath = sessionManager.projectPath || process.cwd();
      const context = await hotSkillet.readContext(projectPath, message.storyId);
      if (!context) {
        sendToClient(ws, { type: 'error', message: `Hot Skillet project not found: ${message.storyId}` });
        return;
      }

      // Find and update the task
      const workflowData = await hotSkillet.readWorkflowImplement(projectPath, message.storyId);
      if (!workflowData) {
        sendToClient(ws, { type: 'error', message: `No tasks found for project: ${message.storyId}` });
        return;
      }

      const task = workflowData.tasks.find(t => t.id === message.taskId);
      if (!task) {
        sendToClient(ws, { type: 'error', message: `Task not found: ${message.taskId}` });
        return;
      }

      if (task.status !== 'blocked') {
        sendToClient(ws, { type: 'error', message: `Task ${message.taskId} is not blocked (status: ${task.status})` });
        return;
      }

      // Unblock the task and store the guidance
      try {
        await hotSkillet.updateTask(projectPath, message.storyId, message.taskId, {
          status: 'pending',
          blockedReason: undefined,
          unblockGuidance: message.guidance,
        });
      } catch (err) {
        console.error(`Failed to unblock task for ${message.storyId}:`, err);
        sendToClient(ws, { type: 'error', message: `Failed to unblock task: ${(err as Error).message}` });
        return;
      }

      // Broadcast task update
      broadcast({
        type: 'hot-skillet:task-update',
        storyId: message.storyId,
        taskId: message.taskId,
        status: 'pending',
      }, message.storyId);
      break;
    }

    case 'hot-skillet:create-pr': {
      const projectPath = sessionManager.projectPath || process.cwd();
      const context = await hotSkillet.readContext(projectPath, message.storyId);
      if (!context) {
        sendToClient(ws, { type: 'error', message: `Hot Skillet project not found: ${message.storyId}` });
        return;
      }

      // This is a UI trigger - the actual PR creation is handled by the /hot-skillet-review skill
      // Broadcast completion status (the report would be generated by the skill)
      if (context.phase === 'complete' && context.prUrl) {
        broadcast({
          type: 'hot-skillet:complete',
          storyId: message.storyId,
          report: {
            summary: 'Implementation complete',
            tasksCompleted: 0, // Would be populated by actual review
            tasksFailed: 0,
            concernsFixed: 0,
            concernsDismissed: 0,
            filesChanged: 0,
            testsPassed: true,
          },
          prUrl: context.prUrl,
        }, message.storyId);
      }
      break;
    }

    default:
      sendToClient(ws, { type: 'error', message: `Unknown message type` });
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  activeWorkflows.forEach((workflow) => workflow.stop());
  sessionManager.dispose();
  wss.close();
  server.close();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║           Code-Skillet Server             ║
  ╠═══════════════════════════════════════════╣
  ║  REST API:    http://localhost:${PORT}/api    ║
  ║  WebSocket:   ws://localhost:${PORT}/ws       ║
  ╚═══════════════════════════════════════════╝
  `);
});
