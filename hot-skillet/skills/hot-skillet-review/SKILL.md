---
name: hot-skillet-review
description: Perform code review and create PR for a Hot Skillet project
arguments:
  - name: story-id
    description: Optional story ID. If not provided, uses the most recent active project.
    required: false
---

<hot-skillet-review>

# Hot Skillet: Review (Phase 5/6 - Final Quality Gate)

You are performing code review and completing a Hot Skillet project. This skill orchestrates:
- Two-pass code review (generate concerns → vet them)
- Address vetted concerns (tracked in workflow-code-review.json)
- Generate completion report
- Create pull request

## Inputs

**Story ID**: `$ARGUMENTS.story-id` (optional)
**Project Directory**: Current working directory

## Concern ID Format

Concerns use the format: CR-1, CR-2, CR-3, etc.

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

1. **Implementation must be complete**
   - Check `phase` is `"implement"` with `phaseStatus` `"complete"`
   - If not: Error - run `/hot-skillet-implement` first

2. **Tasks should be done**
   - Read `.hot-skillet/{story-id}/workflow-implement.json`
   - Check all tasks have `status: "complete"`
   - If not all complete: Warn and ask if user wants to proceed anyway

### Step 3: Launch Code Review Agent

Update `context.json`:
- Set `phase` to `"review"`
- Set `phaseStatus` to `"in_progress"`

Use the Task tool to launch the code review:

```
Task tool with subagent_type: "hot-skillet-code-review"
```

**Prompt:**
```
Perform two-pass code review for Hot Skillet project {story-id}.

**Project Files**: `.hot-skillet/{story-id}/`

Pass 1: Generate comprehensive list of concerns covering:
- Testing gaps
- Bugs and logic errors
- Security issues
- Performance problems
- Code quality

Pass 2: Vet all concerns using the code review validator.

Write concerns to `.hot-skillet/{story-id}/workflow-code-review.json` with format:
{
  "activeConcern": null,
  "concerns": [
    {
      "id": "CR-1",
      "title": "Missing null check",
      "severity": "bug",
      "status": "pending",
      "file": "src/auth.ts",
      "line": 42,
      "description": "...",
      "suggestedFix": "..."
    }
  ]
}

Severity levels: bug, critical, important, minor
Status: pending, investigating, fixed, dismissed
```

### Step 4: Review Results

Read `.hot-skillet/{story-id}/workflow-code-review.json`:
- How many concerns were identified?
- Are there any critical/blocking issues?

**If no concerns:**
- Say: "✅ Code review passed with no concerns!"
- Skip to Step 6 (completion)

**If concerns found:**
- Display summary to user
- Say: "Found {count} concerns. Proceeding to address them..."
- Continue to Step 5

### Step 5: Address All Concerns

Launch the Review Responder Agent **ONCE** to handle all concerns:

Say: "🔧 Launching review responder to address {count} concerns..."

```
Task tool with subagent_type: "hot-skillet-review-responder"
```

**Prompt:**
```
Address all code review concerns for Hot Skillet project {story-id}.

**Project Files**: `.hot-skillet/{story-id}/`

Read the concerns from workflow-code-review.json. Handle bugs FIRST with regression tests, then address other concerns.

For each concern, decide to:
- FIX: Bugs, critical issues, important concerns, quick fixes
- DOCUMENT: Valid but out of scope (add to learnings.json)
- DISMISS: Style preferences, nitpicks (explain reasoning)

Update workflow-code-review.json with status and resolution for each concern.
Run tests after all fixes. Generate the final completion report.

If you discover important patterns or gotchas, add them to learnings.json with phase: "review".
```

**After responder completes:**
- Read workflow-code-review.json to verify all concerns addressed
- Check that all have status "fixed" or "dismissed"
- Review the completion report returned by the agent

### Step 6: Final Verification

Run all tests to ensure nothing broke:
```bash
npm test
```

**If tests fail:**
- Report which tests failed
- Ask user how to proceed

### Step 7: Final Commit

Stage and commit all changes:
```bash
git add .
git commit -m "$(cat <<'EOF'
{story-id}: Code review complete

- {concerns fixed} concerns addressed
- {concerns dismissed} concerns dismissed
- All tests passing

🍳 Generated with Hot Skillet
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Step 8: Push and Create Pull Request

**Ask user before pushing:**
```
Changes are committed. Ready to push and create PR?
- Branch: {branch-name}
- Commits: {count} commits
- Files changed: {count}

Push now? (yes/no)
```

**If user approves**, push to remote:
```bash
git push -u origin {branch-name}
```

Create PR:
```bash
gh pr create --title "{story-id}: {story-title}" --body "$(cat <<'EOF'
## Summary
{Brief description of what was implemented}

## Changes by Section
{List sections from plan.md with key changes}

## Testing
- All automated tests passing
- Code review performed and concerns addressed

## Hot Skillet Stats
- Tasks completed: {count}
- Concerns addressed: {count}
- Learnings captured: {count}

---
🍳 Generated with Hot Skillet
EOF
)"
```

Capture the PR URL.

### Step 9: Update Context and Report

Update `context.json`:
- Set `phase` to `"complete"`
- Set `phaseStatus` to `"complete"`
- Set `prUrl` to the PR URL

Display to user:

```markdown
## 🍳 Hot Skillet Complete!

**Story ID**: {story-id}
**Story**: {story title}
**Status**: Ready for human review

### Summary
- ✅ All tasks implemented and validated
- ✅ Code review performed
- ✅ {concerns fixed} concerns addressed
- ✅ All tests passing
- ✅ Changes committed and pushed
- ✅ Pull request created

### Pull Request
{PR URL}

### Concerns Summary

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| CR-1 | bug | fixed | Missing null check |
| CR-2 | minor | dismissed | Consider extracting helper |

### Learnings Captured
{List learnings from learnings.json}

### Next Steps
1. Review the PR: {PR URL}
2. Request team review if needed
3. Merge when approved

---
*🍳 Hot Skillet workflow complete! Phase 6/6.*
```

## Error Handling

**If implementation not complete:**
```
Implementation must be complete before code review.

Run `/hot-skillet-implement` to complete all tasks first.
```

**If code review finds too many critical issues:**
- The review responder will halt and report
- Ask user for guidance before proceeding

**If PR creation fails:**
- Report the error
- Suggest manual PR creation
- Don't mark as failed (code is ready)

**If git push fails:**
- Report the error
- Suggest manual push
- Include the commit that was created

</hot-skillet-review>
