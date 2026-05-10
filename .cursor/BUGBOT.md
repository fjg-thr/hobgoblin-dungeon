# Cursor Bugbot Review Guide

Use this guide when reviewing this repository. Focus on defects that can break the playable Next.js/Phaser dungeon prototype, not broad product ideas or unrelated refactors.

## Project shape

- The app is a Next.js 16 project that renders a single client-side Phaser 4 scene from `src/game/GameCanvas.tsx`.
- `GameCanvas` must stay a client component and must load Phaser with dynamic imports inside `useEffect`; importing Phaser from server components or module scope can break SSR/builds.
- Gameplay lives mainly in `src/game/scenes/DungeonScene.ts`; shared dungeon generation is in `src/game/maps/startingDungeon.ts`; asset paths and frame metadata are centralized in `src/game/assets/manifest.ts`.
- Static assets are served from `public/assets/**`. If code references a new asset, verify both the file and any JSON metadata exist and agree with the manifest.

## High-value review areas

- Build safety: flag changes that introduce server-side access to `window`, `document`, `localStorage`, Phaser globals, audio APIs, or canvas APIs outside guarded client-only code paths.
- Scene lifecycle: check that Phaser objects, timers, input listeners, resize listeners, sounds, tweens, and generated textures are cleaned up or reused during scene shutdown/restart.
- Coordinate systems: the game uses tile coordinates, isometric world coordinates, screen coordinates, and camera-relative UI coordinates. Flag mismatches between these systems, especially in collision, aiming, depth sorting, HUD placement, and camera logic.
- Collision and pathfinding: verify player/enemy/projectile collision changes respect walls, chasms, bridges, prop blockers, enemy radius, and safe spawn distance. Watch for pathfinding changes that can make enemies walk through blockers or fail to chase across valid corridors.
- Combat and resources: review ammo, seeker ammo, power-up, heart, score, invulnerability, hit-stop, and game-over state transitions for off-by-one errors, stale timers, or restart leaks.
- Object pools and caps: preserve limits such as damage numbers, combat effects, afterimages, active enemies, pickups, and power-ups. Flag unbounded object creation in `update` loops or frequent tweens without cleanup.
- Audio and mute: sound playback should respect `this.muted`, persist the mute preference safely, and stop or update background/ambience loops on restart, game over, and scene shutdown.
- Input accessibility inside the canvas shell is limited by Phaser, but page-level React changes should still avoid trapping focus or breaking pointer/keyboard controls.

## Asset and content review

- Sprite sheets must keep frame sizes, directions, row counts, and animation keys aligned between generated JSON, `assetManifest`, and `DungeonScene` animation setup.
- New generated assets should be committed under the appropriate `public/assets/**` directory, and any processing script changes should be deterministic enough for future regeneration.
- Preserve the GBA-inspired pixel-art rendering assumptions: nearest-neighbor scaling, `pixelArt`, `roundPixels`, and no antialiasing unless a change intentionally updates the rendering style.
- Metadata in `src/app/layout.tsx` references `/opengraph-image.png`; flag changes that remove or rename share images without updating metadata.

## Verification expectations

- Prefer `npm ci` followed by `npm run build` for local verification.
- `npm run lint` currently maps to `next lint`; under Next.js 16 this can fail as a tooling incompatibility unless the lint script is updated. Do not treat that failure alone as proof of a code regression.
- If a build updates generated `next-env.d.ts` route helper imports, distinguish generated churn from intentional source changes.
- For gameplay changes, request a manual browser smoke test of start screen, how-to-play modal, movement, firing with Space/J/click, ammo pickups, enemy damage, mute toggle, game over, restart, and resize behavior.

## Review style

- Prioritize concrete bugs, regressions, missing assets, broken lifecycle cleanup, and missing verification over subjective design suggestions.
- Include exact file and line references where possible.
- Avoid requesting wholesale rewrites of `DungeonScene.ts` unless a change directly creates a correctness or maintainability risk in the touched area.
