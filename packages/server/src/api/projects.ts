import { Router } from 'express';
import type { Project } from '../types.js';
import { createProject } from '../mock/generator.js';

const router = Router();

// In-memory project store
const projects = new Map<string, Project>();

export function getProject(id: string): Project | undefined {
  return projects.get(id);
}

export function getAllProjects(): Project[] {
  return Array.from(projects.values());
}

export function saveProject(project: Project): void {
  projects.set(project.id, project);
}

// REST API endpoints
router.get('/', (_req, res) => {
  res.json(getAllProjects());
});

router.get('/:id', (req, res) => {
  const project = getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(project);
});

router.post('/', (req, res) => {
  const { name, story } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  if (!story || typeof story !== 'string') {
    res.status(400).json({ error: 'Story is required' });
    return;
  }

  const project = createProject(name, story);
  saveProject(project);
  res.status(201).json(project);
});

router.delete('/:id', (req, res) => {
  const project = getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  projects.delete(req.params.id);
  res.status(204).send();
});

export default router;
