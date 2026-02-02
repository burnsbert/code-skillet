#!/usr/bin/env bash
#
# Hot Skillet Installation Script
# Sets up symlinks from ~/.claude/ to enable Hot Skillet agents and skills
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║        Hot Skillet Installation           ║"
echo "  ║   Semi-autonomous development workflow    ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Claude Code directory exists
if [[ ! -d "$CLAUDE_DIR" ]]; then
    echo -e "${RED}Error: Claude Code directory not found at $CLAUDE_DIR${NC}"
    echo "Please install Claude Code first: https://claude.ai/code"
    exit 1
fi

# Create agents and skills directories if they don't exist
mkdir -p "$CLAUDE_DIR/agents" "$CLAUDE_DIR/skills"

# Collect what will be installed
AGENTS=($(ls "$SCRIPT_DIR/agents/"*.md 2>/dev/null | xargs -n1 basename))
SKILLS=($(ls -d "$SCRIPT_DIR/skills/"*/ 2>/dev/null | xargs -n1 basename))

echo -e "${GREEN}Components to install:${NC}"
echo ""
echo "  Agents (${#AGENTS[@]}):"
for agent in "${AGENTS[@]}"; do
    echo "    - $agent"
done
echo ""
echo "  Skills (${#SKILLS[@]}):"
for skill in "${SKILLS[@]}"; do
    echo "    - $skill"
done
echo ""

# Check for conflicts
CONFLICTS=()
WARNINGS=()

echo -e "${YELLOW}Checking for conflicts...${NC}"
echo ""

for agent in "${AGENTS[@]}"; do
    target="$CLAUDE_DIR/agents/$agent"
    if [[ -e "$target" && ! -L "$target" ]]; then
        CONFLICTS+=("agents/$agent (existing file)")
    elif [[ -L "$target" ]]; then
        existing_link=$(readlink "$target")
        expected_link="$SCRIPT_DIR/agents/$agent"
        if [[ "$existing_link" != "$expected_link" ]]; then
            WARNINGS+=("agents/$agent (symlink exists -> $existing_link)")
        fi
    fi
done

for skill in "${SKILLS[@]}"; do
    target="$CLAUDE_DIR/skills/$skill"
    if [[ -e "$target" && ! -L "$target" ]]; then
        CONFLICTS+=("skills/$skill (existing directory)")
    elif [[ -L "$target" ]]; then
        existing_link=$(readlink "$target")
        expected_link="$SCRIPT_DIR/skills/$skill"
        if [[ "$existing_link" != "$expected_link" ]]; then
            WARNINGS+=("skills/$skill (symlink exists -> $existing_link)")
        fi
    fi
done

# Report conflicts
if [[ ${#CONFLICTS[@]} -gt 0 ]]; then
    echo -e "${RED}CONFLICTS FOUND (will not overwrite):${NC}"
    for conflict in "${CONFLICTS[@]}"; do
        echo -e "  ${RED}!${NC} $conflict"
    done
    echo ""
    echo -e "${RED}Cannot proceed with conflicts. Please manually remove or rename these files.${NC}"
    exit 1
fi

# Report warnings
if [[ ${#WARNINGS[@]} -gt 0 ]]; then
    echo -e "${YELLOW}WARNINGS (existing symlinks will be replaced):${NC}"
    for warning in "${WARNINGS[@]}"; do
        echo -e "  ${YELLOW}!${NC} $warning"
    done
    echo ""
fi

if [[ ${#CONFLICTS[@]} -eq 0 && ${#WARNINGS[@]} -eq 0 ]]; then
    echo -e "${GREEN}No conflicts found.${NC}"
    echo ""
fi

# Ask for confirmation
echo -e "Install location: ${BLUE}$CLAUDE_DIR${NC}"
echo ""
read -p "Proceed with installation? [y/N] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Installing...${NC}"
echo ""

# Install agents
for agent in "${AGENTS[@]}"; do
    target="$CLAUDE_DIR/agents/$agent"
    source="$SCRIPT_DIR/agents/$agent"

    # Remove existing symlink if present
    if [[ -L "$target" ]]; then
        rm "$target"
    fi

    ln -s "$source" "$target"
    echo -e "  ${GREEN}+${NC} agents/$agent"
done

# Install skills
for skill in "${SKILLS[@]}"; do
    target="$CLAUDE_DIR/skills/$skill"
    source="$SCRIPT_DIR/skills/$skill"

    # Remove existing symlink if present
    if [[ -L "$target" ]]; then
        rm "$target"
    fi

    ln -s "$source" "$target"
    echo -e "  ${GREEN}+${NC} skills/$skill"
done

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Hot Skillet skills are now available:"
echo "  /hot-skillet-define    - Stage 1: Initialize a project"
echo "  /hot-skillet-research  - Stage 2: Codebase research"
echo "  /hot-skillet-plan      - Stage 3: Create implementation plan"
echo "  /hot-skillet-implement - Stage 4: Execute tasks with TDD"
echo "  /hot-skillet-review    - Stage 5: Code review and PR"
echo "  /hot-skillet-report    - Stage 6: Status report"
echo ""
echo -e "Run ${BLUE}/hot-skillet-define <story>${NC} to start a new project."
