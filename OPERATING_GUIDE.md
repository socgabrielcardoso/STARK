# STARK Dual-Hand Spatial OS 3.0

STARK runs directly from `index.html` with Live Server. The browser camera is the primary input source.

## Hand roles

By default:

- **Right hand = PRIMARY**: point, select, open, grab, extract information, move objects and activate options.
- **Left hand = CONTROL**: contextual menu, collapse/minimize, cancel/back, restore and reduce visual complexity.
- **Both hands together**: scale, move and rotate the same focused object or window.

Use **Gesture Settings → SWAP** to invert PRIMARY and CONTROL.

The PRIMARY hand owns the precision cursor. The CONTROL hand does not create a second competing cursor; its position changes the meaning of control gestures according to what is under that hand.

## Natural interaction

PRIMARY point → highlight.

PRIMARY pinch → select.

PRIMARY pinch + hold → grab.

Move PRIMARY while holding → drag.

Release → drop.

CONTROL fist hold over a panel → compact it into the organized compact-panel dock.

CONTROL fist hold over a floating object → reduce it.

CONTROL fist hold over a group → collapse the group.

CONTROL palm hold over an object or window → show contextual actions for that object.

CONTROL swipe left / long palm → back or cancel.

CONTROL swipe up → restore the latest compacted panel.

Two pinches on the same focus → scale, translate and rotate.

Two palms → HOME.

Two fists → undo.

## Detachable information

Metrics, list rows, logs, validation cells and other visual information are automatically made spatially detachable.

Grab a piece of information from a panel with the PRIMARY hand. It becomes an independent floating object while the original position remains as a subtle detached placeholder.

A floating item can be:

- left free in the workspace;
- dropped into another panel;
- placed near another floating item to form a group;
- scaled and rotated with both hands;
- reduced with the CONTROL hand;
- removed into the recovery area;
- restored later.

Dropping inside a panel sends the item into that panel's spatial container, where CSS grid alignment keeps spacing organized.

Dropping in empty space snaps it to an 18 px spatial grid and resolves unnecessary overlaps.

Dropping close to another floating object suggests grouping and groups them on release.

Pulling one member out of a group separates it again.

## Panels

Minimized panels no longer remain as tiny windows. They become compact pills in the left-side compact panel dock. Restoring a pill returns the panel at its previous size.

Panel tools stay visually quiet. CONTROL-hand context actions are the intended way to manage windows.

## Visual focus

STARK tracks four focus levels:

- GENERAL — nothing selected;
- LOCAL — something targeted;
- MOVEMENT — PRIMARY hand is holding something;
- ADVANCED — both hands are manipulating the same focus.

Only one principal focus is allowed at a time to avoid competing actions.

## Organization and performance

Spatial decoration is handled with a debounced MutationObserver instead of frame-by-frame DOM scans.

Object collision checks happen on drop, not continuously.

When many floating objects are present, secondary details are automatically reduced while titles remain visible.

Animations are short and functional. Expensive effects are avoided.

## Start

1. Open the repository in VS Code.
2. Open `index.html` with Live Server.
3. Allow the browser to use the camera.
4. Complete the short calibration.
5. Use PRIMARY for content, CONTROL for space, and BOTH for transforms.

The initial browser camera permission may require one click. After camera access is active, STARK blocks trusted mouse and keyboard input inside the application.
