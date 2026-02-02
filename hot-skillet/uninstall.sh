#!/usr/bin/env bash
#
# Hot Skillet Uninstallation Script
# Removes symlinks from ~/.claude/
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
echo "  ║       Hot Skillet Uninstallation          ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Collect what will be removed
AGENTS=($(ls "$SCRIPT_DIR/agents/"*.md 2>/dev/null | xargs -n1 basename))
SKILLS=($(ls -d "$SCRIPT_DIR/skills/"*/ 2>/dev/null | xargs -n1 basename))

# Find installed symlinks
INSTALLED_AGENTS=()
INSTALLED_SKILLS=()

for agent in "${AGENTS[@]}"; do
    target="$CLAUDE_DIR/agents/$agent"
    if [[ -L "$target" ]]; then
        link=$(readlink "$target")
        if [[ "$link" == "$SCRIPT_DIR/agents/$agent" ]]; then
            INSTALLED_AGENTS+=("$agent")
        fi
    fi
done

for skill in "${SKILLS[@]}"; do
    target="$CLAUDE_DIR/skills/$skill"
    if [[ -L "$target" ]]; then
        link=$(readlink "$target")
        if [[ "$link" == "$SCRIPT_DIR/skills/$skill" ]]; then
            INSTALLED_SKILLS+=("$skill")
        fi
    fi
done

if [[ ${#INSTALLED_AGENTS[@]} -eq 0 && ${#INSTALLED_SKILLS[@]} -eq 0 ]]; then
    echo "No Hot Skillet components are currently installed."
    exit 0
fi

echo -e "${YELLOW}Components to remove:${NC}"
echo ""

if [[ ${#INSTALLED_AGENTS[@]} -gt 0 ]]; then
    echo "  Agents (${#INSTALLED_AGENTS[@]}):"
    for agent in "${INSTALLED_AGENTS[@]}"; do
        echo "    - $agent"
    done
fi

if [[ ${#INSTALLED_SKILLS[@]} -gt 0 ]]; then
    echo ""
    echo "  Skills (${#INSTALLED_SKILLS[@]}):"
    for skill in "${INSTALLED_SKILLS[@]}"; do
        echo "    - $skill"
    done
fi

echo ""
read -p "Proceed with uninstallation? [y/N] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Uninstallation cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Removing...${NC}"
echo ""

for agent in "${INSTALLED_AGENTS[@]}"; do
    rm "$CLAUDE_DIR/agents/$agent"
    echo -e "  ${RED}-${NC} agents/$agent"
done

for skill in "${INSTALLED_SKILLS[@]}"; do
    rm "$CLAUDE_DIR/skills/$skill"
    echo -e "  ${RED}-${NC} skills/$skill"
done

echo ""
echo -e "${GREEN}Uninstallation complete.${NC}"
