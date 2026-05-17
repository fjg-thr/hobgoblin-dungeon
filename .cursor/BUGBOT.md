# Cursor Bugbot review instructions

This repository is a dark GBA-inspired isometric dungeon game prototype built with
Next.js, React, TypeScript, and Phaser. Review pull requests with the project
context below.

## High-priority review focus

- Flag changes that can break browser boot, especially imports of `phaser` or
  browser-only APIs outside client-only code paths.
- Check `src/game/scenes/DungeonScene.ts` changes for gameplay regressions in
  movement, collision, enemy AI, projectile handling, pickups, scoring, audio,
  scene restart, and debug overlay behavior.
- Watch Phaser update loops for avoidable per-frame allocations, unbounded object
  creation, missed cleanup, or timers/events that can survive scene restarts.
- Verify map and collision changes keep tile-space/world-space conversions
  consistent with `src/game/maps/startingDungeon.ts`.
- For asset changes under `public/assets`, confirm the JSON metadata, manifest
  entries, source assets, frame dimensions, and runtime paths stay in sync.
- Treat TypeScript strictness regressions, broad `any` usage, and unsafe casts as
  review issues unless they are narrowly justified.
- Do not flag limitations already documented in `README.md` unless a pull
  request claims to address them and does not.

## Expected validation

- Prefer `npm run build` for end-to-end validation of the Next.js app.
- Use focused TypeScript checks for non-buildable work when appropriate.
- For gameplay changes that cannot be fully covered by automated checks, call
  out the exact manual browser scenario that should be exercised before merge.
