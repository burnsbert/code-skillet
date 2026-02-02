---
name: hot-skillet-implement
description: Execute implementation tasks for a Hot Skillet project with TDD and validation
arguments:
  - name: story-id
    description: Optional story ID. If not provided, uses the most recent active project.
    required: false
---

<hot-skillet-implement>

# Hot Skillet: Implement (Phase 4/6 - Development Loop)

You are executing implementation tasks for a Hot Skillet project. This skill orchestrates the development loop:
- Pick next task from workflow-implement.json
- Route to appropriate dev-doer (based on difficulty)
- Validate completion
- Repeat until all tasks done

## Inputs

**Story ID**: `$ARGUMENTS.story-id` (optional)
**Project Directory**: Current working directory

## Task ID Format

Tasks use section-based IDs: A1, A2, B1, B2, C1, etc.
- Letter = section (maps to plan.md)
- Number = task within section

## Process

### Step 1: Find the Project

**If story-id is provided:**
1. Look for `.hot-skillet/{story-id}/context.json`
2. If not found, report error and list available projects

**If no story-id provided:**
1. Look for `.hot-skillet/` directory
2. Find the most recently updated project
3. If no projects found, tell user to run `/hot-skillet-define` first

### Step 2: Validate Project State

Read `.hot-skillet/{story-id}/context.json` and check:

1. **Plan must be approved**
   - Check `planApproved` is `true`
   - If not approved: Error - run `/hot-skillet-plan` first

2. **Tasks must exist**
   - Read `.hot-skillet/{story-id}/workflow-implement.json`
   - If no tasks or file missing: Error - run `/hot-skillet-plan` first

3. **Check current phase**
   - If already in "implement" phase: Resume where left off
   - If in "review" or "complete" phase: Warn user, ask if they want to re-implement

### Step 3: Create Feature Branch (if needed)

Check if we're on the correct feature branch:

```bash
git branch --show-current
```

**If NOT on the feature branch** (from `context.branch`):
1. Check for uncommitted changes: `git status --porcelain`
2. If changes exist, warn user and ask how to proceed
3. Create and switch to the feature branch:
   ```bash
   git checkout -b {branch}
   ```
4. Say: "Created feature branch: {branch}"

**If already on the feature branch**:
- Say: "Continuing on branch: {branch}"

### Step 4: Initialize Development Tracking

Update `context.json`:
- Set `phase` to `"implement"`
- Set `phaseStatus` to `"in_progress"`

Track state in workflow-implement.json:
- `activeTask` - current task being worked on
- Task statuses: pending, in_progress, verifying, complete, blocked

### Step 5: Development Loop

**For each pending task in workflow-implement.json:**

#### A. Select Next Task and Agent

Read workflow-implement.json, find first task with `status: "pending"`:
- Get task `difficulty` rating
- **If difficulty >= 7**: Use `hot-skillet-senior-dev-doer` (Opus)
- **If difficulty < 7**: Use `hot-skillet-dev-doer` (Sonnet)

Update workflow-implement.json:
- Set `activeTask` to task ID
- Set task `status` to `"in_progress"`
- Set task `startedAt` to current timestamp

#### B. Launch Dev-Doer Agent

**For difficulty 1-6:**
```
Task tool with subagent_type: "hot-skillet-dev-doer"
```

**For difficulty 7-10:**
```
Task tool with subagent_type: "hot-skillet-senior-dev-doer"
```
Say: "🔥 High difficulty task (7+/10) - routing to senior dev-doer (Opus)"

**Prompt:**
```
Implement this task for Hot Skillet project {story-id}:

**Task**: {task id} - {task title}
**Difficulty**: {difficulty}/10
**Section**: {section}

**Project Files**:
- Research: `.hot-skillet/{story-id}/research.md`
- Plan: `.hot-skillet/{story-id}/plan.md`
- Tasks: `.hot-skillet/{story-id}/workflow-implement.json`
- Learnings: `.hot-skillet/{story-id}/learnings.json`

Read all context. Follow patterns from research. Write tests first (TDD). Ensure all tests pass.

If you discover something important, add it to learnings.json with phase: "implement".
```

#### C. Review Dev-Doer's Work

Read the implementation summary from dev-doer:
- Note what was implemented
- Note test results

Update workflow-implement.json:
- Set task `status` to `"verifying"`

---
### ⛔ MANDATORY VALIDATION CHECKPOINT ⛔
**You MUST run the validator before proceeding. No exceptions.**
---

#### D. Launch Task Validator (MANDATORY - NEVER SKIP)

Say: "🔍 Running validator for Task {task-id}..."

