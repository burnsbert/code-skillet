# Code-Skillet

A real-time visual dashboard for AI-assisted development, featuring **Hot Skillet** - a semi-autonomous development workflow powered by Claude Code.

## Features

- **Hot Skillet Workflow**: 6-stage semi-autonomous development (Define → Research → Plan → Implement → Review → Report)
- **Task Dashboard**: Kanban-style board showing tasks moving through phases
- **Plan Approval**: View, edit, and approve generated plans with markdown support
- **Embedded Terminal**: Watch Claude Code session output in real-time
- **Theming**: 16 themes to customize your experience
- **Real-time Updates**: WebSocket-powered live updates

## Hot Skillet

Hot Skillet is a semi-autonomous development workflow that breaks down stories into tasks and implements them with test-driven development.

### Installation

Requires [Claude Code](https://claude.ai/code) to be installed.

```bash
# Clone the repo
git clone https://github.com/yourusername/code-skillet.git
cd code-skillet

# Install Hot Skillet agents and skills
./hot-skillet/install.sh
```

### Workflow Stages

| Stage | Skill | Description |
|-------|-------|-------------|
| 1 | `/hot-skillet-define` | Initialize project from story (Jira, file, URL, or text) |
| 2 | `/hot-skillet-research` | Scout agent analyzes codebase, identifies patterns |
| 3 | `/hot-skillet-plan` | Planner creates tasks, reviewer vets them, user approves |
| 4 | `/hot-skillet-implement` | Dev-doers implement tasks with TDD, validator confirms |
| 5 | `/hot-skillet-review` | Code review, address concerns, create PR |
| 6 | `/hot-skillet-report` | Status report and completion summary |

### Quick Start

```bash
# In any project directory with Claude Code running:

# Start with a story
/hot-skillet-define "Add user authentication with JWT tokens"

# Or from a Jira ticket
/hot-skillet-define PROJ-123

# Then follow the stages
/hot-skillet-research
/hot-skillet-plan
/hot-skillet-implement
/hot-skillet-review
```

### Project Files

Hot Skillet creates a `.hot-skillet/{project-id}/` directory in your project:

```
.hot-skillet/{project-id}/
├── context.json    # Workflow state
├── story.md        # Original story
├── research.md     # Scout findings
├── plan.md         # Implementation plan
├── tasks.json      # Task breakdown
├── review.md       # Code review report
└── report.md       # Completion report
```

### Uninstall

```bash
./hot-skillet/uninstall.sh
```

## Dashboard (Web UI)

### Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

Opens the dashboard at http://localhost:5173 with backend on port 3002.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and UI in development mode |
| `npm run dev:server` | Start only the backend server |
| `npm run dev:ui` | Start only the frontend |
| `npm run build` | Build both packages for production |
| `npm run lint` | Run linting on all packages |
| `npm run format` | Format code with Prettier |

## Project Structure

```
code-skillet/
├── hot-skillet/           # Claude Code agents and skills
│   ├── agents/            # 9 specialized agents
│   ├── skills/            # 6 workflow skills
│   ├── install.sh         # Installation script
│   └── uninstall.sh       # Uninstallation script
├── packages/
│   ├── server/            # Node.js + Express + WebSocket backend
│   └── ui/                # Svelte 4 + Vite frontend
├── package.json           # Workspace root
└── README.md
```

## Requirements

- Node.js 18+
- npm 9+
- [Claude Code](https://claude.ai/code) (for Hot Skillet)

## License

MIT
