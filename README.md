# Code-Skillet

A real-time visual dashboard for AI-assisted development. Watch tasks move through columns as agents work, approve plans in-browser, and interact with an embedded Claude Code terminal.

## Features

- **Task Dashboard**: Kanban-style board showing tasks moving through phases (Backlog → Planning → In Progress → Verifying → Done)
- **Plan Approval**: View, edit, and approve generated plans with markdown support
- **Embedded Terminal**: Watch Claude Code session output in real-time
- **Theming**: Multiple themes to customize your experience
- **Real-time Updates**: WebSocket-powered live updates

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

This starts both the backend server (port 3001) and the frontend dev server (port 5173).

## Project Structure

```
code-skillet/
├── packages/
│   ├── server/         # Node.js + Express + WebSocket backend
│   └── ui/             # Svelte 5 + Vite frontend
├── package.json        # Workspace root
├── LICENSE             # MIT
└── README.md
```

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and UI in development mode |
| `npm run dev:server` | Start only the backend server |
| `npm run dev:ui` | Start only the frontend |
| `npm run build` | Build both packages for production |
| `npm run lint` | Run linting on all packages |
| `npm run format` | Format code with Prettier |

## License

MIT
