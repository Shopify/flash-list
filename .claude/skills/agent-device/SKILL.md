---
name: agent-device
description: Interact with iOS simulator or Android emulator using vision-based coordinates. Takes screenshots, maps pixel coordinates to logical press coordinates, and taps UI elements. Use when navigating the app on a simulator/emulator via screenshot-based visual interaction.
---

## IMPORTANT — agent-device is the ONLY tool for device interaction

**ALL simulator/emulator interaction MUST go through `agent-device` commands.** No exceptions, no fallbacks.

**Banned tools/commands** (never use these for device interaction, even if they seem easier):

- `adb` / `adb shell` — no `input tap`, `input swipe`, `input text`, `screencap`, `am start`, etc.
- Mobile MCP tools — no `mobile_click_on_screen_at_coordinates`, `mobile_take_screenshot`, `mobile_list_elements_on_screen`, `mobile_swipe_on_screen`, `mobile_type_keys`, `mobile_press_button`, `mobile_long_press_on_screen_at_coordinates`, or any other `mobile_*` tool
- `xcrun simctl` — no `simctl io screenshot`, `simctl launch`, `simctl openurl`, etc. (exception: `simctl list devices` to check boot state is OK)
- `osascript` / AppleScript for simulator control
- Appium or any other automation framework

**Why**: `agent-device` manages sessions, coordinate translation, and daemon state. Mixing in other tools causes session conflicts, stale state, and unreliable behavior.

# Agent Device Interaction

Control the iOS simulator or Android emulator using `agent-device`. All interaction is vision-based: take a screenshot, identify the element visually, estimate its position as a percentage of the screen, convert to coordinates, and press.

## Prohibited agent-device subcommands

**Do NOT use any subcommand that relies on the accessibility tree or element refs (@e1, @e2, etc.):**

- `snapshot`, `find`, `click`, `fill`, `focus`, `get text`, `get attrs`, `scrollintoview`, `is`, `wait text`, `wait @ref`, `diff snapshot`

**Allowed agent-device subcommands:** `screenshot`, `press`, `type`, `scroll`, `swipe`, `longpress`, `back`, `home`, `app-switcher`, `wait <ms>`, `open`, `close`, `keyboard dismiss`, `appstate`, `clipboard`, `alert`, `settings`, `record`, `devices`, `apps`, `batch`, `push`, `logs`, `network`.

## Platform Setup

### Device Targeting (Required)

**Always target a specific device by name** using `--device "<name>"` to avoid launching the wrong simulator/emulator. At the start of each session:

1. Run `agent-device devices` to list available devices
2. Identify the correct booted device (or the one the user specified)
3. **Probe for an existing session before calling `open`** (see below)
4. Pass `--device "<name>"` on the **first command** (`open`) — subsequent commands in the same session inherit it

### Probing for Existing Sessions (Do This First)

A previous conversation may have left an active session bound to the device. Calling `open` with a new session or the default session will fail with a conflict error. **Always probe first:**

```bash
# Probe: try a screenshot targeting the device
agent-device screenshot /tmp/probe.png --device "<device-name>"
```

| Outcome                                    | What it means                             | What to do                                                                         |
| ------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Succeeds                                   | Default session already owns this device  | Use it — no `open` needed                                                          |
| `Device is already in use by session "X"`  | Session `X` owns this device              | Use `--session X` for all commands (no `open` needed — just screenshot/press/etc.) |
| `Session "default" is bound to device "Y"` | Default session owns a _different_ device | Use a new `--session <name>` and proceed with `open`                               |
| `No active session` / device not found     | No session exists yet                     | Proceed with `open --device "<name>"` normally                                     |

**iOS**:

```bash
# First: discover available devices
agent-device devices

# Probe for existing session
agent-device screenshot /tmp/probe.png --device "<device-name>"
# If error says "in use by session X" → use --session X
# If succeeds → default session works, skip open

# Only if no session exists: open with explicit device targeting
agent-device open FlatListPro --device "<device-name>"

# Subsequent commands — no --device needed (session remembers)
agent-device screenshot /tmp/screen.png
agent-device press <x> <y>
```

**Android** (also requires `--session` and `--platform`):

```bash
# Probe for existing session
agent-device screenshot /tmp/probe.png --device "<emulator-name>" --session droid --platform android
# If succeeds → session already exists, skip open

# Only if no session exists: bind session to Android
agent-device open com.flatlistpro --session droid --platform android \
  --device "<emulator-name>" \
  --activity com.flatlistpro/.MainActivity

# All subsequent commands: just --session droid
agent-device screenshot /tmp/screen.png --session droid
agent-device press <x> <y> --session droid
```

## Coordinate System — Device-Agnostic

**iOS and Android use different coordinate systems for `press`.** The exact dimensions vary by device. You MUST discover them dynamically at the start of each session.

### How press coordinates work

- **Android**: `press` takes **raw pixel coordinates** (same as screenshot dimensions)
- **iOS**: `press` takes **logical point coordinates** (screenshot pixels ÷ scale factor)
  - Modern iPhones (X and later): **3x** scale
  - iPhone SE, older models: **2x** scale
  - iPads: **2x** scale

### Session Start: Discover Press Dimensions

Run this once per platform at the start of a session to determine the press coordinate space:

```bash
agent-device screenshot /tmp/screen.png  # (add --session droid for Android)
sips -g pixelWidth -g pixelHeight /tmp/screen.png
```

Then compute the press dimensions:

```
# Android: press coords = screenshot pixels
PRESS_W = RAW_W
PRESS_H = RAW_H

# iOS: press coords = screenshot pixels ÷ scale
PRESS_W = RAW_W / 3    # (use /2 for iPhone SE or iPad)
PRESS_H = RAW_H / 3
```