```
Task tool with subagent_type: "hot-skillet-task-validator"
```

**Prompt:**
```
Validate that task {task-id} is TRULY complete for Hot Skillet project {story-id}:

**Task**: {task title}
**Task ID**: {task-id}

**Project Files**: `.hot-skillet/{story-id}/`

Review the implementation and verify:
- Full scope implemented (not partial)
- All tests pass (no skips/failures)
- No shortcuts taken
- Patterns from research followed

Return STATUS: COMPLETE or INCOMPLETE with specific reasons.
```

**WAIT for validator response before proceeding**

#### E. Handle Validation Outcome

**IF COMPLETE:**
- Update workflow-implement.json:
  - Set task `status` to `"complete"`
  - Set task `completedAt` to current timestamp
  - Set `activeTask` to null
- Say: "✅ Task {task-id} complete: {task title}"
- Move to next task

**IF INCOMPLETE:**
- Increment task `retryCount`
- **IF retryCount < 3:**
  - **Check if escalation to senior is appropriate:**
    - If task was using dev-doer (not senior) AND retryCount = 2:
      - Say: "⚡ Escalating to senior dev-doer (Opus) after 2 failed attempts"
      - Set flag to use senior-dev-doer for attempt 3
  - Set task `status` back to `"in_progress"`
  - Say: "Task {task-id} incomplete (attempt {count}/3). Issues: {validator reasons}"
  - Retry task
- **IF retryCount = 3:**
  - **HALT DEVELOPMENT**
  - Update workflow-implement.json:
    - Set task `status` to `"blocked"`
    - Set task `blockedReason` to validator's reasons
  - Say: "⚠️ Stuck on task {task-id} after 3 attempts. Issues: {validator reasons}"
  - Update `context.json`:
    - Set `phaseStatus` to `"waiting_user"`
  - Ask user: "This task has failed 3 times. Options: 1) You implement it manually, 2) Adjust task scope, 3) Skip and continue"
  - **WAIT for user decision**

### Step 6: After All Tasks Complete

Say: "🎉 All tasks implemented and validated!"

Update `context.json`:
- Set `phase` to `"implement"`
- Set `phaseStatus` to `"complete"`

### Step 7: Commit Changes

Stage all changes:
```bash
git add .
```

Create commit with message from story:
```bash
git commit -m "$(cat <<'EOF'
{story-id}: {story-title}

Implemented all tasks:
{Brief summary of sections completed}

All tests passing. Ready for code review.

🍳 Generated with Hot Skillet
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Note**: Do NOT push automatically. The user will decide when to push.

### Step 8: Report Completion

```markdown
## 🍳 Implementation Complete!

**Story ID**: {story-id}
**Tasks Completed**: {count}/{total}
**Status**: All changes committed (not pushed)

### Summary by Section

| Section | Tasks | Status |
|---------|-------|--------|
| A | A1, A2, A3 | ✅ Complete |
| B | B1, B2 | ✅ Complete |
| C | C1 | ✅ Complete |

### Files Changed
{List of key files modified}

### Learnings Captured
{Count} insights added to learnings.json

### Next Step
Run `/hot-skillet-review` to:
- Perform two-pass code review
- Address any concerns
- Create pull request

---
*Phase 4/6 complete. Ready for code review.*
```

## Error Handling

**If plan not approved:**
```
Plan must be approved before implementation.

Run `/hot-skillet-plan` to create and approve the implementation plan.
```

**If no tasks found:**
```
No tasks found for project {story-id}.

Run `/hot-skillet-plan` to create the task breakdown.
```

**If task repeatedly fails:**
- After 3 attempts, halt and ask user for guidance
- Document the failure in workflow-implement.json
- User can: implement manually, adjust scope, or skip

**If git operations fail:**
- Report the error
- Suggest manual commit/push
- Don't mark implementation as failed (code is done)

## MANDATORY VALIDATION RULE

**THE FOLLOWING SEQUENCE IS REQUIRED FOR EVERY SINGLE TASK:**

```
1. dev-doer implements task
2. VALIDATOR RUNS (non-negotiable)
3. Only AFTER validator says COMPLETE can you proceed
```

**VIOLATIONS THAT ARE NOT ALLOWED:**
- ❌ Marking a task complete without running validator
- ❌ Moving to next task without validator confirmation
- ❌ Assuming dev-doer's "tests pass" claim is sufficient
- ❌ Skipping validator "because the task looks done"
- ❌ Running dev-doer twice in a row without validator between them

**If you find yourself about to launch dev-doer for the next task, STOP and ask: "Did I run the validator for the previous task?" If no, GO BACK and run the validator.**

</hot-skillet-implement>
