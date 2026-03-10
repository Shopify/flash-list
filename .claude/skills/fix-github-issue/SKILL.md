---
name: fix-github-issue
description: Full workflow for fixing a GitHub issue - understand the problem, reproduce, diagnose root cause, fix, test on iOS/Android simulators, review, and raise a PR
---

# Fix a GitHub Issue

## Constraints

These are hard rules. Violating any of them is a failure.

1. **NO mobile MCP** — Never call any `mcp__mobile-mcp__*` tool. No exceptions.
2. **NO adb** — Never run `adb shell`, `adb push`, `adb pull`, `adb exec-out`, or any other `adb` command. No exceptions.
3. **Device interaction = `agent-device` only** — All simulator/emulator interaction (screenshots, taps, typing, scrolling, app launch/kill) MUST go through `agent-device` CLI commands. Read the agent-device skill for allowed commands.
4. **Reproduce first, code later** — Always reproduce the issue on the simulator before exploring code. The bug might already be fixed. Do not explore the codebase until you have confirmed the bug exists.
5. **If you can't repro, stop** — Do not continue. Prompt the user with suggestions instead.

## Steps

1. Understand the issue and reproduce the problem using **agent-device skill** before exploring the code because the bug might not be there now. It will be good to intially add sample to the top of examples screen to avoid scrolling.
2. Diagnose root cause
3. Implement the fix
4. Review your code for any obvious problems
5. Verify the fix using `agent-device` skill
6. **Raise a PR** using the relevant skill but confirm with dev first.

## Running Metro

Metro port is **8087**. Start from `fixture/react-native/`:

```bash
cd fixture/react-native && yarn start --port 8087
```

Verify: `curl -s http://localhost:8087/status`

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

**If you add or modify any e2e tests (files matching `*.e2e.*`)**, you MUST run them and verify they pass before raising a PR:

```bash
yarn e2e:ios
```

This runs `detox build -c ios.sim.release` followed by `detox test -c ios.sim.release`. E2e test files live in `fixture/react-native/e2e/tests/`.

## Common Pitfalls

- **`estimatedItemSize` does not exist** in this FlashList — it is not a prop. Do not add it to repro screens.
- **Repro only triggers after scroll** — add `onEndReached` or prepend items to force the scroll path
- **Android and iOS behave differently** — always test both; Android uses a native RecyclerView bridge
- **Stale layout cache** — if sizes look wrong after a fix, call `ref.current?.clearLayoutCacheOnUpdate()`
- **Prop not forwarded** — check `FlashListProps.ts` and `RecyclerView.tsx` to confirm the prop reaches the layout manager
- **Grid row detection with spans** — never use `Math.floor(index / numColumns)` to determine which row an item is in when `overrideItemLayout` spans are possible. Instead, compare `layout.y` values from the layout manager — items in the same row always share the same `y`.
- **Metro port conflict** — this project uses port 8087. Kill anything on that port, then restart Metro from `fixture/react-native/`. See the Metro section above.
- **App can't connect to Metro** — if the app shows a red/yellow error about connecting to the bundler, configure the port: iOS simulator `Cmd+D` → "Configure Bundler" → set host `localhost` and port `8087`. Then reload.
- **React Native version mismatch** — the native build (0.84.x) must connect to the fixture's own Metro, not another project's bundler running a different RN version.

- **`dist/` is NOT rebuilt on branch switch** — you MUST `yarn build` after every `git checkout`. Verify with `grep` in `dist/` that the expected code change is present. Without this, you test stale code and get false results.
- **Always reproduce the bug on `main` BEFORE testing the fix** — without confirming the bug exists on the base branch, you can't prove the fix works. See `review-and-test` skill → "Review Methodology".

For more testing/debugging pitfalls (console.log, RTL setup, agent-device swipe, observable callbacks), see the **`review-and-test` skill**.

---

## Self-Evolving Instructions

After each fix session, update this file AND the `review-and-test` skill:

1. **Add any new pitfalls discovered** to the appropriate skill
2. **Add affected edge cases** to `review-and-test` edge case checklists
