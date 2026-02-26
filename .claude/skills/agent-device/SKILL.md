---
name: agent-device
description: Interact with iOS simulator using agent-device CLI. Takes screenshots, maps pixel coordinates to logical press coordinates, and taps UI elements. Use when navigating the app on a simulator via screenshot-based visual interaction.
---

# Agent Device Interaction

Control the iOS simulator using only `agent-device screenshot` and `agent-device press` commands. All interaction is vision-based: take a screenshot, identify the element visually, calculate coordinates, and press.

## Prohibited Commands

**Do NOT use any command that relies on the accessibility tree or element refs (@e1, @e2, etc.):**

- `agent-device snapshot` — not allowed
- `agent-device find` / `agent-device find text` / `agent-device find label` / `agent-device find role` / `agent-device find id` — not allowed
- `agent-device click` — not allowed (use `press` with coordinates instead)
- `agent-device fill` — not allowed (use `press` to tap input, then `agent-device type` to type)
- `agent-device focus` — not allowed
- `agent-device get text` / `agent-device get attrs` — not allowed

**Allowed commands:** `screenshot`, `press`, `type` (types into currently focused field — no ref needed), `scroll`, `back`, `home`, `long-press`, `wait`, `record`, `devices`, `apps`, `open`, `close`.

## App Launch/Kill

**Always use `agent-device open` and `agent-device close` to launch or kill the app. Do NOT manually tap the app icon on the home screen.**

```bash
agent-device open FlatListPro    # Launch the fixture app
agent-device close FlatListPro   # Kill the fixture app
```

This is more reliable and faster than navigating to the home screen and tapping icons.

## Element Interaction

If you need to locate an element, take a screenshot and visually identify its position.
To type text: first `press` the input field, then use `agent-device type "your text"`.

## Coordinate Mapping

Screenshots are captured at native pixel resolution. The `press` command expects **logical point coordinates**. You must convert using the **percentage method**.

### iPhone 16 Simulator Reference

| Property              | Value              |
| --------------------- | ------------------ |
| Screenshot resolution | 1179 x 2556 pixels |
| Logical screen size   | 393 x 852 points   |
| Scale factor          | 3x                 |

### Percentage Method (Required)

**Do NOT estimate absolute pixel positions and divide.** LLM vision systematically overestimates pixel coordinates by ~17%, causing consistent misses.

Instead, use this method:

1. Look at the screenshot image
2. Estimate where the element is as a **percentage** of the screen width and height (e.g., "43% across, 45% down")
3. Multiply by the logical screen dimensions:

```
logical_x = 393 × (estimated_x_percent / 100)
logical_y = 852 × (estimated_y_percent / 100)
```

### Example

"Horizontal List" row — left-aligned text, about 27% down the screen:

```
x = 393 × 0.20 = 79
y = 852 × 0.27 = 230
→ agent-device press 79 230
```

### Calibrated Reference Points

Use these to sanity-check your percentage estimates (FlashList fixture app Examples screen):

| Element                          | Position (% of screen) | Logical press coords |
| -------------------------------- | ---------------------- | -------------------- |
| First list item (Sticky Headers) | 20% across, 16% down   | 79, 136              |
| Third list item (Horizontal)     | 20% across, 27% down   | 79, 230              |
| Navigation back button           | 12% across, 9% down    | 47, 77               |

## Workflow

1. **Screenshot & downsample**:
   ```bash
   agent-device screenshot /tmp/device-screenshot.png && sips --resampleHeight 852 /tmp/device-screenshot.png
   ```
   This resizes from 2556px to 852px height (1x logical size), preventing API image-size errors in multi-image conversations.
2. **Read**: Use the Read tool to view the screenshot image
3. **Identify**: Visually locate the target element in the screenshot
4. **Estimate percentage**: Where is the element's center as a % of screen width and height?
5. **Calculate**: `x = 393 × x%`, `y = 852 × y%`
6. **Press**: `agent-device press <x> <y>`
7. **Verify**: Take another screenshot to confirm the tap landed correctly

## Tips

- Always round coordinates to the nearest integer
- Aim for the **center** of the target element
- If a tap misses, take a fresh screenshot and recalculate — don't guess repeatedly
- The bottom tab bar icons are at y ≈ 93% down (logical y ≈ 790)
- Use the calibrated reference points above to sanity-check your estimates
- For vertically stacked list items, estimate each item's y% carefully — small errors compound

## Time-Sensitive Tests (Testing During Loading States)

**CRITICAL: When testing bugs that occur during loading/generation/animation states, you MUST use a bash script. Manual step-by-step execution is too slow.**

