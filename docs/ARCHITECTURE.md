# Architecture

## Overview

STARK is a browser-based experimental spatial interface where hand tracking is the primary control channel and the mouse remains an optional fallback.

## Interaction model

1. **Tracking**
   - Camera frames are interpreted into hand landmarks.

2. **Gesture state**
   - Landmark geometry and movement are converted into interaction states such as point, grab, control and multi-hand transform.

3. **Selection**
   - The primary hand targets information.
   - A triple forward movement acts as a depth-style click.

4. **Spatial objects**
   - Panels and data items can be extracted, repositioned and resized.

5. **Performance adaptation**
   - Visual density can be reduced when tracking performance drops.

## Input boundary

Gesture and mouse input share the same interaction targets but remain independent. Mouse support is a fallback, not a requirement.

## Design goal

Make a large workspace feel spatial and direct while preserving enough deterministic state to avoid accidental actions from noisy camera input.
