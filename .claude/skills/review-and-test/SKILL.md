---
name: review-and-test
description: Review a FlashList PR or branch, run unit tests, test on iOS simulator, and verify RTL/LTR behavior. Shared context with fix-github-issue skill.
---

# Review & Test a FlashList PR or Branch

## Prerequisites

```bash
which agent-device && which gh && yarn test --version
```

Ensure Metro is running on port 8081 from `fixture/react-native/`:
```bash
curl -s http://localhost:8081/status
```

---

## Step 1 — Understand the Change

### From a PR

```bash
gh pr view <pr-number> --repo Shopify/flash-list
gh pr diff <pr-number> --repo Shopify/flash-list
gh pr view <pr-number> --repo Shopify/flash-list --comments
```

### From a local branch

```bash
git log main..HEAD --oneline
git diff main...HEAD
```

Identify:
- **What changed**: which files, which functions
- **Why**: what bug is fixed or feature added
- **Risk areas**: layout, measurement, RTL, scroll, recycling

---

## Step 2 — Run Automated Checks

All three must pass:

```bash
yarn test
yarn type-check
yarn lint
```

If tests fail, investigate before proceeding to device testing.

---

## Step 3 — Build

**CRITICAL**: The fixture app uses compiled output from `dist/`. Source changes in `src/` have NO effect until built.

```bash
yarn build   # runs tsc -b
```

After building, **relaunch the app** (kill + reopen) so Metro serves the new bundle:

```bash
agent-device close --platform ios
xcrun simctl launch --terminate-running-process <UDID> org.reactjs.native.example.FlatListPro
agent-device open "FlatListPro" --platform ios
```

Find the simulator UDID with:
```bash
xcrun simctl list devices | grep Booted
```

---

## Step 4 — Test on Device (LTR)

### Navigate to affected screens

Use the `agent-device` skill to navigate and take screenshots. Screens are listed on the Examples page. Common ones:

| Screen | What to check |
|--------|--------------|
| Sticky Header Example | Headers pin correctly, no duplicate overlays |
| Horizontal List | Items scroll, header reachable, initialScrollIndex works |
| Grid | Multi-column layout correct |
| Masonry | Variable heights, columns balanced |
| Chat | Bottom-rendering, prepend behavior |
| Contacts | Section headers, fast scrolling |
| Grid with Separator | Last row items same height, separators between rows only |

### Smoke test

Navigate to each affected screen, scroll through content, verify no visual regressions.

---

## Step 5 — Test RTL

### How to enable RTL properly

**The ONLY reliable method**: change `fixture/react-native/index.js`:

```js
// Change this:
I18nManager.forceRTL(false);
// To this:
I18nManager.forceRTL(true);
```

Then **kill and relaunch** the app (a JS reload is NOT sufficient):

```bash
agent-device close --platform ios
xcrun simctl launch --terminate-running-process <UDID> org.reactjs.native.example.FlatListPro
agent-device open "FlatListPro" --platform ios
```

**Do NOT** use:
- `DevSettings.reload()` — does not properly apply RTL
- The Debug screen toggle — unreliable, layout may not fully flip

### RTL verification checklist

- [ ] Text is right-aligned on the Examples screen
- [ ] Navigation back chevron is on the RIGHT side
- [ ] **HorizontalList**: items ordered right-to-left (Item 0 on right, higher items on left)
- [ ] **HorizontalList**: header is reachable by swiping right-to-left (toward the logical start)
- [ ] **Grid**: columns mirrored
- [ ] **StickyHeaders**: headers pin correctly
- [ ] **Chat**: messages align correctly
- [ ] **Masonry**: layout mirrors properly

### RTL scrolling on horizontal lists

In RTL, the scroll direction is reversed:
- **Swipe right-to-left** (finger moves left): reveals content toward the logical START (header, Item 0)
- **Swipe left-to-right** (finger moves right): reveals content toward the logical END (higher items)

Use `agent-device swipe` with coordinates at the list center:
```bash
# Swipe right-to-left at y=30% (list center on HorizontalList screen)
agent-device swipe 350 256 50 256 --platform ios
```

