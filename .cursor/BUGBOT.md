# Bugbot review instructions

Review this repository as a small playable Next.js prototype that embeds a Phaser game.

## Project shape

- `src/app/*` is a minimal Next.js App Router shell.
- `src/game/GameCanvas.tsx` is client-only React code that dynamically imports Phaser and owns the Phaser game lifecycle.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay state, rendering, input handling, collision, combat, UI overlays, and audio orchestration.
- `src/game/maps/startingDungeon.ts` generates isometric dungeon maps used by the game.
- `src/game/assets/manifest.ts` is the source of truth for public asset keys, paths, frame sizes, and animation metadata.
- `public/assets/**` contains generated game assets and metadata. Treat changes there as large binary/generated artifacts unless the PR clearly intends to update assets.
- `tools/**` and `scripts/**` generate or process sprites and audio. Review these for reproducibility and accidental destructive file writes.

## What to prioritize

- Catch server/client boundary regressions. Phaser and browser globals must stay inside client-only code paths, dynamic imports, effects, or runtime guards.
- Check Phaser lifecycle safety: avoid duplicate `Phaser.Game` instances, dangling input listeners, timers, tweens, sounds, and objects that survive scene shutdown or React unmount.
- Verify gameplay state changes preserve invariants for health, ammo, score, power-up timers, projectile lifetimes, enemy respawn, collision bounds, and game-over/restart flows.
- Check map-generation changes for reachable player/enemy spawn points, valid tile codes, blocked-tile consistency, and stable coordinate conversions between grid, world, and screen space.
- Validate asset-manifest changes against files in `public/assets/**`, frame sizes, sprite-sheet row/column assumptions, animation keys, and Phaser texture-key uniqueness.
- Treat performance regressions as important when they affect per-frame update loops, pathfinding, particle/tween creation, audio playback, or unbounded arrays of sprites/projectiles/effects.
- Preserve the pixel-art presentation: keep nearest-neighbor rendering, fixed sprite dimensions, intentional camera scaling, and low-resolution asset assumptions unless the PR explicitly changes art direction.
- Flag accessibility or UX regressions in menus, overlays, mute controls, start/restart flows, and keyboard/mouse input affordances.

## Verification expectations

- Prefer `npm run build` for broad validation of TypeScript, Next.js, and asset imports.
- If reviewing local changes, also run or request targeted manual smoke testing of movement, firing, pickups, enemy contact damage, mute toggle, start screen, restart, and responsive resize.
- If lockfiles or package manager files change, check that dependency changes are intentional and that `package.json`, `package-lock.json`, and `pnpm-lock.yaml` remain consistent.

## Review style

- Focus findings on concrete bugs, regressions, missing cleanup, unreachable states, broken assets, or missing verification.
- Include exact file and line references whenever possible.
- Avoid broad refactor suggestions unless they directly reduce risk in the changed code.
