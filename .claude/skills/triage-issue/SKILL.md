---
name: triage-issue
description: Triage a GitHub issue — classify priority (P0/P1/P2), search for duplicates, apply labels, and post a triage comment.
---

# Triage a GitHub Issue

## Steps

1. **Read** the issue title and body carefully.
2. **Classify** the issue priority:
   - **P0**: Crash, data loss, or complete breakage affecting all users
   - **P1**: Significant bug or regression affecting many users
   - **P2**: Minor bug, enhancement request, question, or cosmetic issue
3. **Search** for potential duplicates among open issues:
   ```bash
   gh issue list --state open --search "<key terms from the issue>" --limit 5
   ```
4. **Apply labels** — the appropriate priority label (`P0`, `P1`, or `P2`) and `agent-triaged`:
   ```bash
   gh issue edit $ISSUE_NUMBER --add-label "<priority>,agent-triaged"
   ```
5. **Post a concise triage comment** on the issue explaining:
   - The priority classification and reasoning
   - Any related or duplicate issues found

## Rules

- Keep the comment brief and helpful.
- Do NOT modify any code.
- Do NOT close issues — only label and comment.
- If the issue lacks a clear reproduction, note that in the comment and ask the author for steps.
