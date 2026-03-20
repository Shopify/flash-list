---
name: fix-github-issue
description: Full workflow for fixing a GitHub issue - understand the problem, reproduce, diagnose root cause, fix, test on iOS/Android simulators, review, and raise a PR
---

**Load agent-device skill. DO NOT SKIP**

# Fix a GitHub Issue

## Constraints

These are hard rules. Violating any of them is a failure.

1. **NO mobile MCP** — Never call any `mcp__mobile-mcp__*` tool. No exceptions.
2. **Device interaction = `agent-device` only** — All simulator/emulator interaction (screenshots, taps, typing, scrolling, app launch/kill) MUST go through `agent-device` CLI commands. Read the agent-device skill for allowed commands. Exception: `adb` is allowed for Android emulator setup (devices, install, reverse, shell getprop, screenrecord).
3. **Reproduce first, code later** — Always reproduce the issue on the simulator before exploring code. The bug might already be fixed. Do not explore the codebase until you have confirmed the bug exists. **Exception**: Feature requests and new example screens have nothing to reproduce — go straight to implementation.
4. **If you can't repro** — When running interactively, stop and prompt the user with suggestions. When running on CI (no user), attempt to diagnose from code and issue description.

## Steps

1. Understand the issue and reproduce the problem using **agent-device skill** before exploring the code because the bug might not be there now. It will be good to initially add sample to the top of examples screen to avoid scrolling.
2. Diagnose root cause
3. Implement the fix
4. Review your code for any obvious problems
5. Verify the fix using `agent-device` skill
6. **Raise a PR** using the raise-pr skill. When running interactively, confirm with dev first. On CI, raise directly.

## Running Metro

Start from `fixture/react-native/`:

```bash
cd fixture/react-native && yarn start
```

Verify: `curl -s http://localhost:8081/status`

## Building & Installing the Fixture App

**Only build the native app if it's not already installed.** Check first:

```bash
xcrun simctl get_app_container booted org.reactjs.native.example.FlatListPro 2>/dev/null
```

- If it **succeeds**: app is installed. Just `yarn build` (TS) and relaunch.
- If it **fails**: app is not installed. Build and install:

```bash
cd fixture/react-native && yarn react-native run-ios
```

## E2E Tests

**Run E2E tests before raising a PR if any of these changed:**
- E2E test files (`*.e2e.*`)
- Example/sample screens in `fixture/react-native/src/`
- New example screens added

```bash
yarn e2e:ios
```

This runs `detox build -c ios.sim.release` followed by `detox test -c ios.sim.release`. E2E test files live in `fixture/react-native/e2e/tests/`.

**Warning:** E2E builds a **release** app that replaces the debug app on the simulator. After running E2E, rebuild debug to continue interactive testing:

```bash
cd fixture/react-native && yarn react-native run-ios
```

## Common Pitfalls

- **`estimatedItemSize` does not exist** in this FlashList — it is not a prop. Do not add it to repro screens.
- **Repro only triggers after scroll** — add `onEndReached` or prepend items to force the scroll path
- **Android and iOS behave differently** — always test both; Android uses a native RecyclerView bridge
- **Stale layout cache** — if sizes look wrong after a fix, call `ref.current?.clearLayoutCacheOnUpdate()`
- **Prop not forwarded** — check `FlashListProps.ts` and `RecyclerView.tsx` to confirm the prop reaches the layout manager
- **Grid row detection with spans** — never use `Math.floor(index / numColumns)` to determine which row an item is in when `overrideItemLayout` spans are possible. Instead, compare `layout.y` values from the layout manager — items in the same row always share the same `y`.
- **Metro port conflict** — kill anything on port 8081, then restart Metro from `fixture/react-native/`. See the Metro section above.
- **App can't connect to Metro** — if the app shows a red/yellow error about connecting to the bundler, configure the port: iOS simulator `Cmd+D` → "Configure Bundler" → set host `localhost` and port `8081`. Then reload.
- **React Native version mismatch** — the native build (0.84.x) must connect to the fixture's own Metro, not another project's bundler running a different RN version.

- **`dist/` is NOT rebuilt on branch switch** — you MUST `yarn build` after every `git checkout`. Verify with `grep` in `dist/` that the expected code change is present. Without this, you test stale code and get false results.
- **Always reproduce the bug on `main` BEFORE testing the fix** — without confirming the bug exists on the base branch, you can't prove the fix works. See `review-and-test` skill → "Review Methodology".

For more testing/debugging pitfalls (console.log, RTL setup, agent-device swipe, observable callbacks), see the **`review-and-test` skill**.

---

## Self-Evolving Instructions

When running interactively (not on CI), update this file AND the `review-and-test` skill after each fix session:

1. **Add any new pitfalls discovered** to the appropriate skill
2. **Add affected edge cases** to `review-and-test` edge case checklists

On CI, only update skill files if the learning is critical (e.g., a new pitfall that would cause repeated failures). Minor improvements should wait for interactive sessions.