### Always revert RTL when done

```js
I18nManager.forceRTL(false);
```

---

## Step 6 — Verify `firstItemOffset` Values (for layout/measurement changes)

If the PR touches `measureLayout`, `measureParentSize`, `firstItemOffset`, or `RecyclerView.tsx` layout logic, verify the actual runtime values match expected values.

### Expected values (verified on RN 0.79 Fabric)

| Scenario | `firstItemOffset` (adjusted) |
|----------|------------------------------|
| Vertical, no header | 0 |
| Vertical, with ListHeaderComponent | headerHeight |
| Vertical, content above FlashList | 0 (NOT the parent's y position) |
| Horizontal LTR, with header | headerWidth |
| Horizontal RTL, with header (1st render) | headerWidth |
| Horizontal RTL, with header (stable) | headerWidth |

### How to capture runtime values

`console.log` does NOT work on Fabric/Hermes (output goes to CDP debugger, not Metro).

Use a local HTTP server instead:

```bash
# Terminal 1: start server
node -e "
const http=require('http'),fs=require('fs');
http.createServer((q,r)=>{
  if(q.method==='POST'){let b='';q.on('data',c=>b+=c);q.on('end',()=>{
    fs.appendFileSync('/tmp/rv-debug.log',b+'\n');console.log(b);r.end('ok');})}
  else r.end('ok');
}).listen(9876,()=>console.log('on :9876'));
"
```

Add to source (remember to remove after):
```ts
try {
  fetch("http://localhost:9876", {
    method: "POST",
    body: JSON.stringify({ tag: "myDebug", ...values }),
  }).catch(() => {});
} catch (e) {}
```

Then rebuild (`yarn build`), relaunch, navigate, and read `/tmp/rv-debug.log`.

### `measureParentSize` x/y behavior

On RN 0.79 Fabric, `view.measureLayout(view)` returns `x=0, y=0` (the Fabric self-measurement bug from #2017 does NOT reproduce on this version). The defensive fix that strips x/y is a no-op here but protects other RN versions.

---

## Step 7 — Write Review Summary

After testing, provide:

1. **Automated checks**: pass/fail for test, type-check, lint
2. **LTR behavior**: which screens tested, any issues
3. **RTL behavior**: which screens tested, any issues
4. **`firstItemOffset` verification** (if applicable): actual vs expected values
5. **Regression risk**: low/medium/high with reasoning
6. **Recommendation**: approve, request changes, or needs more testing

---

## Edge Cases to Test

Run through relevant entries after any fix or review. This is the single source of truth for edge case checklists — the `fix-github-issue` skill references this.

### Layout & Measurement
- [ ] Content above FlashList (another component in the same parent View)
- [ ] ListHeaderComponent with variable height
- [ ] `stickyHeaderOffset` > 0 combined with content above FlashList
- [ ] Horizontal FlashList (x-axis equivalent of any vertical measurement bug)
- [ ] Horizontal list with wide ListHeaderComponent — header must be reachable by scrolling
- [ ] `measureParentSize` x/y values — on RN 0.79 Fabric these are (0,0), but on other RN versions they may be non-zero
- [ ] `numColumns > 1` with `ItemSeparatorComponent` — last row items must have same height (no separator height mismatch)
- [ ] `numColumns > 1` with `ItemSeparatorComponent` and `overrideItemLayout` (variable spans) — separator suppression must use layout y-coordinates, not index arithmetic

### RTL (Right-to-Left)
- [ ] `HorizontalList` in RTL — items right-to-left, header reachable by swiping right-to-left
- [ ] `Grid` in RTL — column ordering reversed
- [ ] `StickyHeaderExample` in RTL — header must pin to correct edge
- [ ] `Chat` in RTL — messages align correctly
- [ ] `Masonry` in RTL

### Sticky Headers
- [ ] Multiple sticky indices with content above FlashList (issue #2017 scenario)
- [ ] Sticky headers with `stickyHeaderOffset` > 0
- [ ] Sticky header transition at exact item boundary (scroll = item.y)
- [ ] Sticky header when next sticky is beyond engaged indices
- [ ] Sticky header + `maintainVisibleContentPosition` / `startRenderingFromBottom`
- [ ] `hideRelatedCell: true` — overlay hides original cell without jumping

### New Architecture (Fabric)
- [ ] Any `measureLayout`/`measureParentSize` call — verify behaviour matches Paper
- [ ] `firstItemOffset` after fix — confirm it equals `ListHeaderComponent` height/width
- [ ] `measureParentSize(view)` returns `x=0, y=0` on RN 0.79 Fabric — the #2017 bug may only manifest on other RN versions

### Performance
- [ ] Benchmark screen shows no FPS regression (use `ManualBenchmarkExample`)

---

## Common Issues

- **Tests pass but device shows bug** — did you `yarn build` and relaunch? The dist/ folder may be stale
- **Switched branches but behavior didn't change** — `dist/` is NOT rebuilt on branch switch. You MUST run `yarn build` after every `git checkout`. Verify with `grep` in `dist/` that the expected code is present before testing.
- **RTL looks wrong but LTR is fine** — did you set `forceRTL(true)` in `index.js` and do a full kill+relaunch?
- **`agent-device swipe` gives "drag" error** — delete `~/.agent-device/ios-runner/derived/` and re-run `agent-device open` to rebuild the iOS runner
- **No console output in Metro** — use the HTTP server approach (see Step 6)
- **Metro log location** — `lsof -p $(lsof -ti :8081) | grep "1w"` to find where Metro stdout goes (often `/private/tmp/metro_fixture.log`)
- **RTL horizontal scroll direction is reversed** — to scroll toward the logical START (header/Item 0), swipe right-to-left: `agent-device swipe 350 256 50 256`. To scroll toward higher items, swipe left-to-right.
- **Fixture app bundle ID** — `org.reactjs.native.example.FlatListPro`. Use with `xcrun simctl launch`.
- **`estimatedItemSize` does not exist** — this FlashList does NOT have this prop. Do not use it.
- **agent-device navigation** — use ONLY `screenshot` + `press` (percentage method). `snapshot`, `find`, and `click` commands are prohibited. Downsample screenshots with `sips --resampleHeight 852` before reading. See the `agent-device` skill for the full coordinate mapping reference.

---

## Review Methodology

### Always reproduce BEFORE verifying the fix

1. **Checkout `main`**, build (`yarn build`), relaunch, and reproduce the bug
2. **Checkout the PR branch**, build (`yarn build`), relaunch, and verify the fix
3. **Verify dist after each branch switch**: `grep "expected_code" dist/path/to/file.js` — if the old code is still there, the build didn't run or didn't pick up the change

Without step 1, you can't confirm the fix actually changed anything. Without verifying dist, you might test stale code on both branches and conclude "no difference" incorrectly.

### Making behavior observable

When testing callback-based behavior (e.g., `onStartReached`, `onEndReached`, `onViewableItemsChanged`), add a visible counter to the fixture screen:

```tsx
const [count, setCount] = useState(0);
// In the callback:
onStartReached={() => setCount(c => c + 1)}
// In the UI:
<View style={{ backgroundColor: count > 0 ? '#ff4444' : '#cccccc', ... }}>
  <Text>Start: {count}</Text>
</View>
```

This gives immediate visual feedback in screenshots without needing console.log or debug servers.

### Masonry PRs — watch for sorting

Any masonry layout PR that adds `Array.sort()` or sorted copies is a red flag for performance. `getVisibleLayouts` runs on every scroll frame (60fps). O(N log N) sorting per layout change is expensive. Items within each column are naturally sorted — per-column binary search is O(log N) without sorting.

---

## Self-Evolving Instructions

This skill is the single source of truth for testing knowledge, edge cases, and debug techniques. The `fix-github-issue` skill delegates here for Steps 6-7.

After each session, update this file with:
1. New screens or scenarios that need testing
2. New debug techniques discovered
3. Updated expected values if the codebase changes
4. New edge cases discovered during fixes
