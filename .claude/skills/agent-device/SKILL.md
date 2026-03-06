---
name: agent-device
description: Interact with iOS simulator or Android emulator/device using snapshot-based coordinates. Uses accessibility tree snapshots for precise element targeting, with screenshot verification as fallback. Use when navigating the app on a simulator/emulator.
---

## IMPORTANT — agent-device is the ONLY tool for device interaction

**ALL simulator/emulator interaction MUST go through `agent-device` commands.** No exceptions, no fallbacks.

**Banned tools/commands** (never use these for device interaction, even if they seem easier):

- `adb` / `adb shell` — no `input tap`, `input swipe`, `input text`, `screencap`, `am start`, etc. (exception: `adb shell screenrecord` + `adb pull` for Android recording — see "Android Recording Workaround")
- Mobile MCP tools — no `mobile_click_on_screen_at_coordinates`, `mobile_take_screenshot`, `mobile_list_elements_on_screen`, `mobile_swipe_on_screen`, `mobile_type_keys`, `mobile_press_button`, `mobile_long_press_on_screen_at_coordinates`, or any other `mobile_*` tool
- `xcrun simctl` — no `simctl io screenshot`, `simctl launch`, `simctl openurl`, etc. (exception: `simctl list devices` to check boot state is OK)
- `osascript` / AppleScript for simulator control
- Appium or any other automation framework

**Why**: `agent-device` manages sessions, coordinate translation, and daemon state. Mixing in other tools causes session conflicts, stale state, and unreliable behavior.

- **Keep all delays under 1s.** This applies to `wait`, `sleep`, and any other waiting mechanism. The app is fast — transitions and network responses complete quickly. The only exception is app launch (`open`), which may take a few seconds to fully load.

# Agent Device Interaction

Control the iOS simulator or Android emulator using `agent-device`. The primary interaction method is **snapshot-based**: take an accessibility tree snapshot, find the target element's `rect`, compute its center, and press.

## Prohibited agent-device subcommands

**Do NOT use these as standalone subcommands:**

- `click`, `find`, `fill`, `focus`, `get text`, `get attrs`, `scrollintoview`, `is`, `wait text`, `wait @ref`, `diff snapshot`

**Allowed agent-device subcommands:** `snapshot`, `screenshot`, `press`, `type`, `scroll`, `swipe`, `longpress`, `back`, `home`, `app-switcher`, `wait <ms>`, `open`, `close`, `keyboard dismiss`, `appstate`, `clipboard`, `alert`, `settings`, `record`, `devices`, `apps`, `batch`, `push`, `logs`, `network`.

## Platform Setup

### Device Targeting (Required)

**Always target a specific device by name** using `--device "<name>"` to avoid launching the wrong simulator/emulator. At the start of each session:

1. Run `agent-device devices` to list available devices
2. Identify the correct booted device (or the one the user specified)
3. **Probe for an existing session before calling `open`** (see below)
4. If no existing session is found, pass `--device "<name>"` on `open` — subsequent commands in the same session inherit it

### Probing for Existing Sessions (Do This First)

A previous conversation may have left an active session bound to the device. Calling `open` with a new session or the default session will fail with a conflict error. **Always probe first** using `appstate` (lightweight, no file output):

```bash
# Probe: check if a session already owns this device
agent-device appstate --device "iPhone 16"
```

| Outcome                                    | What it means                             | What to do                                            |
| ------------------------------------------ | ----------------------------------------- | ----------------------------------------------------- |
| Succeeds                                   | Default session already owns this device  | Use it — no `open` needed                             |
| `Device is already in use by session "X"`  | Session `X` owns this device              | Use `--session X` for all commands (no `open` needed) |
| `Session "default" is bound to device "Y"` | Default session owns a _different_ device | Use a new `--session <name>` and proceed with `open`  |
| `No active session` / device not found     | No session exists yet                     | Proceed with `open --device "<name>"` normally        |

**iOS**:

```bash
# First: discover available devices
agent-device devices

# Probe for existing session
agent-device appstate --device "iPhone 16"
# If error says "in use by session ios16" → use --session ios16
# If succeeds → default session works, skip open

# Only if no session exists: open with explicit device targeting
agent-device open FlatListPro --device "iPhone 16"

# Subsequent commands — no --device needed (session remembers)
agent-device snapshot -i -c --json   # primary: get elements with rects
agent-device press <x> <y>
agent-device screenshot /tmp/verify.png && sips --resampleHeight 852 /tmp/verify.png >/dev/null  # verification
```

**Android** (also requires `--session` and `--platform`):

Use `agent-device apps --platform android --user-installed` to discover the installed package name.

