#!/bin/bash

# Continuous ADB Scroll Down Script with Speed Control
# Continuously swipes down a fixed distance until manually stopped (Ctrl+C).
# An optional speed multiplier can be provided as an argument.
# Usage: ./adb_scroll.sh [SPEED_MULTIPLIER]
#
# Arguments:
#   SPEED_MULTIPLIER: Optional. Multiplier for swipe speed. Higher is faster (shorter duration). Default: 1
#
# Example:
#   ./adb_scroll.sh       # Run with default speed (1x)
#   ./adb_scroll.sh 3     # Run 3x faster

# --- Configuration ---
START_Y=1500              # Starting Y coordinate for the swipe (near bottom)
X=2                    # X coordinate for the swipe (center)
SWIPE_DISTANCE=700          # Fixed distance for each swipe (pixels)
BASE_SWIPE_DURATION=48     # Base duration for each swipe (milliseconds) - will be divided by multiplier
DEFAULT_SPEED_MULTIPLIER=1  # Default speed multiplier if none provided
SLEEP_BETWEEN=100    # Sleep time between swipes (milliseconds)

# --- Argument Parsing ---
SPEED_MULTIPLIER=${1:-$DEFAULT_SPEED_MULTIPLIER}

# --- Input Validation ---
if ! [[ "$SPEED_MULTIPLIER" =~ ^[0-9]*\.?[0-9]+$ ]] || (( $(echo "$SPEED_MULTIPLIER <= 0" | bc -l) )); then
  echo "Error: SPEED_MULTIPLIER must be a positive number."
  exit 1
fi

# --- Calculations ---
# Calculate actual swipe duration
SWIPE_DURATION=$(echo "scale=0; $BASE_SWIPE_DURATION / $SPEED_MULTIPLIER" | bc)

# Ensure duration is at least 1ms
if [ -z "$SWIPE_DURATION" ] || [ "$SWIPE_DURATION" -lt 1 ]; then
  SWIPE_DURATION=1
fi

END_Y=$(( START_Y - SWIPE_DISTANCE ))

# Clamp END_Y to 0 if it goes below zero
if [ "$END_Y" -lt 0 ]; then
  END_Y=0
fi

echo "Starting continuous ADB scroll down..."
echo "Press Ctrl+C to stop."
echo "-------------------------------"
echo "Device: $(adb devices | grep -v List | cut -f1)"
echo "Speed Multiplier: ${SPEED_MULTIPLIER}x"
echo "Base Swipe Duration: ${BASE_SWIPE_DURATION}ms"
echo "Effective Swipe Duration: ${SWIPE_DURATION}ms"
echo "Swipe: X=$X, Y: $START_Y -> $END_Y"
echo "Sleep Between: ${SLEEP_BETWEEN}ms"
echo "-------------------------------"

while true; do
  # Execute the swipe command
  adb shell input swipe $X $START_Y $X $END_Y $SWIPE_DURATION

  # Brief pause
  sleep $(echo "scale=6; $SLEEP_BETWEEN / 1000" | bc)
done

# This part is unlikely to be reached unless the loop is broken somehow
echo "-------------------------------"
echo "ADB scroll stopped."
exit 0
