# Bugbot review guidance

This repository is a Next.js App Router web game that mounts a Phaser 4 scene on the client. Review changes for runtime bugs and regressions that affect playability, rendering, asset loading, and browser lifecycle behavior.

## Project shape

- `src/app/` contains the minimal Next.js shell.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and owns game creation/destruction.
- `src/game/scenes/DungeonScene.ts` contains the main Phaser scene, including input, map rendering, combat, enemies, pickups, UI, audio, and game state transitions.
- `src/game/maps/startingDungeon.ts` generates the dungeon map and tile/proximity collision data.
- `src/game/assets/manifest.ts` is the source of truth for runtime asset keys and public asset paths.
- `public/assets/` contains generated game assets used by Phaser.
- `tools/` and `scripts/` contain asset/audio generation and processing utilities.

## High-priority review areas

- React/Phaser lifecycle bugs: duplicate game instances, missing cleanup, server/client boundary mistakes, or window/document usage outside client-only code.
- Asset manifest issues: broken public paths, mismatched keys, frame sizes, metadata paths, or animation assumptions that will fail at preload/runtime.
- Phaser scene regressions: missing teardown for timers, input handlers, tweens, sounds, particles, or scene-owned objects.
- Gameplay logic bugs in collision, enemy pathing, projectile lifetime, pickup state, score/ammo/health updates, power-up expiration, game-over/start transitions, and debug overlays.
- Coordinate-space mistakes between tile coordinates, isometric world positions, screen pointer input, camera scrolling, and object depth sorting.
- Browser performance risks: unbounded object creation in `update`, leaked game objects, repeated texture/animation registration, or excessive per-frame allocations in hot paths.
- Accessibility/usability regressions in the outer React UI, including broken keyboard controls, focus traps, unusable full-screen layout, or audio mute controls.

## Lower-priority or generated content

- Avoid focusing on style-only comments unless the style hides a runtime bug.
- Treat `public/assets/**/*.png`, generated sprite-sheet JSON, and files under `public/assets/source/` as generated artifacts. Flag broken references or inconsistent dimensions, but avoid art-direction feedback.
- Treat `ASSET_PROMPTS.md` as design/source material rather than runtime code.
- For `tools/` and `scripts/`, prioritize data-loss risks, malformed generated output, path mistakes, and reproducibility problems over broad refactors.

## Codebase conventions

- Keep TypeScript strict and preserve the `@/*` path alias.
- Prefer small, typed helpers near the logic they support; avoid broad rewrites of `DungeonScene.ts` unless the change needs them.
- Preserve the pixel-art rendering choices: `pixelArt`, nearest-neighbor scaling, rounded pixels, and no antialiasing unless a change explicitly revisits the art direction.
- Keep assets referenced through `assetManifest` where practical so paths and keys stay centralized.
- When changing game rules, check interactions between start screen, active play, game over, restart, debug mode, audio mute state, and scene restart.

## Verification expectations

- For code changes, expect at least `npm run build` to pass.
- `npm run lint` is present but depends on the current Next.js lint setup; if it is unavailable or unsupported, note that separately rather than treating it as gameplay validation.
- There is no test runner configured, so reviewers should call out missing targeted tests or manual validation for risky gameplay changes.
