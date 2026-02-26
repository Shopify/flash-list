---
name: fix-github-issue
description: Full workflow for fixing a FlashList GitHub issue: understand the problem, create a repro sample in the fixture app, diagnose root cause, fix, test on iOS and Android simulators, review, and raise a PR.
---

# Fix a FlashList GitHub Issue

## Prerequisites

Check all required tools are available before starting:

```bash
which agent-device && which gh
```

If `agent-device` is missing:
```
agent-device is not installed. Run: npm install -g agent-device
```

If `gh` is missing:
```
GitHub CLI is not installed. Run: brew install gh
Then authenticate: gh auth login
```

---

## Running Metro on a Free Port

Default Metro port is 8081. If it's already in use, find a free port and start Metro explicitly.

### Find what's using port 8081

```bash
lsof -ti :8081
```

If it returns a PID, either kill it or pick a different port:

```bash
# Kill whatever is on 8081
kill -9 $(lsof -ti :8081)

# Or find a free port
lsof -ti :8082 || echo "8082 is free"
lsof -ti :8083 || echo "8083 is free"
```

### Start Metro on a custom port

From `fixture/react-native/`:

```bash
yarn react-native start --port 8082
```

Or from the repo root:

```bash
cd fixture/react-native && yarn start --port 8082
```

### Tell the simulator to use the custom port

**iOS** — pass the port when building/running:

```bash
cd fixture/react-native && yarn react-native run-ios --port 8082
```

**Android** — reverse the port via ADB so the emulator can reach Metro on your machine:

```bash
adb reverse tcp:8082 tcp:8082
cd fixture/react-native && yarn react-native run-android --port 8082
```

### In-app Dev Menu (already running app)

If the app is already installed and running, reload it against the new port without rebuilding:

- **iOS simulator**: `Cmd+D` → "Configure Bundler" → set host `localhost` and port `8082`
- **Android emulator**: shake or `Cmd+M` → "Configure Bundler" → set host `10.0.2.2` and port `8082`

### Verify Metro is reachable

```bash
curl -s http://localhost:8082/status
# Should return: {"status":"packager-status:running"}
```

---

## Workflow Overview

1. Understand the issue
2. Create a reproduction sample
3. Reproduce on iOS and Android
4. Diagnose root cause
5. Implement the fix
6. **Test & review** → use the `review-and-test` skill
7. Raise a PR

---

## Step 1 — Understand the Issue

Fetch the issue from GitHub:

```bash
gh issue view <issue-number> --repo Shopify/flash-list
```

Read the issue thoroughly. Extract:
- **Symptom**: What the user observes (visual bug, crash, wrong behavior, performance)
- **Props/config**: Which FlashList props are involved
- **Platform**: iOS only, Android only, or both
- **Reproduction steps**: How to trigger the bug
- **Expected vs actual behavior**

Also fetch any linked PRs or referenced issues for context:
```bash
gh issue view <issue-number> --repo Shopify/flash-list --comments
```

---

## Step 2 — Create a Reproduction Sample

Add a dedicated screen to the fixture app that isolates and reproduces the issue.

### 2a. Create the sample component

Create `fixture/react-native/src/IssueRepro<number>.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import FlashList from "../../../../src";

// Minimal reproduction for issue #<number>
// <brief description of the bug>
export default function IssueRepro<number>() {
  // Use the minimum props needed to trigger the bug
  return (
    <FlashList
      data={...}
      renderItem={...}
    />
  );
}

const styles = StyleSheet.create({ ... });
```

Keep it minimal — only include props that are necessary to trigger the bug.

### 2b. Register the screen

In `fixture/react-native/src/constants.ts`, add to `RootStackParamList`:
```ts
IssueRepro<number>: undefined;
```

In `fixture/react-native/src/NavigationTree.tsx`, add:
```tsx
<Stack.Screen name="IssueRepro<number>" component={IssueRepro<number>} />
```

In `fixture/react-native/src/ExamplesScreen.tsx`, add an entry to the examples list:
```tsx
{ title: "Issue #<number>: <short description>", destination: "IssueRepro<number>" }
```

### 2c. Build

**CRITICAL**: The fixture app uses compiled `dist/`. Always build after source changes:
```bash
yarn build
```

---

## Step 3 — Reproduce on iOS and Android

Use `agent-device` to navigate to the repro screen and confirm the bug is visible.

### iOS

```bash
yarn fixture:rn:ios
```

Then with agent-device:
```bash
agent-device open "FlatListPro" --platform ios
agent-device screenshot /tmp/examples.png
# Visually locate the repro screen entry, calculate logical coordinates, and press
agent-device press <x> <y>
```

**Note**: Use `agent-device screenshot` + `agent-device press` (coordinate-based). The `find`/`snapshot` commands can be unreliable with ambiguous matches in the Examples list. See the `agent-device` skill for coordinate mapping.

Capture the buggy state:
```bash
agent-device screenshot repro-ios-before.png
```

### Android

```bash
yarn fixture:rn:android
```

Then:
```bash
agent-device open "FlashList" --platform android
agent-device snapshot -i
agent-device find "Issue #<number>" click
agent-device snapshot -i
agent-device screenshot repro-android-before.png
```

### Confirm Reproduction

- Describe exactly what you observe on each platform
- Note if the bug is platform-specific
- If the bug is not visible in the sample, revisit Step 2 and adjust props/data

---

## Step 4 — Diagnose Root Cause

### Source Code Map

