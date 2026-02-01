import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import projectsRouter, { getProject, getAllProjects, saveProject } from './api/projects.js';
import { createProject, startDemoWorkflow, approvePlan, rejectPlan, editPlan, type DemoWorkflow } from './mock/generator.js';
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

function handleClientMessage(ws: WebSocket, message: ClientMessage): void {
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
      // For V1, terminal input is simulated/read-only
      // In V2, this would send to an actual Claude Code session
      console.log('[terminal] Input received (ignored in V1):', message.data);
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