**Remember these values for the rest of the session.** All coordinate calculations use them.

### Percentage Method (Required)

**Do NOT estimate absolute pixel positions from the screenshot and divide.** LLM vision systematically overestimates by ~17%.

Instead:

1. View the screenshot
2. Estimate the element's center as a **percentage** of screen width and height
3. Multiply by the press dimensions you discovered:

```
x = PRESS_W * (x_percent / 100)
y = PRESS_H * (y_percent / 100)
```

**Example** — a button at 50% across, 30% down on an iPhone with PRESS_W=393, PRESS_H=852:

```
x = 393 * 0.50 = 197
y = 852 * 0.30 = 256
→ agent-device press 197 256
```

Same button on an Android emulator with PRESS_W=1080, PRESS_H=2340:

```
x = 1080 * 0.50 = 540
y = 2340 * 0.30 = 702
→ agent-device press 540 702 --session droid
```

## Core Workflow

**1. Screenshot & downsample** (prevents API image-size errors):

```bash
agent-device screenshot /tmp/screen.png && sips --resampleHeight 852 /tmp/screen.png >/dev/null
```

Add `--session droid` for Android. The downsample height of 852 works for any device — it's just for viewing.

**2. Read** the screenshot with the Read tool.

**3. Estimate** the target element's center as a percentage of screen width and height.

**4. Calculate** coordinates: `PRESS_W * x%`, `PRESS_H * y%` (round to integer).

**5. Press** and **verify** with another screenshot.

## Command Reference

### Navigation

```bash
open FlatListPro --device "<device-name>"  # Launch app (iOS — always specify --device on first open)
open com.flatlistpro \                 # Launch app (Android — needs --platform, --device, --activity on first open)
  --device "<emulator-name>" --session droid --platform android \
  --activity com.flatlistpro/.MainActivity
close FlatListPro                      # Kill app
back                                  # Navigate back (Android: in-app; iOS: may go to previous app)
home                                  # Device home screen
app-switcher                          # Open app switcher
```

### Interactions

```bash
press <x> <y>                         # Tap (iOS=logical points, Android=pixels)
press <x> <y> --double-tap            # Double-tap
longpress <x> <y> [durationMs]        # Long press (default 500ms)
type "text"                           # Type into focused field (tap input first)
scroll <up|down|left|right> [0-1]     # Scroll in direction with amount
swipe <x1> <y1> <x2> <y2> [durationMs]  # Precise swipe between coordinates
wait <ms>                             # Wait milliseconds
```

### Screenshots & Recording

```bash
screenshot /tmp/screen.png            # Save screenshot
record start ./recording.mov          # Start video recording
record stop                           # Stop recording
```

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
- If a tap misses, take a fresh screenshot and recalculate — don't guess repeatedly
- Verify the tab bar layout from the first screenshot — it may change between app versions
- `back` on iOS navigates to the previous app (not always within the current app) — use `press` on the back arrow instead
- On Android, tap the input field with `press` before using `type`
- On Android, `swipe` down near the top of the screen can trigger the notification shade — start swipes well within the content area

## Capturing Transient States (Loading Indicators, Animations)

Screenshots are too slow (~300ms per capture) to catch brief loading spinners or animations. Use **video recording + frame extraction** instead.

### Approach

1. **Record video** around the action that triggers the transient state
2. **Extract frames** with `ffmpeg` at high FPS
3. **Find changed frames** using MD5 hashes, then **Read** those frames

### Critical: Recording Timing

**`record start` needs ~3 seconds of lead time** before performing the action. The recording daemon takes time to initialize — without this delay, the recording captures a static image and the action is missed entirely.

Similarly, **wait at least 4-5 seconds after the action** before calling `record stop` to capture the full animation and settle.

**IMPORTANT: Do NOT put recording commands inside a bash script.** When `record start`, `sleep`, action commands, and `record stop` are all in one script, the recording often captures only a fraction of a second. Instead, run each step as a **separate Bash tool call**:

```
# Step 1: Start recording (separate Bash call)
agent-device record start /tmp/evidence.mov --session ios

# Step 2: Wait + perform action + wait (separate Bash call)
sleep 3 && agent-device swipe 197 340 197 680 800 --session ios && sleep 5

# Step 3: Stop recording (separate Bash call)
agent-device record stop --session ios
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

```
# Step 1 (separate Bash call): Start recording
agent-device record start /tmp/loading-evidence.mov

# Step 2 (separate Bash call): Wait for recording to initialize, perform action, wait for completion
sleep 3 && agent-device swipe $X_MID $Y_35PCT $X_MID $Y_75PCT 500 && sleep 5

# Step 3 (separate Bash call): Stop recording
agent-device record stop

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

| Scenario                                     | Approach                          |
| -------------------------------------------- | --------------------------------- |
| Verifying a loading spinner exists           | Video + frame extraction          |
| Testing a specific UI state after navigation | Bash script with screenshots      |
| Exploring / navigating the app               | Interactive screenshots           |
| Evidence for PR / bug bash                   | Video recording (share .mov file) |

### Pull-to-Refresh

- **iOS**: Use `swipe` from ~35% down to ~77% down (within the content area)
- **Android**: Prefer `scroll down` when at top of list — `swipe` down can trigger the notification shade

## Time-Sensitive Scripts

**For bugs during loading/animation states, use a bash script.** Manual step-by-step execution is too slow.

1. Explore manually first to discover coordinates
2. Write a script using the discovered coordinates
3. Run: `bash /tmp/test-script.sh`
4. Read the screenshot to verify