```bash
# Probe for existing session
agent-device appstate --device "Android35" --session droid --platform android
# If succeeds → session already exists, skip open

# Only if no session exists: bind session to Android (replace <package> with actual package name)
agent-device open <package> --session droid --platform android \
  --device "Android35" \
  --activity <package>/.MainActivity

# All subsequent commands: just --session droid
agent-device snapshot -i -c --json --session droid  # primary
agent-device press <x> <y> --session droid
agent-device screenshot /tmp/verify.png --session droid && sips --resampleHeight 852 /tmp/verify.png >/dev/null  # verification
```

## Core Workflow — Snapshot-First

The primary method uses the accessibility tree snapshot for exact element coordinates. Screenshots are the fallback for visual verification.

### 1. Take a snapshot

```bash
agent-device snapshot -i -c --json
```

This returns interactive (`-i`) elements with their `rect` coordinates (`-c`) in JSON format. Each element looks like:

```json
{
  "@ref": "@e25",
  "role": "button",
  "label": "Settings",
  "rect": {"x": 141, "y": 2032, "width": 154, "height": 154}
}
```

### 2. Find the target element

Search the snapshot output for your target by matching `label`, `identifier`, or `value`. Example: looking for "Settings" → find the element with `"label": "Settings"`.

### 3. Compute the center and press

Calculate the center of the element's `rect`:

- `x = rect.x + rect.width / 2`
- `y = rect.y + rect.height / 2`

Then press at those coordinates.

### 4. Verify with a screenshot

After pressing, take a screenshot to confirm the action worked:

```bash
agent-device screenshot /tmp/verify.png && sips --resampleHeight 852 /tmp/verify.png >/dev/null
```

Then `Read /tmp/verify.png` to view it.

## Fallback: Vision-Based Screenshots

When an element is **not in the accessibility tree** (e.g., canvas-rendered content, custom drawn views), fall back to screenshots with percentage-based coordinate estimation.

### Coordinate System — Device-Agnostic

**iOS and Android use different coordinate systems for `press`.** The exact dimensions vary by device. You MUST discover them dynamically at the start of each session.

#### How press coordinates work

- **Android**: `press` takes **raw pixel coordinates** (same as screenshot dimensions)
- **iOS**: `press` takes **logical point coordinates** (screenshot pixels / scale factor)
  - Modern iPhones (X and later): **3x** scale
  - iPhone SE, older models: **2x** scale
  - iPads: **2x** scale

#### Session Start: Discover Press Dimensions (Vision Fallback Only)

Snapshot `rect` values are already in the correct press coordinate space — skip this if you're only using snapshots. This is only needed when estimating coordinates from screenshots. Run once per platform:

```bash
agent-device screenshot /tmp/screen.png  # (add --session droid for Android)
sips -g pixelWidth -g pixelHeight /tmp/screen.png
```

Then compute the press dimensions:

```
# Android: press coords = screenshot pixels
PRESS_W = RAW_W
PRESS_H = RAW_H

# iOS: press coords = screenshot pixels / scale
PRESS_W = RAW_W / 3    # (use /2 for iPhone SE or iPad)
PRESS_H = RAW_H / 3
```

**Remember these values for the rest of the session.** All coordinate calculations use them.

#### Percentage Method

1. View the screenshot
2. Estimate the element's center as a **percentage** of screen width and height
3. Multiply by the press dimensions:

```
x = PRESS_W * (x_percent / 100)
y = PRESS_H * (y_percent / 100)
```

## Command Reference

### Navigation

```bash
open FlatListPro --device "iPhone 16"    # Launch app (iOS — always specify --device on first open)
open <package> \                          # Launch app (Android — discover package name with `apps --platform android --user-installed`)
  --device "Android35" --session droid --platform android \
  --activity <package>/.MainActivity
close FlatListPro                         # Kill app
back                                  # Navigate back (Android: in-app; iOS: may go to previous app)
home                                  # Device home screen
app-switcher                          # Open app switcher
```

### Element Discovery

```bash
snapshot -i -c --json                 # Interactive elements with rects (primary method)
```

### Interactions

```bash
press <x> <y>                         # Tap (iOS=logical points, Android=pixels)
press <x> <y> --double-tap            # Double-tap
longpress <x> <y> [durationMs]        # Long press (default 500ms)
type "text"                           # Type into focused field (tap input first)
scroll <up|down|left|right> [0-1]     # Scroll in direction with amount
swipe <x1> <y1> <x2> <y2> [durationMs]  # Precise swipe between coordinates
wait <ms>                             # Wait milliseconds (max 500ms — the app is fast)
```