| Area | Location |
|------|----------|
| Core component | `src/recyclerview/RecyclerView.tsx` |
| Layout logic | `src/recyclerview/layout-managers/` (`LayoutManager.ts` base, `GridLayoutManager.ts`, `MasonryLayoutManager.ts`, `LinearLayoutManager.ts`) |
| Item recycling & separators | `src/recyclerview/ViewHolder.tsx`, `ViewHolderCollection.tsx` |
| Scroll behavior | `src/recyclerview/useSecondaryProps.ts` |
| Visibility/viewability | `src/recyclerview/viewability/` |
| Sticky headers | `src/recyclerview/StickyHeaders.tsx` |
| Scroll anchoring | `src/recyclerview/ScrollAnchor.tsx` |
| Average window | `src/utils/AverageWindow.ts` |
| Props interface | `src/FlashListProps.ts` |

### Diagnosis Steps

1. Search for the relevant prop or API surface:
   ```bash
   grep -r "propName" src/ --include="*.ts" --include="*.tsx" -l
   ```

2. Trace the code path from prop → render → layout → scroll

3. Add debug logging if needed — see **`review-and-test` skill → "Debug Logging on Fabric"** for the HTTP server approach (`console.log` does NOT work on Fabric/Hermes)

4. Check existing unit tests for the affected area:
   ```bash
   yarn test --testPathPattern="RelatedTest"
   ```

5. Write a hypothesis: "The bug occurs because ____"

---

## Step 5 — Implement the Fix

### Guidelines

- Fix the root cause, not the symptom
- Keep the change minimal and focused
- Do not refactor unrelated code
- Match the existing code style

### Commit message format

```
fix(<scope>): <concise description of what is fixed>
```

Examples:
```
fix(hooks): eliminate scroll jitter when prepending items at bottom
fix: filter stale indices from layoutInfo after truncation
fix(layout): correct estimated size calculation for horizontal lists
```

### Add or update unit tests

If there is an existing test file for the changed module, add a test case:
```bash
# Test files live in:
src/__tests__/
```

Run tests after the fix:
```bash
yarn test
yarn type-check
yarn lint
```

All three must pass before moving to device testing.

---

## Step 6 — Test & Review

**Delegate to the `review-and-test` skill.** It covers:
- Building and relaunching the app
- LTR device testing
- RTL testing (proper setup, verification checklist, scroll semantics)
- `firstItemOffset` verification for layout/measurement changes
- Debug logging on Fabric (HTTP server workaround)
- Edge case checklists (layout, RTL, sticky headers, Fabric)
- Review summary format

---

## Step 7 — Raise a PR

**Delegate to the `raise-pr` skill.** It covers:
- Branch naming and commit message format
- PR title and body template
- **No AI/Claude attribution** — enforced in commits and PR body
- Pre-submission checklist (no debug code, no `forceRTL(true)` left over)

Only raise the PR when explicitly asked by the user.

---

## Common Pitfalls

- **`estimatedItemSize` does not exist** in this FlashList — it is not a prop. Do not add it to repro screens.
- **Repro only triggers after scroll** — add `onEndReached` or prepend items to force the scroll path
- **Android and iOS behave differently** — always test both; Android uses a native RecyclerView bridge
- **Stale layout cache** — if sizes look wrong after a fix, call `ref.current?.clearLayoutCacheOnUpdate()`
- **Prop not forwarded** — check `FlashListProps.ts` and `RecyclerView.tsx` to confirm the prop reaches the layout manager
- **Grid row detection with spans** — never use `Math.floor(index / numColumns)` to determine which row an item is in when `overrideItemLayout` spans are possible. Instead, compare `layout.y` values from the layout manager — items in the same row always share the same `y`.
- **Metro port conflict** — default port 8081 may be used by another project. Kill the other Metro, then restart on 8081 from `fixture/react-native/`. See the Metro section above.
- **React Native version mismatch** — the native build (0.79.x) must connect to the fixture's own Metro, not another project's bundler running a different RN version.

- **`dist/` is NOT rebuilt on branch switch** — you MUST `yarn build` after every `git checkout`. Verify with `grep` in `dist/` that the expected code change is present. Without this, you test stale code and get false results.
- **Always reproduce the bug on `main` BEFORE testing the fix** — without confirming the bug exists on the base branch, you can't prove the fix works. See `review-and-test` skill → "Review Methodology".

For more testing/debugging pitfalls (console.log, RTL setup, agent-device swipe, observable callbacks), see the **`review-and-test` skill**.

---

## Self-Evolving Instructions

After each fix session, update this file AND the `review-and-test` skill:
1. **Add any new pitfalls discovered** to the appropriate skill
2. **Add affected edge cases** to `review-and-test` edge case checklists
3. **Update source code map** if new files were found to be relevant
4. **Log the issue number + one-line fix summary** in the Fixes Log below

### Fixes Log

| Issue | Summary | Key files changed |
|-------|---------|-------------------|
| [#2017](https://github.com/Shopify/flash-list/issues/2017) | Fabric `measureParentSize` returns non-zero y when content is above FlashList, corrupting `firstItemOffset` and activating sticky overlay too early | `measureLayout.ts`, `measureLayout.web.ts`, `RecyclerView.tsx` |
| [#1868](https://github.com/Shopify/flash-list/issues/1868) | Last item in grid row stretched when `numColumns > 1` + `ItemSeparatorComponent` — separator rendered inside ViewHolder causes height mismatch; fix: added `isInLastRow(index)` to LayoutManager (overridden in GridLayoutManager with y-coordinate check), ViewHolderCollection suppresses separators for last-row items | `LayoutManager.ts`, `GridLayoutManager.ts`, `MasonryLayoutManager.ts`, `RecyclerViewManager.ts`, `ViewHolderCollection.tsx`, `RecyclerView.tsx` |
