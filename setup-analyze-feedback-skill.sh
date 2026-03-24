#!/bin/bash
# Setup script for the analyze-feedback skill.
# Run this once to move files into the correct .claude/ directory structure.
# After running, delete this script and commit.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

mkdir -p "$REPO_ROOT/.claude/skills/analyze-feedback"
mv "$REPO_ROOT/analyze-feedback-SKILL.md" "$REPO_ROOT/.claude/skills/analyze-feedback/SKILL.md"
mv "$REPO_ROOT/feedback-scan-cursor.json" "$REPO_ROOT/.claude/feedback-scan-cursor.json"

echo "Done. Files moved to:"
echo "  .claude/skills/analyze-feedback/SKILL.md"
echo "  .claude/feedback-scan-cursor.json"
echo ""
echo "You can now delete this script and commit."
