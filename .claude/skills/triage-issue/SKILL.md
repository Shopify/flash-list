---
name: triage-issue
description: Triage a GitHub issue — classify priority (P0/P1/P2), search for duplicates, and apply labels.
---

# Triage a GitHub Issue

## Steps

1. **Read** the issue title and body carefully.
2. **Classify** the issue priority:
   - **P0**: Crash, data loss, or complete breakage affecting all users
   - **P1**: Significant bug or regression affecting many users
   - **P2**: Minor bug, enhancement request, question, or cosmetic issue
3. **Search** for potential duplicates among open AND closed issues (closed bugs may have regressed):
   ```bash
   gh issue list --state open --search "<key terms from the issue>" --limit 5
   gh issue list --state closed --search "<key terms from the issue>" --limit 5
   ```
4. **Apply the priority label** (`P0`, `P1`, or `P2`):
   ```bash
   gh issue edit $ISSUE_NUMBER --add-label "<priority>"
   ```
5. **Comment only when genuinely needed:**
   - If the issue lacks a reproduction AND one would be helpful — suggest a minimal repro and ask the author for steps.
   - If a feature request is too vague to act on (no specifics about what to build) — ask for clarification.
   - Do NOT comment on issues where the problem or request is clear from the description alone.

## Rules

- Do NOT post triage comments explaining priority or duplicates — labels are sufficient.
- Do NOT modify any code.
- Do NOT close issues — only label (and comment if repro is missing).
- **Only apply these labels**: `P0`, `P1`, `P2`. Do NOT apply any other labels (especially not `agent-fix`).
- Do NOT run `gh auth`, `gh api`, `gh secret`, or any `gh` command other than `gh issue`.
- Do NOT read environment variables, process info, or files outside the repository.
