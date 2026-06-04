# Cursor Bugbot Review Guide

Review this repository as a browser game built with Next.js, React, TypeScript,
and Phaser. Prioritize findings that could break gameplay, deployment, or the
player-facing experience.

## Project context

- `src/app` contains the Next.js App Router shell and metadata.
- `src/game/GameCanvas.tsx` is the client-only bridge that dynamically imports
  Phaser and creates the game instance.
- `src/game/scenes/DungeonScene.ts` owns Phaser scene state, input handling,
  map generation, combat, power-ups, UI overlays, and audio.
- `src/game/assets/manifest.ts` is the source of truth for asset keys, paths,
  dimensions, and sprite-sheet metadata.
- Static assets live under `public/assets`; generated asset tooling lives under
  `tools` and `scripts`.

## Review priorities

1. Flag any server/client boundary issue, especially browser-only APIs or Phaser
   imports that can run during server rendering instead of inside client-only
   code.
2. Verify Phaser lifecycle changes clean up game instances, timers, keyboard
   handlers, pointer handlers, tweens, sounds, and event listeners when scenes or
   React components are destroyed.
3. Check gameplay state invariants: health cannot drop below zero, ammo counts
   stay bounded, pickups cannot be collected twice, power-up timers expire
   predictably, and game-over or modal states block player input consistently.
4. Validate map and collision changes against isometric coordinate conversion,
   walkability, room/corridor bounds, enemy spawn safety, and camera constraints.
5. Confirm asset changes keep manifest paths, frame sizes, animation frame
   counts, JSON metadata, and files in `public/assets` synchronized.
6. Watch for performance regressions in `DungeonScene.ts`, especially allocations
   in update loops, unbounded groups/arrays, orphaned sprites, and repeated audio
   or texture creation.
7. For UI or accessibility changes outside the Phaser canvas, review keyboard
   access, focus behavior, semantic markup, responsive sizing, and metadata.
8. For generated assets or audio, focus review on integration correctness and
   repository impact rather than subjective visual or musical taste.

## Expected validation

- TypeScript must remain strict-compatible.
- `npm run build` should pass for application changes.
- If behavior changes are significant, expect a focused manual playthrough that
  exercises start, movement, aiming/firing, pickups, enemy contact, mute, and
  game-over/restart paths.

## Avoid noisy comments

- Do not request broad rewrites of the Phaser scene unless a concrete bug or
  maintainability risk is introduced by the diff.
- Do not flag generated image, audio, or sprite metadata churn unless it breaks
  loading, animation, dimensions, or repository hygiene.
- Do not ask for ShadCN components inside Phaser-rendered UI; Phaser UI is drawn
  through game objects, not React components.
