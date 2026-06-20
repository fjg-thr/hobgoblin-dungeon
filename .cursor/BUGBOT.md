# Bugbot Review Instructions

Review this repository as a browser game built with Next.js, React, TypeScript, and Phaser. Prioritize defects that can change gameplay behavior, break production builds, or hide asset/runtime failures.

## High-signal issues to flag

- Changes that make client-only Phaser code run during server rendering. `src/game/GameCanvas.tsx` should remain a client component and should keep Phaser dynamically imported from the browser lifecycle.
- Gameplay state bugs in `src/game/scenes/DungeonScene.ts`, especially around health, damage windows, projectile lifetimes, enemy respawn/pathing, pickups, timers, scene reset, and object cleanup.
- Map-generation defects in `src/game/maps/startingDungeon.ts` that can strand the player, place blocking props on required paths, spawn actors outside playable tiles, or create invalid tile codes.
- Asset manifest mismatches in `src/game/assets/manifest.ts`: missing files, wrong frame sizes, wrong metadata paths, or keys that no longer line up with Phaser preload/animation usage.
- TypeScript strictness regressions, unsafe casts, nullable access mistakes, and changes that would fail `tsc --noEmit`.
- Rendering changes that break the pixel-art constraints: nearest-neighbor scaling, `pixelArt`, `roundPixels`, full-window resize behavior, or Phaser canvas teardown on React unmount.
- Audio changes that bypass the scene-level mute state or leave sounds/music running after scene teardown.

## Lower-signal areas

- Do not flag generated binary art/audio assets unless the diff also changes their manifest metadata or loading paths.
- Treat files under `tools/` and `scripts/` as asset-generation utilities; focus on deterministic output paths, dependency/runtime errors, and accidental overwrites rather than style.
- Avoid broad architecture comments about the large Phaser scene unless the diff introduces a concrete bug or makes a touched behavior harder to verify.
- Documentation-only edits should only be flagged for commands or paths that are demonstrably wrong.

## Review expectations

- Prefer specific, reproducible findings with the changed file and the player-visible failure mode.
- When a finding depends on a command, name the exact command, such as `npm run build` or `npx tsc --noEmit`.
- Do not request new dependencies for review-only preferences.