Examples requiring scripts:

- "Tap X while Y is loading/generating"
- "Scroll while items are being prepended"
- Testing race conditions
- Verifying behavior during animations

### Automated Script Workflow

**1. First, execute manual exploration once to:**

- Navigate to the screen
- Take screenshots to identify element coordinates
- Understand the flow

**2. Then, IMMEDIATELY write and run a test script:**

```bash
#!/bin/bash
set -e

# Reset app state
agent-device close FlatListPro 2>/dev/null || true
sleep 1
agent-device open FlatListPro
sleep 2

# Navigate using coordinates discovered during exploration
agent-device press 79 230   # Horizontal List row
sleep 1

# Execute time-sensitive sequence with minimal delays
agent-device swipe 350 256 50 256   # Swipe the horizontal list
sleep 0.1
agent-device swipe 350 256 50 256   # Swipe again immediately

# Capture result
sleep 0.5
agent-device screenshot /tmp/device-screenshot.png
sips --resampleHeight 852 /tmp/device-screenshot.png > /dev/null

echo "Test complete. Check screenshot to verify behavior."
```

**3. Run the script and verify the result:**

- Execute: `bash /tmp/test-script.sh`
- Read the screenshot to verify expected behavior
- Re-run the script multiple times if needed to confirm consistency

**Why scripts are required:**

- LLM thinking delays between manual commands are 2-10+ seconds
- Loading states complete in 0.5-2 seconds
- Scripts execute with precise timing (0.1-0.5s between commands)
- Reproducible and can be re-run instantly

**Process:**

1. Explore manually → identify coordinates
2. Write script with those coordinates → save to /tmp/
3. Run script → verify result
4. Re-run script as needed for confidence

## Command Reference

### Navigation

```bash
agent-device open [app]               # Boot device/simulator; optionally launch app
agent-device close [app]              # Close app or end session
agent-device back                     # Go back
agent-device home                     # Press home
agent-device app-switcher             # Open app switcher
agent-device session list             # List active sessions
```

### Snapshot (accessibility tree)

```bash
agent-device snapshot                  # Full XCTest accessibility tree
agent-device snapshot -i               # Interactive elements only (recommended)
agent-device snapshot -c               # Compact output
agent-device snapshot -d 3             # Limit depth
agent-device snapshot -s "Camera"      # Scope to label/identifier
agent-device snapshot --raw            # Raw node output
```

### Find (semantic element search)

```bash
agent-device find "Sign In" click
agent-device find text "Sign In" click
agent-device find label "Email" fill "user@example.com"
agent-device find value "Search" type "query"
agent-device find role button click
agent-device find id "com.example:id/login" click
agent-device find "Settings" wait 10000
agent-device find "Settings" exists
```

### Interactions

```bash
agent-device click @e1                 # Click element by ref
agent-device focus @e2                 # Focus element
agent-device fill @e2 "text"           # Clear then type
agent-device type "text"               # Type into focused field without clearing
agent-device press 300 500             # Tap by logical point coordinates
agent-device long-press 300 500 800    # Long press with duration
agent-device scroll down 0.5           # Scroll in direction
agent-device pinch 2.0                 # Zoom in 2x
agent-device pinch 0.5 200 400        # Zoom out at coordinates
agent-device wait 1000                 # Wait ms
agent-device wait text "Settings"      # Wait for text to appear
agent-device alert get                 # Get alert info
agent-device alert wait 10000          # Wait for alert
agent-device is visible 'id="settings_anchor"'  # Selector assertion
agent-device is text 'id="header_title"' "Settings"
```

### Get Information

```bash
agent-device get text @e1              # Get element text
agent-device get attrs @e1             # Get element attributes
agent-device screenshot out.png        # Save screenshot
```

### Devices and Apps

```bash
agent-device devices                   # List available devices
agent-device apps --platform ios       # List apps
agent-device appstate                  # Current app state
```

### Settings Helpers (simulators)

```bash
agent-device settings wifi on|off
agent-device settings airplane on|off
agent-device settings location on|off
```

### Video Recording

```bash
agent-device record start ./recording.mov   # Start recording
# ... perform actions ...
agent-device record stop                     # Stop recording
```

### Trace Logs

```bash
agent-device trace start               # Start trace capture
agent-device trace start ./trace.log   # Start trace capture to path
agent-device trace stop                # Stop trace capture
```

### Deterministic Replay

```bash
agent-device open App --save-script    # Save session script (.ad) on close
agent-device replay ./session.ad       # Run deterministic replay
agent-device replay -u ./session.ad    # Update selector drift and rewrite .ad script
```
