# STARK Hybrid Spatial OS 4.0

STARK runs directly from `index.html` with Live Server. Hand tracking remains the main interaction system, while the mouse is available as a completely optional fallback.

## Primary interaction model

By default:

- **Right hand = PRIMARY**: point, target, select, grab, extract, move, drop and activate information.
- **Left hand = CONTROL**: context, collapse, minimize, cancel, back, restore and reduce visual noise.
- **Both hands**: scale, translate and rotate the same focused object or panel.
- **Mouse**: optional click, inspect, drag, panel movement, resize and double-click actions.

Use **Gesture Settings → SWAP** to invert PRIMARY and CONTROL.

## Finger click

The pointing finger now supports a depth click.

Keep the PRIMARY hand in **POINT** and push the index finger forward toward the camera **three times**.

STARK shows discreet progress:

`1/3 → 2/3 → CLICK`

The click is detected from hand-landmark depth movement, not from a screen tap. World-space hand landmarks are used when available.

This click can activate controls or inspect the information currently under the fingertip.

## Mouse

The mouse is no longer blocked.

You do not need it to use STARK, but it works when desired:

- one click on information opens the contextual information lens;
- drag panel headers to move panels;
- drag floating/spatial information to reposition it;
- drag panel corners to resize;
- double-click a panel to maximize it;
- double-click file tiles to open them.

Moving the mouse temporarily lowers hand-cursor visual prominence so both inputs do not visually fight each other.

## Distant hand detection

Camera capture requests up to 1920×1080 at 30 FPS.

Gesture geometry is normalized against hand size, so a smaller hand in the image does not use the same absolute thresholds as a close hand.

If STARK temporarily loses both hands, it alternates full-frame detection with an adaptive center crop. The crop digitally enlarges the central movement area and maps detected landmarks back into full-screen coordinates.

The interface marks small tracked hands as **FAR** and displays **ZOOM ASSIST** when recovery mode is active.

## Compact giant workspace

The entire interface uses a denser geometry:

- smaller panel dimensions;
- shorter headers;
- tighter metrics and lists;
- smaller top bar and dock;
- reduced persistent controls;
- automatic visual simplification when frame rate falls.

This makes the usable workspace feel much larger without simply shrinking text until it becomes unreadable.

## Click-to-inspect

Click an item with the mouse or perform the triple-forward finger click.

A compact **Info Lens** appears with:

- object/entity type;
- source panel;
- identifier when available;
- extracted primary value;
- contextual details.

From the lens you can focus the item or turn it into a floating spatial object.

## Floating data

Metrics, events, logs, validation cells, evidence and many list rows can leave their original panels.

PRIMARY pinch + hold → grab.

Move → extract.

Release in empty space → create a floating object.

Release inside another panel → insert into that panel's organized spatial container.

Release close to another floating item → suggest and form a visual group.

Objects align to the spatial grid and unnecessary overlaps are resolved on drop.

## Data outside the visible screen

Floating data is allowed to leave the viewport.

Dropping an object directly against an edge intentionally pushes it beyond the visible screen into the larger virtual workspace.

STARK then displays a small **OUTSIDE** navigator near the bottom of the screen. It shows which direction each hidden object is located.

Select an OUTSIDE entry to bring that object back into view.

This allows the visible monitor to behave like a window into a larger spatial canvas.

## Panels

Minimized panels become compact pills instead of tiny windows.

Restoring them returns their previous size.

Panel tools remain visually quiet until needed, while CONTROL-hand actions remain the natural way to manage the space.

## Focus levels

STARK keeps one principal focus:

- **GENERAL** — no object selected;
- **LOCAL** — one target is highlighted;
- **MOVEMENT** — an object is being held;
- **ADVANCED** — both hands are manipulating the same focus.

This prevents unrelated gestures from firing against different objects at the same time.

## Performance

The performance governor watches camera FPS.

If frame rate drops, STARK reduces expensive blur, glow and background effects before sacrificing interaction logic.

Offscreen navigation updates on a lightweight interval and relevant events instead of performing heavy layout work on every animation frame.

Spatial DOM discovery remains debounced through MutationObserver.

## Start

1. Open the repository in VS Code.
2. Open `index.html` with Live Server.
3. Allow camera permission.
4. Complete calibration.
5. Use PRIMARY for content, CONTROL for space, BOTH for transforms.
6. Use the mouse whenever convenient; it is optional.
7. For a hand-only click, point and push the index finger forward three times.

If distant-hand tracking is weak, stay near the center of the webcam image for a moment so adaptive zoom recovery can acquire the hands, then continue normally.
