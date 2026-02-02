---
name: hot-skillet-report
description: Display status report for a Hot Skillet project
arguments:
  - name: story-id
    description: Optional story ID. If not provided, uses the most recent active project.
    required: false
---

<hot-skillet-report>

# Hot Skillet: Report (Status Check Utility)

Display the current status and completion report for a Hot Skillet project.

## Inputs

**Story ID**: `$ARGUMENTS.story-id` (optional)
**Project Directory**: Current working directory

## Process

### Step 1: Find the Project

**If story-id is provided:**
1. Look for `.hot-skillet/{story-id}/context.json`
2. If not found, report error and list available projects

**If no story-id provided:**
1. Look for `.hot-skillet/` directory
2. Find the most recently updated project
3. If no projects found, tell user to run `/hot-skillet-define` first

### Step 2: Read Project Status

Read `.hot-skillet/{story-id}/context.json` and extract:
- `storyId`
- `phase`
- `phaseStatus`
- `createdAt`
- `updatedAt`
- `planApproved`
- `branch` (if set)
- `prUrl` (if set)

### Step 3: Gather Additional Info

Based on current phase, read relevant files:

**If phase >= "research":**
- Check if `research.md` exists
- Extract key findings summary if available

**If phase >= "plan":**
- Check if `plan.md` exists
- Read `workflow-implement.json` for task counts
- Count: total, complete, pending, blocked by section

**If phase >= "review":**
- Check if `workflow-code-review.json` exists
- Count concerns by status

**Always:**
- Read `questions.json` for question counts
- Read `learnings.json` for learning counts

### Step 4: Display Status Report

```markdown
## 🍳 Hot Skillet Status Report

**Story ID**: {story-id}
**Story**: {story title or first line of research.md}
**Created**: {createdAt}
**Last Updated**: {updatedAt}

### Current Phase
**Phase**: {phase} ({phaseStatus})
**Progress**: {progress indicator}

### Phase Checklist
- [{✅/🔄/⬜}] Define - Initialize project
- [{✅/🔄/⬜}] Research - Codebase analysis
- [{✅/🔄/⬜}] Plan - Task breakdown
- [{✅/🔄/⬜}] Implement - Execute tasks
- [{✅/🔄/⬜}] Review - Code review
- [{✅/⬜}] Complete - PR created

### {Phase-Specific Details}

{Details vary by phase - see below}

### Files
- Context: `context.json` ✅
- Questions: `questions.json` {✅/❌} ({count} questions)
- Research: `research.md` {✅/❌}
- Plan: `plan.md` {✅/❌}
- Tasks: `workflow-implement.json` {✅/❌}
- Concerns: `workflow-code-review.json` {✅/❌}
- Learnings: `learnings.json` {✅/❌} ({count} learnings)

### Next Step
{Recommend next skill to run based on current phase}
```

### Phase-Specific Details

**If phase == "define":**
```markdown
### Define Phase
Project initialized. Story loaded.

**Next Step**: Run `/hot-skillet-research` to analyze the codebase.
```

**If phase == "research":**
```markdown
### Research Phase
{If complete: "Codebase analysis complete."}
{If in_progress: "Research in progress..."}

**Key Findings**:
- {summary from research.md if available}

**Questions**: {answered}/{total}

**Next Step**: Run `/hot-skillet-plan` to create implementation plan.
```

**If phase == "plan":**
```markdown
### Plan Phase
{If complete: "Plan approved and ready."}
{If waiting_user: "Plan awaiting approval."}
{If in_progress: "Planning in progress..."}

**Tasks by Section**:
| Section | Tasks | Status |
|---------|-------|--------|
| A | A1, A2, A3 | pending |
| B | B1, B2 | pending |

**Plan Approved**: {Yes/No}

**Next Step**: {If approved: Run `/hot-skillet-implement`}
             {If not approved: Run `/hot-skillet-plan` to review/approve}
```

**If phase == "implement":**
```markdown
### Implement Phase
{If complete: "All tasks completed!"}
{If waiting_user: "Blocked on task: {task}"}
{If in_progress: "Implementation in progress..."}

**Tasks**: {complete}/{total} complete

| Section | Tasks | Status |
|---------|-------|--------|
| A | A1 ✅, A2 ✅, A3 🔄 | 2/3 |
| B | B1 ⬜, B2 ⬜ | 0/2 |

**Active Task**: {activeTask}

**Next Step**: {If complete: Run `/hot-skillet-review`}
             {If blocked: Resolve blocker, then continue}
```

**If phase == "review":**
```markdown
### Review Phase
{If complete: "Code review complete!"}
{If in_progress: "Code review in progress..."}

**Concerns**:
| ID | Severity | Status | Title |
|----|----------|--------|-------|
| CR-1 | bug | fixed | ... |
| CR-2 | minor | pending | ... |

**Active Concern**: {activeConcern}

**Next Step**: {If all addressed: PR will be created}
```

**If phase == "complete":**
```markdown
### 🎉 Project Complete!

**PR**: {PR URL}
**Branch**: {branch name}

All phases completed successfully.

**Final Stats**:
- Tasks completed: {count}
- Concerns addressed: {count}
- Learnings captured: {count}
```

## Error Handling

**If no projects found:**
```
No Hot Skillet projects found in this directory.

Run `/hot-skillet-define <story>` to start a new project.
```

**If story-id not found:**
```
Project "{story-id}" not found.

Available projects:
- {list projects in .hot-skillet/}
```

## List All Projects Option

If user just wants to see all projects:

```markdown
## 🍳 Hot Skillet Projects

| Story ID | Phase | Status | Updated |
|----------|-------|--------|---------|
| PROJ-123 | implement | in_progress | 2h ago |
| PROJ-456 | complete | complete | 1d ago |

Run `/hot-skillet-report {story-id}` for details on a specific project.
```

</hot-skillet-report>
