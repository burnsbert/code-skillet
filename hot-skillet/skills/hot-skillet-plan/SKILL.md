---
name: hot-skillet-plan
description: Create implementation plan for a Hot Skillet project and present for approval
arguments:
  - name: story-id
    description: Optional story ID. If not provided, uses the most recent active project.
    required: false
---

<hot-skillet-plan>

# Hot Skillet: Plan (Phase 3/6)

You are creating and reviewing an implementation plan for a Hot Skillet project. This skill orchestrates:
- Planner creates task breakdown with sections (A, B, C...)
- Plan reviewer vets and improves the plan
- User reviews and approves the plan

## Inputs

**Story ID**: `$ARGUMENTS.story-id` (optional)
**Project Directory**: Current working directory

## Task ID Format

Tasks are organized by sections that map to plan.md:

- **Section A**: First major area (tasks A1, A2, A3...)
- **Section B**: Second major area (tasks B1, B2, B3...)
- **Section C**: Third major area (tasks C1, C2...)
- etc.

Example plan.md structure:
```markdown
# Implementation Plan

## A. User Authentication
- A1: Add user model
- A2: Implement password hashing

## B. API Endpoints
- B1: Create login endpoint
- B2: Create logout endpoint

## C. Testing
- C1: Unit tests for auth
```

## Process

### Step 1: Find the Project

**If story-id is provided:**
1. Look for `.hot-skillet/{story-id}/context.json`
2. If not found, report error and list available projects

**If no story-id provided:**
1. Look for `.hot-skillet/` directory
2. Find the most recently updated project (by `updatedAt` in context.json)
3. If no projects found, tell user to run `/hot-skillet-define` first

### Step 2: Validate Project State

Read `.hot-skillet/{story-id}/context.json` and check:

1. **Phase should be "research" with status "complete"** OR **"plan" with status "in_progress" or "waiting_user"**
   - If phase is "define": Error - run `/hot-skillet-research` first
   - If phase is "plan" with status "complete" and planApproved: Plan already approved, suggest `/hot-skillet-implement`
   - If phase is beyond "plan": Warn user and ask if they want to re-plan

2. **Research should exist**
   - Check for `.hot-skillet/{story-id}/research.md`
   - If missing, error - run `/hot-skillet-research` first

### Step 3: Launch Planner Agent

Update `context.json`:
- Set `phase` to `"plan"`
- Set `phaseStatus` to `"in_progress"`

Use the Task tool to launch the planner agent:

```
Task tool with subagent_type: "hot-skillet-planner"
```

**Prompt for planner:**
```
Create an implementation plan for Hot Skillet project {story-id}.

**Project Files**:
- Story & Research: `.hot-skillet/{story-id}/research.md`
- Context: `.hot-skillet/{story-id}/context.json`
- Questions: `.hot-skillet/{story-id}/questions.json`

**Your output files**:
- Plan (human-readable): `.hot-skillet/{story-id}/plan.md`
- Tasks (structured): `.hot-skillet/{story-id}/workflow-implement.json`

**Task ID Format**:
- Organize tasks into sections (A, B, C...)
- Each task ID is: {Section Letter}{Task Number}
- Examples: A1, A2, B1, B2, B3, C1

**workflow-implement.json format**:
{
  "activeTask": null,
  "tasks": [
    {
      "id": "A1",
      "section": "A",
      "title": "Add user model",
      "description": "Create the User model with...",
      "difficulty": 3,
      "status": "pending"
    }
  ]
}

Read all research findings, create a comprehensive TDD task breakdown, rate task difficulties (1-10), and follow patterns identified by the scout. Update context.json when complete.
```

### Step 4: Launch Plan Reviewer Agent

After planner completes, launch the reviewer:

```
Task tool with subagent_type: "hot-skillet-plan-reviewer"
```

**Prompt for reviewer:**
```
Review and improve the implementation plan for Hot Skillet project {story-id}.

**Files to review**:
- Research: `.hot-skillet/{story-id}/research.md`
- Context: `.hot-skillet/{story-id}/context.json`
- Plan: `.hot-skillet/{story-id}/plan.md`
- Tasks: `.hot-skillet/{story-id}/workflow-implement.json`

Vet the scout's research, check for gaps in coverage, verify TDD adherence, and APPLY ALL IMPROVEMENTS directly to the plan files. The user will review your improved plan next.
```

### Step 5: Present Plan for Approval

After reviewer completes:

1. **Read the improved plan**:
   - Read `.hot-skillet/{story-id}/plan.md`
   - Read `.hot-skillet/{story-id}/workflow-implement.json` for task count

2. **Update context**:
   - Set `phaseStatus` to `"waiting_user"`

3. **Display to user**:

```markdown
## 🍳 Implementation Plan Ready for Review

**Story ID**: {story-id}
**Story**: {story title}
**Tasks**: {task count}

The plan has been reviewed and improved by the plan-reviewer.

---

{Contents of plan.md}

---

### Task Summary

| Section | Tasks | Avg Difficulty |
|---------|-------|----------------|
| A | A1, A2, A3 | 4.0 |
| B | B1, B2 | 6.5 |
| C | C1 | 3.0 |

- **Total tasks**: {count}
- **High difficulty (7+)**: {count} (will use senior-dev-doer)
- **Standard difficulty (1-6)**: {count} (will use dev-doer)

### Do you approve this plan?

If you'd like changes, describe what you want modified.
If approved, I'll proceed to implementation.
```

### Step 6: Handle User Response

**IF user approves** (says "yes", "approve", "looks good", etc.):
- Update `context.json`:
  - Set `phaseStatus` to `"complete"`
  - Set `planApproved` to `true`
  - Set `planApprovedAt` to current timestamp
- Say: "Plan approved! Run `/hot-skillet-implement` to begin task-by-task implementation."

**IF user requests changes:**
1. Note the requested changes
2. Either:
   - Make minor edits directly to plan.md and workflow-implement.json
   - Or re-run planner with specific guidance
3. Present revised plan and ask again
4. Continue loop until plan is approved

## Output

**During planning:**
```
🍳 Creating implementation plan...
   Planner analyzing story and research...
```

**After reviewer:**
```
🍳 Plan reviewed and improved.
   Presenting for your approval...
```

**After approval:**
```markdown
## 🍳 Plan Approved!

**Story ID**: {story-id}
**Tasks**: {count} tasks ready for implementation

### Task Sections
- **A**: {section A title} ({count} tasks)
- **B**: {section B title} ({count} tasks)
- ...

### Files Created
- `plan.md` - Human-readable plan with sections
- `workflow-implement.json` - Structured task list (A1, A2, B1...)

### Next Step
Run `/hot-skillet-implement` to begin task-by-task implementation.

---
*Phase 3/6 complete. Ready for implementation.*
```

## Error Handling

**If no research found:**
```
Research not found for project {story-id}.

Run `/hot-skillet-research` first to analyze the codebase before planning.
```

**If planner fails:**
- Report the error
- Suggest running the skill again

**If reviewer finds critical issues:**
- The reviewer will attempt to fix them automatically
- If issues persist, report to user and ask for guidance

</hot-skillet-plan>