### Screenshots & Recording

```bash
screenshot /tmp/screen.png            # Save screenshot
record start ./recording.mov          # Start video recording (iOS only — see below for Android)
record stop                           # Stop recording (iOS only)
```

To view a screenshot, downsample and read:

```bash
agent-device screenshot /tmp/screen.png && sips --resampleHeight 852 /tmp/screen.png >/dev/null
```

Then `Read /tmp/screen.png`.

#### Android Recording Workaround

`agent-device record` is broken on Android emulators (API 35+) — it sends SIGINT to the local `adb` process instead of the on-device `screenrecord`, producing a corrupt MP4. Use `adb` directly for Android recording.

First, resolve the serial once per session (store in `$SERIAL`):

```bash
SERIAL=$(adb devices | grep -w device | head -1 | cut -f1)
```

Then use it for recording:

```bash
# Start (run in background)
adb -s $SERIAL shell screenrecord /sdcard/agent-rec.mp4 &

# Stop (SIGINT the on-device process, then pull)
adb -s $SERIAL shell kill -INT $(adb -s $SERIAL shell pidof screenrecord)
sleep 2
adb -s $SERIAL pull /sdcard/agent-rec.mp4 /tmp/recording.mp4
adb -s $SERIAL shell rm -f /sdcard/agent-rec.mp4
```

Note: `screenrecord` only encodes frames when the display changes — interact with the UI during recording or you'll get a single-frame file.

### Device Info

```bash
devices                               # List available devices
apps --platform ios --user-installed  # List installed apps
appstate                              # Show foreground app/activity (useful on Android)
keyboard dismiss                      # Dismiss on-screen keyboard (Android)
clipboard read                        # Read clipboard (iOS only)
clipboard write "text"                # Write to clipboard
```

### Settings (useful for testing)

```bash
settings appearance dark              # Switch to dark mode
settings appearance light             # Switch to light mode
settings wifi off                     # Toggle wifi
settings permission grant camera      # Grant camera permission
```

## Tips

- Round coordinates to the nearest integer
- Aim for the **center** of the target element
- If a tap misses, take a fresh snapshot and recalculate — don't guess repeatedly
- Verify the tab bar layout from the first screenshot — it may change between app versions
- `back` on iOS navigates to the previous app (not always within the current app) — use `press` on the back arrow instead
- On Android, tap the input field with `press` before using `type`
- On Android, `swipe` down near the top of the screen can trigger the notification shade — start swipes well within the content area
- Prefer `snapshot` over screenshots for finding elements — it gives exact coordinates

## Reducing Round Trips

### Skip verification screenshots when confident

Not every `press` needs a screenshot afterward. Take one when:

- **Navigating to a new screen** — confirm you landed on the right one
- **Uncertain the tap landed** — small target, crowded UI, or unexpected state
- **Capturing evidence** — for PRs, debugging, or bug reports

Skip it when tapping obvious, large targets (tab bar items, prominent buttons) where the next snapshot or action will confirm success anyway.

### Reuse coordinates from a recent snapshot

A snapshot gives you rects for every interactive element on screen. If you need to tap multiple elements on the same screen (e.g., fill a form), compute all the centers from one snapshot and press them in sequence — don't re-snapshot between each tap unless the screen layout changes (navigation, modal dismiss, keyboard appearing).

## Capturing Transient States (Loading Indicators, Animations)

Screenshots are too slow (~300ms per capture) to catch brief loading spinners or animations. Use **video recording + frame extraction** instead. **agent-device sometimes doesn't record properly unless one press has been performed with it. It can lead to a small file.**

### Approach

1. **Record video** around the action that triggers the transient state
2. **Extract frames** with `ffmpeg` at high FPS
3. **Find changed frames** using MD5 hashes, then **Read** those frames

### Critical: Recording Timing

**`record start` needs ~3 seconds of lead time** before performing the action. The recording daemon takes time to initialize — without this delay, the recording captures a static image and the action is missed entirely.

Similarly, **wait at least 4-5 seconds after the action** before calling `record stop` to capture the full animation and settle.

**IMPORTANT: Do NOT put recording commands inside a bash script.** When `record start`, `sleep`, action commands, and `record stop` are all in one script, the recording often captures only a fraction of a second. Instead, run each step as a **separate Bash tool call**:

**iOS:**

```
# Step 1: Start recording (separate Bash call)
agent-device record start /tmp/evidence.mov --session ios

# Step 2: Wait + perform action + wait (separate Bash call)
sleep 3 && agent-device swipe 197 340 197 680 800 --session ios && sleep 5

# Step 3: Stop recording (separate Bash call)
agent-device record stop --session ios
```

