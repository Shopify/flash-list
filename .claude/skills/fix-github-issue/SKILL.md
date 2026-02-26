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
6. Verify fix on iOS and Android
7. Review code changes
8. Raise a PR

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
      estimatedItemSize={...}
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

Start or rebuild the TypeScript watcher from the repo root:
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
agent-device open "FlashList" --platform ios
agent-device snapshot -i
agent-device find "Issue #<number>" click
agent-device snapshot -i
```

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
| Layout logic | `src/recyclerview/layout-managers/` |
| Item recycling | `src/recyclerview/ViewHolder.tsx`, `ViewHolderCollection.tsx` |
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

3. Add debug logging if needed (remove before the fix lands):
   ```ts
   console.log("[debug]", relevantValue);
   ```

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

All three must pass before moving to testing on device.

---

## Step 6 — Verify Fix on iOS and Android

Relaunch both simulators and navigate to the repro screen to confirm the fix.

### iOS

```bash
agent-device open "FlashList" --platform ios
agent-device snapshot -i
agent-device find "Issue #<number>" click
agent-device snapshot -i
agent-device screenshot fix-ios-after.png
```

Compare before/after screenshots visually. Confirm:
- Bug is no longer present
- No visual regressions on the repro screen
- No new warnings in Metro output

### Android

```bash
agent-device open "FlashList" --platform android
agent-device snapshot -i
agent-device find "Issue #<number>" click
agent-device snapshot -i
agent-device screenshot fix-android-after.png
```

### Smoke Test Other Screens

Navigate a few related screens to check for regressions:

```bash
agent-device find "List" click
agent-device snapshot -i
agent-device back
agent-device find "Grid" click
agent-device snapshot -i
agent-device back
```

If a regression is found, return to Step 5.

---

## Step 7 — Review Code Changes

Show the full diff:

```bash
git diff
```

Review checklist:
- [ ] Fix addresses the root cause described in Step 4
- [ ] No unrelated changes included
- [ ] No debug `console.log` statements left in
- [ ] New test case covers the fix
- [ ] `yarn test` passes
- [ ] `yarn type-check` passes
- [ ] `yarn lint` passes
- [ ] The repro screen from Step 2 is included in the commit (as a visual reference for reviewers)

If any item fails, fix it before proceeding.

---

## Step 8 — Raise a PR

### Stage and commit

```bash
git checkout -b fix/issue-<number>-<short-slug>
git add <specific files>
git commit -m "fix(<scope>): <description>

Fixes #<number>"
git push -u origin fix/issue-<number>-<short-slug>
```

### Create the PR

```bash
gh pr create \
  --repo Shopify/flash-list \
  --title "fix(<scope>): <description>" \
  --body "$(cat <<'EOF'
## Description

<Explain what the bug was and how the fix works>

Fixes #<number>

## Reviewers' hat-rack :tophat:

<What to look at — layout logic, hook behavior, edge cases>

## Screenshots or videos

**Before:**
![iOS before](repro-ios-before.png)
![Android before](repro-android-before.png)

**After:**
![iOS after](fix-ios-after.png)
![Android after](fix-android-after.png)

## Test plan
- [ ] Repro screen confirms bug is fixed on iOS
- [ ] Repro screen confirms bug is fixed on Android
- [ ] No regressions observed on List, Grid, Chat, Carousel screens
- [ ] Unit tests pass (`yarn test`)
- [ ] Type check passes (`yarn type-check`)
EOF
)"
```

Return the PR URL to the user.

---

## Common Pitfalls

- **Estimating item size incorrectly in repro** — use a `console.log` in `renderItem` to log actual heights
- **Repro only triggers after scroll** — add `onEndReached` or prepend items to force the scroll path
- **Android and iOS behave differently** — always test both; Android uses a native RecyclerView bridge
- **Stale layout cache** — if sizes look wrong after a fix, call `ref.current?.clearLayoutCacheOnUpdate()`
- **Prop not forwarded** — check `FlashListProps.ts` and `RecyclerView.tsx` to confirm the prop reaches the layout manager
