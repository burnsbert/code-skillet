import { writable, derived } from 'svelte/store';

export type WorkflowStep =
  | 'define'
  | 'research'
  | 'plan'
  | 'implement'
  | 'review'
  | 'report';

export interface WorkflowStepInfo {
  id: WorkflowStep;
  number: number;
  label: string;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStepInfo[] = [
  { id: 'define', number: 1, label: 'Define Project', description: 'Choose folder and story' },
  { id: 'research', number: 2, label: 'Research', description: 'Research and clarify' },
  { id: 'plan', number: 3, label: 'Plan', description: 'Create and approve plan' },
  { id: 'implement', number: 4, label: 'Implement', description: 'Execute tasks' },
  { id: 'review', number: 5, label: 'Code Review', description: 'Review changes' },
  { id: 'report', number: 6, label: 'Final Report', description: 'Summary and results' },
];

interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: Set<WorkflowStep>;
  // Step-specific data
  projectPath: string | null;
  storySource: { type: 'file' | 'url' | 'jira'; value: string } | null;
}

function createWorkflowStore() {
  const initialState: WorkflowState = {
    currentStep: 'define',
    completedSteps: new Set(),
    projectPath: null,
    storySource: null,
  };

  const { subscribe, set, update } = writable<WorkflowState>(initialState);

  return {
    subscribe,

    // Navigate to a step (only allowed if step is current or completed)
    goToStep(step: WorkflowStep) {
      update((state) => {
        const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === step);
        const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === state.currentStep);

        // Can go back to any completed step or stay on current
        if (stepIndex <= currentIndex || state.completedSteps.has(step)) {
          return { ...state, currentStep: step };
        }
        return state;
      });
    },

    // Advance to the next step (marks current as completed)
    advanceStep() {
      update((state) => {
        const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === state.currentStep);
        if (currentIndex < WORKFLOW_STEPS.length - 1) {
          const newCompleted = new Set(state.completedSteps);
          newCompleted.add(state.currentStep);
          return {
            ...state,
            completedSteps: newCompleted,
            currentStep: WORKFLOW_STEPS[currentIndex + 1].id,
          };
        }
        return state;
      });
    },

    // Set project definition data
    setProjectDefinition(projectPath: string, storySource: WorkflowState['storySource']) {
      update((state) => ({
        ...state,
        projectPath,
        storySource,
      }));
    },

    // Reset the workflow
    reset() {
      set(initialState);
    },
  };
}

export const workflowStore = createWorkflowStore();

// Derived store for step status
export const stepStatus = derived(workflowStore, ($workflow) => {
  return WORKFLOW_STEPS.map((step) => {
    const isCurrent = step.id === $workflow.currentStep;
    const isCompleted = $workflow.completedSteps.has(step.id);
    const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === $workflow.currentStep);
    const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === step.id);
    const isFuture = stepIndex > currentIndex && !isCompleted;

    return {
      ...step,
      isCurrent,
      isCompleted,
      isFuture,
      isClickable: isCurrent || isCompleted,
    };
  });
});
