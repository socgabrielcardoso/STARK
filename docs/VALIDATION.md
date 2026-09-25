# Validation

## Interaction checks

Test with camera input whenever a change affects tracking or gestures.

Validate:
- primary-hand pointing;
- control-hand behavior;
- hand-role swap;
- triple-forward click progress;
- dragging and releasing spatial information;
- two-hand transforms;
- mouse fallback;
- recovery after temporary hand loss.

## Performance checks

Observe whether tracking remains responsive at different distances and lighting conditions. Confirm the interface reduces visual density rather than becoming unusable when performance drops.

## Acceptance criteria

A gesture should require enough evidence to avoid accidental activation. Mouse interaction must remain optional and must not break the primary hand-tracking workflow.
