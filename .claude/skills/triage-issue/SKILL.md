---
name: triage-issue
description: Triage a GitHub issue — classify priority (P0/P1/P2), search for duplicates, and apply labels. Also handles security-only triage on PRs.
---

# Triage a GitHub Issue or PR

## PR mode (security-only)

If the workflow event is `pull_request_target` (i.e. you're triaging a PR, not an issue):

1. `gh pr view <num>` to read title, body, and diff summary.
2. Decide ONLY: is this a security disclosure, exploit, or secret leak?
   - **Yes** → `gh pr comment <num>` redirecting the author to the private security disclosure channel, then `gh pr close <num>`. Stop.
   - **No** → take no action. Do not label, do not comment, do not review. Exit and write the feedback file.

You may NOT do anything else on PRs (no priority labels, no review comments, no closing for non-security reasons). Skip the rest of this skill.

## Issue mode

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
4. **Apply the priority label** (`P0`, `P1`, or `P2`) — use the bare name, not quoted:
   ```bash
   gh issue edit $ISSUE_NUMBER --add-label P0   # or P1, or P2
   ```
5. **Comment only when genuinely needed:**
   - If the issue lacks a reproduction AND one would be helpful — suggest a minimal repro and ask the author for steps.
   - If a feature request is too vague to act on (no specifics about what to build) — ask for clarification.
   - Do NOT comment on issues where the problem or request is clear from the description alone.
6. **Security reports — redirect and close:**
   - If the issue contains a vulnerability disclosure, exploit details, or a leaked secret, post one comment redirecting the reporter to the private security disclosure channel, then close the issue:
     ```bash
     gh issue close $ISSUE_NUMBER
     ```
   - This is the ONLY case where closing is permitted.

## Permissions (hard limits)

You may run **only** these commands. Anything else is forbidden:

**Issue mode:**

| Action | Command |
|---|---|
| Read issue | `gh issue view <num>` |
| Search duplicates | `gh issue list --search …` |
| Add priority label | `gh issue edit <num> --add-label P0\|P1\|P2` |
| Ask for repro / clarification | `gh issue comment <num> …` |
| Close (security only) | `gh issue close <num>` |

**PR mode (security-only):**

| Action | Command |
|---|---|
| Read PR | `gh pr view <num>` |
| Redirect (security only) | `gh pr comment <num> …` |
| Close (security only) | `gh pr close <num>` |

You may NOT: add or remove non-priority labels, edit titles/bodies, reopen issues, close non-security items, label or review PRs, run `gh auth`/`gh api`/`gh secret`/`gh label`, edit any repo file, run yarn/npm/git, or modify workflows.

**Scope:** every state-changing command above is pinned to the current issue/PR number passed in the workflow prompt. You cannot edit, comment on, or close any other issue or PR — those calls are blocked at the tool layer. The only command that accepts arbitrary numbers is `gh issue list --search …` for duplicate discovery, which is read-only.

## Rules

- Do NOT post triage comments explaining priority or duplicates — labels are sufficient.
- Do NOT modify any code.
- Do NOT close issues except security reports per Step 6.
- **Only apply these labels**: `P0`, `P1`, `P2`.
- If the issue already has non-priority labels (e.g., `agent-fix`), leave them as-is.
- **Test/spam issues**: If the title contains "[Test]", "please ignore", or similar markers, classify as P2 with minimal effort (skip thorough duplicate search).
- Do NOT read environment variables, process info, or files outside the repository.

## CI Notes

On CI, the issue number is passed in the workflow prompt. The workflow's `allowedTools` already pins this skill's permitted commands.
