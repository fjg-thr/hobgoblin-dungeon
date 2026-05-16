# Cursor Bugbot review guide

Use this guide when reviewing changes in the Hobgoblin Ruin prototype. The
project is a small Next.js app that mounts a Phaser 4 dungeon scene from React,
with most gameplay logic in `src/game/scenes/DungeonScene.ts` and generated
pixel-art/audio assets under `public/assets`.

## Project context

- Runtime stack: Next.js, React, TypeScript, Phaser 4.
- App entry points live in `src/app`; the Phaser canvas bridge lives in
  `src/game/GameCanvas.tsx`.
- Dungeon data and tile helpers live in `src/game/maps/startingDungeon.ts`.
- Asset keys and frame metadata are centralized in `src/game/assets/manifest.ts`.
- Asset-processing scripts in `tools/` and `scripts/` generate or transform
  files in `public/assets`.

## Review priorities

1. Catch runtime-breaking mismatches between asset manifests, generated JSON
   frame data, and Phaser texture or animation keys.
2. Flag gameplay changes that desynchronize world-tile coordinates, pixel
   coordinates, depth sorting, collision checks, or camera-relative input.
3. Watch for React/Next server-client boundary mistakes. Phaser code should
   stay client-only, browser globals should not run during server render, and
   metadata/public asset references should point at committed files.
4. Check that generated assets and scripts remain deterministic enough for
   repeatable local builds, with source prompts or processing steps documented
   when new assets are introduced.
5. Prefer small, targeted comments over broad style feedback. This prototype
   has intentionally centralized scene logic; do not request large refactors
   unless a change introduces a concrete bug or maintainability risk.

## Gameplay-specific checks

- Movement, aiming, projectiles, enemy AI, pickups, hearts, powerups, scoring,
  audio, and debug overlays share state in `DungeonScene.ts`; verify new state
  is reset when a run restarts or the scene is recreated.
- Enemy and projectile interactions depend on tile-space radii and sampled
  paths. Look for accidental mixing of pixels, tile coordinates, and screen
  coordinates.
- Collision and bounds helpers intentionally use simple checks. Review changes
  for off-by-one tile access, blocked-tile inconsistencies, and unsafe map
  indexing.
- UI/HUD sprites are Phaser objects, not React components. Flag leaks caused by
  timers, tweens, input handlers, or game objects that are not cleaned up.
- Audio must respect the scene-level mute toggle and browser autoplay
  constraints.

## Asset and build checks

- New runtime Phaser asset files should be referenced by `assetManifest` and
  should have JSON frame data that matches the expected sprite dimensions and
  frame names.
- Public metadata images referenced from `src/app/layout.tsx` must exist under
  `public/` and be tracked.
- Prefer `npm run build` for integration verification.
- Prefer `npx tsc --noEmit --incremental false` for a side-effect-free
  TypeScript check.
- `npm run lint` currently invokes `next lint`, which is not available in the
  installed Next.js version; do not block reviews on that script until linting is
  migrated to an explicit ESLint command.

## Comment style

- Prioritize correctness, regressions, missing cleanup, and missing verification
  over subjective architecture preferences.
- Include exact file and line references when possible.
- Avoid asking for ShadCN UI components in Phaser HUD/gameplay code; this repo
  does not use ShadCN and most game UI is rendered inside the Phaser canvas.
