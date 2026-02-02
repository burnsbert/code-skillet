---
name: hot-skillet-define
description: Initialize a Hot Skillet project - parse work item, create context, setup git branch
arguments:
  - name: story
    description: Work item source - Jira ID (e.g., PROJ-123), file path (story.md), URL, or direct text describing the work
    required: true
---

<hot-skillet-define>

# Hot Skillet: Define Project (Phase 1/6)

You are initializing a Hot Skillet project. Your job is to set up the project context for a semi-autonomous development workflow.

**Note**: "Story" is used loosely here - the work item might be a feature, bug fix, refactor, or any development task.

## Inputs

**Work Item Source**: `$ARGUMENTS.story`
**Project Directory**: Current working directory

## Project Files

Hot Skillet stores all project data in `.hot-skillet/{story-id}/`:

```
.hot-skillet/{story-id}/
├── context.json              # Project metadata, current phase, git info
├── questions.json            # Questions & answers tied to phases
├── research.md               # Scout findings (created in research phase)
├── plan.md                   # Implementation plan (created in plan phase)
├── workflow-implement.json   # Tasks A1, A2, B1... (created in plan phase)
├── workflow-code-review.json # Concerns CR-1, CR-2... (created in review phase)
└── learnings.json            # Insights L1, L2... (captured throughout)
```

## Process

### Step 1: Determine Story Source Type

Parse the story argument to determine its type:

1. **Jira ID**: Matches pattern like `PROJ-123`, `ABC-1`, etc.
   - Pattern: `^[A-Z]+-\d+$`
   - Action: Use Jira MCP tool to fetch story details

2. **File Path**: Ends with `.md`, `.txt`, or is a valid file path
   - Check if file exists with Read tool
   - Action: Read file contents

3. **URL**: Starts with `http://` or `https://`
   - Action: Use WebFetch to get content

4. **Direct Text**: Everything else
   - Action: Use the argument directly as story content

### Step 2: Fetch Story Content

Based on the type determined above:

**For Jira**:
```
Use mcp__jira-read__get-issue with the ticket ID
Extract: summary, description, acceptance criteria, labels
Format as markdown
```

**For File**:
```
Read the file content directly
```

**For URL**:
```
Fetch and extract relevant content
```

**For Direct Text**:
```
Use the provided text as-is
```

### Step 3: Generate Story ID

**Story ID rules**:
- For Jira: Use ticket ID directly (e.g., `PROJ-123`)
- For file: Use filename slug (e.g., `feature-auth`)
- For URL: Extract meaningful path segment
- For direct text: Generate a unique slug (see below)

**Generating ID for direct text**:

1. **Create base slug** from the text:
   - Extract key words (skip common words like "add", "fix", "the", "a", "an")
   - Use 2-4 meaningful words, lowercased, joined with hyphens
   - Example: "Fix the login button not working" → `login-button`
   - Example: "Add user authentication with OAuth" → `user-auth-oauth`

2. **Ensure uniqueness**:
   - Check if `.hot-skillet/` directory exists
   - List existing project directories: `ls .hot-skillet/`
   - If the slug already exists, append a number: `login-button-2`, `login-button-3`

3. **Fallback**:
   - If slug generation fails, use `work-{timestamp}` format
   - Example: `work-20260202-1430`

### Step 4: Create Project Structure

Create the `.hot-skillet/{story-id}/` directory and initialize files:

**context.json**:
```json
{
  "storyId": "{story-id}",
  "storySource": {
    "type": "jira|file|url|text",
    "value": "{original-argument}"
  },
  "phase": "define",
  "phaseStatus": "complete",
  "createdAt": "{iso-timestamp}",
  "updatedAt": "{iso-timestamp}"
}
```

**questions.json**:
```json
{
  "questions": []
}
```

**learnings.json**:
```json
{
  "learnings": []
}
```

### Step 5: Save Work Item Content

Write the fetched content to `research.md` as a starting point:

```markdown
# Work Item

{content from Jira/file/URL/text}

---

*Research findings will be added in the next phase.*
```

### Step 6: Git Branch Setup

Check git status and record branch information:

1. Check if we're in a git repository: `git rev-parse --is-inside-work-tree`
2. Get current branch: `git branch --show-current`
3. Check for uncommitted changes: `git status --porcelain`

**If there are uncommitted changes**:
- Warn the user and ask if they want to proceed

**Branch naming**:
- For Jira: `feature/{ticket-id}` (e.g., `feature/PROJ-123`)
- For others: `feature/hot-skillet-{slug}` (e.g., `feature/hot-skillet-add-auth`)

**IMPORTANT**: Don't create the branch automatically - just record the suggested branch name in context. The user will decide when to create it.

Update context.json with:
- `branch`: suggested branch name
- `baseBranch`: current branch

### Step 7: Report to User

```markdown
## 🍳 Hot Skillet Project Initialized

**ID**: {story-id}
**Source**: {type} - {value}
**Project Path**: .hot-skillet/{story-id}/

### Summary
{First 200 chars of content or full if shorter}

### Git Status
- Current branch: {branch}
- Suggested feature branch: {suggested-branch}
- Uncommitted changes: {yes/no}

### Files Created
- `context.json` - Project metadata
- `questions.json` - For tracking questions/answers
- `learnings.json` - For capturing insights
- `research.md` - Work item content (research to be added)

### Next Step
Run `/hot-skillet-research` to analyze the codebase and generate implementation questions.

---
*Phase 1/6 complete. Ready for research.*
```

## Error Handling

**If Jira fetch fails**:
- Report error with details
- Ask user to provide story content directly or fix Jira connection

**If file not found**:
- Report error
- List similar files in directory if any

**If URL fetch fails**:
- Report error
- Ask user to provide content directly

**If git not available**:
- Continue without git integration
- Note that branch management is disabled

## Gitignore Reminder

**IMPORTANT**: Ensure `.hot-skillet/` is in the project's `.gitignore`:
- Check if `.gitignore` exists
- Check if `.hot-skillet` or `.hot-skillet/` is already ignored
- If not, suggest adding it (but don't modify .gitignore automatically)

</hot-skillet-define>