**Android** (uses adb workaround — see "Android Recording Workaround" above):

```
# Step 1: Start recording (separate Bash call)
adb -s $SERIAL shell screenrecord /sdcard/agent-rec.mp4 &

# Step 2: Wait + perform action + wait (separate Bash call)
sleep 3 && agent-device swipe 540 700 540 1400 800 --session droid && sleep 5

# Step 3: Stop + pull recording (separate Bash call)
adb -s $SERIAL shell kill -INT $(adb -s $SERIAL shell pidof screenrecord) && sleep 2 && adb -s $SERIAL pull /sdcard/agent-rec.mp4 /tmp/evidence.mp4 && adb -s $SERIAL shell rm -f /sdcard/agent-rec.mp4
```

### Verifying Frame Changes

Do NOT guess which frames show the action. Use MD5 hashes to find frames that actually differ:

```bash
# Find which frames are unique (not identical to previous)
prev_hash=""
for f in /tmp/frames/frame-*.png; do
  hash=$(md5 -q "$f")
  if [[ "$hash" != "$prev_hash" ]]; then
    echo "$(basename $f): CHANGED"
    prev_hash="$hash"
  fi
done
```

If ALL frames have the same hash, the recording did not capture the action — re-record with more lead time.

### Example: Capturing a Loading Spinner

**iOS:**

```
# Step 1 (separate Bash call): Start recording
agent-device record start /tmp/loading-evidence.mov

# Step 2 (separate Bash call): Wait for recording to initialize, perform action, wait for completion
sleep 3 && agent-device swipe $X_MID $Y_35PCT $X_MID $Y_75PCT 500 && sleep 5

# Step 3 (separate Bash call): Stop recording
agent-device record stop
```

**Android:**

```
# Step 1 (separate Bash call): Start recording
adb -s $SERIAL shell screenrecord /sdcard/agent-rec.mp4 &

# Step 2 (separate Bash call): Wait, perform action, wait
sleep 3 && agent-device swipe $X_MID $Y_35PCT $X_MID $Y_75PCT 500 --session droid && sleep 5

# Step 3 (separate Bash call): Stop + pull
adb -s $SERIAL shell kill -INT $(adb -s $SERIAL shell pidof screenrecord) && sleep 2 && adb -s $SERIAL pull /sdcard/agent-rec.mp4 /tmp/loading-evidence.mp4 && adb -s $SERIAL shell rm -f /sdcard/agent-rec.mp4
```

```bash
# Step 4 (same or separate call): Extract frames + find changes
rm -rf /tmp/loading-frames && mkdir -p /tmp/loading-frames
ffmpeg -y -i /tmp/loading-evidence.mov -vf "fps=30" /tmp/loading-frames/frame-%04d.png 2>/dev/null

# Find changed frames via MD5
prev_hash=""
for f in /tmp/loading-frames/frame-*.png; do
  hash=$(md5 -q "$f")
  if [[ "$hash" != "$prev_hash" ]]; then
    echo "$(basename $f): CHANGED"
    prev_hash="$hash"
  fi
done
```

Then downsample and read the changed frames:

```bash
# Downsample specific changed frames for LLM viewing
sips --resampleHeight 852 /tmp/loading-frames/frame-0090.png --out /tmp/loading-frames/view-0090.png >/dev/null
```

```
Read /tmp/loading-frames/view-0090.png
```

### When to Use Each Approach

| Scenario                            | Approach                                           |
| ----------------------------------- | -------------------------------------------------- |
| Navigating / tapping UI elements    | `snapshot -i -c --json` + compute center + `press` |
| Verifying a loading spinner exists  | Video + frame extraction                           |
| Visual verification after an action | `screenshot` + downsample + `Read`                 |
| Element not in accessibility tree   | `screenshot` + percentage estimation               |
| Evidence for PR / bug report        | Video recording (share .mov file)                  |

### Pull-to-Refresh

- **iOS**: Use `swipe` from ~35% down to ~77% down (within the content area)
- **Android**: Prefer `scroll down` when at top of list — `swipe` down can trigger the notification shade

## Time-Sensitive Scripts

**For quickly performing a sequence of interactions (press, swipe, type), use a bash script.** Manual step-by-step execution is too slow to catch fleeting UI states. Note: this is for interaction commands only — `record start`/`record stop` must still be separate Bash calls (see "Capturing Transient States" above).

1. Explore manually first to discover coordinates
2. Write a script using the discovered coordinates
3. Run: `bash /tmp/test-script.sh`
4. Read the screenshot to verify
