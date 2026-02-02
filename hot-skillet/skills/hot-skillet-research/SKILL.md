---
name: hot-skillet-research
description: Run codebase research for a Hot Skillet project using the scout agent
arguments:
  - name: story-id
    description: Optional story ID. If not provided, uses the most recent active project.
    required: false
---

<hot-skillet-research>

# Hot Skillet: Research (Phase 2/6)

You are running codebase research for a Hot Skillet project. Your job is to launch the scout agent to investigate the codebase and answer implementation questions.

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
2. Find the most recently updated project (by `updatedAt` in context.json)
3. If no projects found, tell user to run `/hot-skillet-define` first

```bash
# Find project directories
ls -la .hot-skillet/
```

### Step 2: Validate Project State

Read `.hot-skillet/{story-id}/context.json` and check:

1. **Phase should be "define" with status "complete"** OR **"research" with status "in_progress"**
   - If phase is earlier than "define": Error - run `/hot-skillet-define` first
   - If phase is "research" with status "complete": Research already done, suggest `/hot-skillet-plan`
   - If phase is beyond "research": Warn user and ask if they want to re-run research

2. **Story content should exist**
   - Check for `.hot-skillet/{story-id}/research.md`
   - Should contain the story from the define phase

### Step 3: Update Phase Status

Update `context.json`:
- Set `phase` to `"research"`
- Set `phaseStatus` to `"in_progress"`
- Update `updatedAt` timestamp

### Step 4: Launch Scout Agent

Use the Task tool to launch the research agent:

```
Task tool with subagent_type: "hot-skillet-scout"
```

**Prompt for scout:**
```
Research the codebase for Hot Skillet project {story-id}.

**Story Location**: `.hot-skillet/{story-id}/research.md`
**Context File**: `.hot-skillet/{story-id}/context.json`
**Questions File**: `.hot-skillet/{story-id}/questions.json`

Your tasks:
1. Read the story from research.md
2. Analyze the story (type, scope, gaps, edge cases)
3. Generate implementation questions
4. Research the codebase thoroughly:
   - Check guides/ directory for relevant documentation
   - Look for bugfinder.md warnings
   - Read .guide.md and CLAUDE.md for project patterns
   - Find related tests to understand business rules
   - Investigate existing similar features
5. Update research.md with your complete findings (append to existing story content)
6. Add any unanswered questions to questions.json with phase: "research"

Be thorough - this research guides the entire implementation.
```

### Step 5: Review Scout Output

After the scout completes:

1. **Read the research report**:
   - Read `.hot-skillet/{story-id}/research.md`
   - Parse key sections: Story Analysis, Key Findings, Unanswered Questions

2. **Read questions file**:
   - Read `.hot-skillet/{story-id}/questions.json`
   - Check for questions with no answer

### Step 6: Handle Questions (if any)

**IF there are unanswered questions:**

Display them clearly to the user:
```markdown
## Questions Requiring Clarification

The scout identified questions that need answers before planning:

### Unanswered Questions
1. **Q1**: {Question 1}
   - Context: {why uncertain}

2. **Q2**: {Question 2}
   - Context: {why uncertain}

Please provide answers to these questions so we can proceed with planning.
```

**WAIT for user response**

After user provides answers:
1. Update questions.json with user's answers and `answeredAt` timestamp
2. Optionally add a learning to learnings.json if the answer reveals something important

**IF there are NO questions:**
- Proceed directly to reporting completion

### Step 7: Update Context and Report

Update `context.json`:
- Set `phase` to `"research"`
- Set `phaseStatus` to `"complete"`
- Update `updatedAt` timestamp

## Output

Report to the user:

```markdown
## 🍳 Hot Skillet Research Complete

**Story ID**: {story-id}
**Story**: {story title or first line}

### Research Summary
{3-5 key findings from the scout's research}

### Testing Strategy
{Brief summary of testing patterns found}

### Recommended Approach
{High-level approach from scout}

### Questions Resolved
{If any questions were asked and answered, note them}

### Files Updated
- `research.md` - Full research report
- `questions.json` - Questions and answers
- `context.json` - Updated phase status

### Next Step
Run `/hot-skillet-plan` to create the implementation task breakdown.

---
*Phase 2/6 complete. Ready for planning.*
```

## Error Handling

**If no .hot-skillet/ directory:**
```
No Hot Skillet projects found in this directory.

Run `/hot-skillet-define <story>` first to initialize a project.
```

**If story-id not found:**
```
Project "{story-id}" not found.

Available projects:
- {list projects in .hot-skillet/}

Run without arguments to use the most recent project, or specify a valid story ID.
```

**If research.md is missing:**
```
Story content not found for project {story-id}.

The research.md file is missing from .hot-skillet/{story-id}/.
This may indicate the project was not properly initialized.

Run `/hot-skillet-define` again to reinitialize.
```

**If scout agent fails:**
- Report the error
- Suggest running the skill again
- If persistent, suggest manual research

</hot-skillet-research>
