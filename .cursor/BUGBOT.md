# Cursor Bugbot Review Guide

Use this project context when reviewing pull requests for the Hobgoblin Ruin prototype.

## Project shape

- This is a Next.js App Router app that renders a single client-side Phaser game.
- The React entry point is `src/app/page.tsx`; the Phaser bootstrapping component is `src/game/GameCanvas.tsx`.
- Most gameplay lives in `src/game/scenes/DungeonScene.ts`. Review changes there carefully because movement, combat, spawning, HUD, audio, overlays, and cleanup are currently coupled in one large scene.
- Dungeon generation and tile collision helpers live in `src/game/maps/startingDungeon.ts`.
- Asset keys and paths live in `src/game/assets/manifest.ts`. Generated asset outputs live under `public/assets/`; generator and processor tooling lives under `tools/` and `scripts/`.

## High-priority review checks

### Next.js and React boundaries

- `GameCanvas.tsx` must stay a client component and must not import Phaser at module scope. Phaser should continue to load through dynamic `import("phaser")` inside `useEffect` so server rendering does not evaluate browser-only code.
- Make sure the Phaser game is destroyed on React unmount and that async boot logic does not create a game after unmount.
- Preserve strict TypeScript compatibility. The repo has `strict: true` and uses `@/*` paths for `src/*`.
- If metadata changes in `src/app/layout.tsx`, verify the referenced share-image files exist or intentionally document/fix the current state. The current metadata references `/opengraph-image.png`, and this repo does not currently include `public/opengraph-image.png`.

### Phaser scene lifecycle and input

- Confirm new scene objects, tweens, timers, input handlers, animation listeners, and audio loops are cleaned up or are owned by the scene lifecycle.
- Watch for duplicated global input handlers when the start screen, how-to-play modal, game over panel, or restart path is opened more than once.
- Keyboard controls currently bind movement to arrows/WASD, shooting to `SPACE`, debug overlay to `F3`, and modal close to `ESC`. README still says `Space` or `J` fires, but code does not bind `J`; treat that as an existing doc/code mismatch unless the PR intentionally fixes it.
- Pointer down is used for firing and menu/modal interaction. Check that UI hit areas do not accidentally fire projectiles or start gameplay through overlay clicks.

### Gameplay invariants

- Movement and collision should continue to use tile-space positions, `PLAYER_RADIUS`, `collides`, and map helpers instead of mixing unrelated world-space assumptions.
- Enemies should respect safe spawn distance, path recalculation cadence, contact damage cooldowns, hurt flash state, and respawn limits.
- Staff bolts should consume ammo, snap aim to 15-degree increments, despawn on impact or max distance, and not damage dead or inactive enemies.
- Seeker ammo is implemented in code: it unlocks after 4 kills or 30 seconds, uses cyan-tinted ammo pickups, and fires seeking projectiles. README does not currently document seeker ammo, so do not flag the omission as newly introduced unless a PR touches related docs or behavior.
- Power-ups are configured in `POWERUP_CONFIG`: quickshot is available immediately, haste unlocks after 1 kill or 12 seconds, ward after 10 kills or 90 seconds, and blast after 2 kills or 16 seconds. README describes blast as rare late-game, which is an existing mismatch with code unless the PR intentionally changes it.
- Blast is a charged next-shot effect. It should clear after firing, trigger on projectile impact, apply area damage, and preserve hit-stop/camera-shake behavior.
- Heart pickups should restore missing hearts only; they should not raise max health above `MAX_PLAYER_HEALTH`.
- The staircase is visible but does not transition to another level. Treat this as an existing known limitation unless the PR claims to implement exits.

### Dungeon, depth, and rendering

- `startingDungeon.ts` uses compact tile codes (`" "`, `"W"`, `"."`, `"c"`, `"m"`, `"h"`, `"B"`, `"S"`). New map features should update `TileCode`, `tileAssetForCode`, blocked-tile logic, rendering, and asset manifest entries together.
- Check depth changes against `DEPTH_BANDS` and `depthForTilePoint`; isometric sprites should not pop in front of the player incorrectly.
- Collision/debug overlays should remain accurate when props, chasms, bridges, walls, or stairs change.
- Large visual effects should respect camera visibility checks and pooling limits where existing code uses them.

### Assets and generated content

- Keep `src/game/assets/manifest.ts`, referenced files in `public/assets/`, and any JSON frame metadata in sync. A manifest path change should correspond to a real asset path.
- Sprite sheet frame dimensions, frame rows, and animation frame ranges must match the JSON/source sheets.
- Audio changes should update both the manifest and `public/assets/audio/audio-manifest.json` when applicable, and scene mute/cleanup behavior should continue to cover new sounds.
- Generated asset tooling exists in both `tools/` and `scripts/`; check any generator or processor change against the files it reads and writes.
- Avoid committing generated churn from `next-env.d.ts`, `.next/`, `tsconfig.tsbuildinfo`, or local build artifacts unless the config change requires it.

## Verification expectations

- Prefer `npm ci` for dependency installation because `package-lock.json` is present.
- Run `npm run build` for the integration check.
- Run `npx tsc --noEmit --incremental false` for a side-effect-free TypeScript check.
- `npm run lint` currently maps to `next lint`; with current Next.js versions this may fail because `next lint` is no longer an integrated subcommand. Do not require lint to pass until the repo adds a direct ESLint setup or updates the script.
- The repo also contains `pnpm-lock.yaml`. If dependencies change, verify lockfile intent and avoid accidental npm/pnpm drift.

## Review output guidance

- Prioritize concrete correctness bugs, runtime regressions, asset/path mismatches, lifecycle leaks, and missing verification.
- Be explicit when a finding is based on an existing known limitation versus a regression introduced by the PR.
- Do not block solely because the repo has no automated test suite yet, but do call out missing tests or manual smoke coverage when a PR changes risky gameplay, map generation, lifecycle, or asset-loading behavior.
