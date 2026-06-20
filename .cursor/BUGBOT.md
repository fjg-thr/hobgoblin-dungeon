# Bugbot Review Instructions

Review this repository as a browser game built with Next.js, React, TypeScript, and Phaser. Prioritize defects that can change gameplay behavior, break production builds, or hide asset/runtime failures.

Bugbot's managed service is enabled outside this repository through the Cursor dashboard and GitHub App repository access. This file supplies repository-specific review guidance once Bugbot is enabled and merged to the default branch. For a PR smoke check, a top-level PR comment can use `cursor review`, `bugbot run`, `cursor review verbose=true`, or `bugbot run verbose=true`.

## Project map

- `src/game/scenes/DungeonScene.ts`: primary Phaser gameplay scene, including input, combat, enemies, pickups, UI overlays, audio, and scene lifecycle.
- `src/game/maps/startingDungeon.ts`: dungeon generation, tile codes, playable regions, props, starts, and collision helpers.
- `src/game/assets/manifest.ts`: runtime asset paths, frame sizes, metadata paths, animation keys, and audio source of truth.
- `src/game/GameCanvas.tsx`: client-only React bridge that dynamically imports Phaser and tears down the game.
- `tools/` and `scripts/`: asset/audio generation and processing utilities.
- `public/assets/`: generated or processed art/audio consumed by the manifest and Phaser preload code.

## High-signal issues to flag

- Changes that make client-only Phaser code run during server rendering. `src/game/GameCanvas.tsx` should remain a client component and should keep Phaser dynamically imported from the browser lifecycle.
- Gameplay state bugs in `src/game/scenes/DungeonScene.ts`, especially around health, damage windows, projectile lifetimes, enemy respawn/pathing, pickups, timers, scene reset, and object cleanup.
- Map-generation defects in `src/game/maps/startingDungeon.ts` that can strand the player, place blocking props on required paths, spawn actors outside playable tiles, or create invalid tile codes.
- Asset manifest mismatches in `src/game/assets/manifest.ts`: missing files, wrong frame sizes, wrong metadata paths, or keys that no longer line up with Phaser preload/animation usage.
- TypeScript strictness regressions, unsafe casts, nullable access mistakes, and changes that would fail `npx tsc --noEmit`.
- Rendering changes that break the pixel-art constraints: nearest-neighbor scaling, `pixelArt`, `roundPixels`, full-window resize behavior, or Phaser canvas teardown on React unmount.
- Audio changes that bypass the scene-level mute state or leave sounds/music running after scene teardown.
- Input/control changes that desync README-documented controls from actual Phaser bindings. Existing baseline note: the README mentions `J` for firing, but current code uses `Space` and pointer/click firing.
- Power-up and ammo behavior changes that silently diverge from current code-defined progression. Existing baseline notes: seeker ammo exists in code but not README, and blast unlock timing differs between README wording and constants.

## Lower-signal areas

- Do not flag generated binary art/audio assets unless the diff also changes their manifest metadata or loading paths.
- Treat files under `tools/` and `scripts/` as asset-generation utilities; focus on deterministic output paths, dependency/runtime errors, and accidental overwrites rather than style.
- Avoid broad architecture comments about the large Phaser scene unless the diff introduces a concrete bug or makes a touched behavior harder to verify.
- Documentation-only edits should only be flagged for commands or paths that are demonstrably wrong.
- Do not block unrelated PRs solely on existing dependency audit findings. If a PR changes dependencies, then review whether it worsens or fixes the current audit posture.

## Review expectations

- Prefer specific, reproducible findings with the changed file and the player-visible failure mode.
- When a finding depends on a command, name the exact command, such as `npm run build`, `npx tsc --noEmit`, or the specific asset generation script that should be run.
- Do not request new dependencies for review-only preferences.
- Prefer `npm run build` and `npx tsc --noEmit` over `next lint`; this repo's Next.js baseline does not rely on `next lint`.
- If local verification dirties generated files such as `next-env.d.ts` or creates `tsconfig.tsbuildinfo`, call out that they should be restored or removed unless the PR intentionally changes Next/TypeScript generated typing behavior.
