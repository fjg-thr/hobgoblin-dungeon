# Cursor Bugbot review guide

Bugbot should review this repository as a Next.js App Router + React + Phaser game prototype. This file provides repository-specific context; it does not prove that the managed Cursor Bugbot service, GitHub App access, or branch protection has been enabled. After this file lands on the default branch, verify Bugbot in the Cursor dashboard and with a live PR review.

## Managed Bugbot setup

- Cursor Bugbot runs through the Cursor repository integration, not a GitHub Actions workflow in this repo.
- Confirm repository access in Cursor Dashboard > Bugbot and in the installed GitHub App settings for `fjg-thr/hobgoblin-dungeon`.
- PR reviews can be requested with a top-level PR comment: `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and inspect the returned request ID/log detail.
- These rules may not be applied while they are only present in a PR branch; expect them to affect reviews after merge to the default branch.

## Repository map

- `src/app/` contains the Next.js App Router shell, global styles, metadata, and the page that mounts the game.
- `src/game/GameCanvas.tsx` is the client-only React boundary that dynamically imports Phaser and `DungeonScene`.
- `src/game/scenes/DungeonScene.ts` contains the main runtime gameplay loop, rendering, input, audio, spawning, combat, power-ups, and UI overlays.
- `src/game/maps/startingDungeon.ts` generates the isometric dungeon map, tile codes, collision/blocking state, props, and spawn points.
- `src/game/assets/manifest.ts` is the runtime source of truth for image, sprite-sheet, UI, and audio asset paths loaded by the scene.
- `public/assets/` contains generated runtime assets. `tools/` and `scripts/` contain generator/processor scripts.

## Review priorities

### Next.js, React, and client boundaries

- `phaser` must remain behind the `"use client"` `GameCanvas` boundary and dynamic imports. Flag changes that import Phaser from server components, metadata files, or other server-only code.
- Preserve `reactStrictMode` compatibility: React effects that create a Phaser game must guard against duplicate boot and must destroy the game instance during cleanup.
- For app-shell or metadata changes, check that public asset references exist. The current baseline references `/opengraph-image.png` in `src/app/layout.tsx`, but no tracked file exists at `public/opengraph-image.png`; flag changes that worsen or claim to fix this without adding the asset.
- This repo does not currently use Tailwind or ShadCN. For DOM UI changes, prefer semantic markup and the existing `src/app/globals.css` pattern unless the PR intentionally adds a UI system.

### Phaser runtime and gameplay invariants

- Treat `DungeonScene.ts` as high blast-radius. Review for regressions in movement, map projection, camera follow, input, spawning, combat, cooldowns, audio, and UI depth ordering.
- Keep simulation updates bounded. Changes should preserve `MAX_SIMULATION_DT`-style guards and avoid frame-rate-dependent gameplay behavior.
- Player movement, projectiles, enemy chasing, and pickup collection should continue to use tile/world conversion consistently. Check for mixing tile coordinates and screen/world pixels without conversion.
- Combat should preserve finite ammo, projectile cooldowns, enemy health, player invulnerability windows, hit feedback, and game-over flow.
- Existing controls in runtime are `WASD`/arrow movement, pointer aim, click-to-fire, and `Space` firing. README also mentions `J`; treat that as an existing docs/runtime mismatch unless the PR edits controls or documentation.
- The code includes seeker ammo/projectiles unlocked by progression thresholds. README does not document seeker ammo; do not block unrelated PRs solely for that baseline mismatch, but flag PRs that touch ammo/progression and ignore it.
- README describes blast as a rare late-game power-up while current code unlocks power-ups through `POWERUP_CONFIG`; do not block unrelated PRs solely for existing timing drift, but flag PRs that touch power-up timing and leave docs or constants inconsistent.

### Dungeon map and collision

- In `startingDungeon.ts`, playable tile codes, wall generation, bridge/stair placement, prop blocking, and spawn safety are coupled. Flag changes that make player/enemy starts blocked or unreachable.
- Collision and pathing should use the map helpers (`getTileCode`, `isTileBlocked`, tile constants) instead of duplicating tile-code logic in unrelated files.
- Prop changes must keep `blocks` behavior aligned with rendered collision boxes and debug overlays.

### Assets, audio, and generated files

- Runtime asset paths should be updated in `src/game/assets/manifest.ts` when files are added, moved, renamed, or deleted under `public/assets/`.
- Audio that plays during the scene should be listed in `assetManifest.audio`; `public/assets/audio/audio-manifest.json` is auxiliary and should not be treated as the runtime source of truth.
- Watch for browser autoplay constraints: new audio should be safely started from user interaction or existing scene audio unlock patterns, and the scene-level mute toggle should continue to affect all game audio.
- Sprite-sheet metadata, frame dimensions, row counts, and animation frame usage must stay in sync with generated PNG/JSON assets.
- Do not accept committed secrets or raw credentials in prompts, generated assets metadata, scripts, or environment examples.

### Tooling and dependencies

- The project tracks both `package-lock.json` and `pnpm-lock.yaml`. Dependency changes should keep the relevant manifest and lockfiles coordinated.
- `npm run build` is the primary project health check. `next lint` is not reliable with the current Next version, so prefer `npx tsc --noEmit --incremental false` for focused type checking when needed.
- If verification dirties `next-env.d.ts` by switching between `.next/dev/types` and `.next/types`, restore it unless the PR intentionally changes generated Next typings.
- Keep Phaser pinned unless the PR explicitly updates and validates Phaser runtime behavior.

## Asset tooling reference

Use exact scripts when relevant instead of wildcard commands:

- `npm run process:assets` -> `python3 tools/process_assets.py`
- `npm run process:death-assets` -> `node tools/process_actor_death_assets.mjs`
- `npm run process:combat-juice` -> `node tools/process_combat_juice_assets.mjs`
- `npm run generate:powerups` -> `node tools/generate_powerup_sprites.mjs`
- `npm run generate:combat-assets` -> `node tools/generate_brute_ammo_sprites.mjs`
- Additional direct tools include `python3 tools/process_corporate_goblin_assets.py`, `python3 tools/process_spreadsheet_brute_assets.py`, `node tools/process_gpt_tile_powerup_assets.mjs`, `node tools/process_pickup_intent_effect_assets.mjs`, `node tools/generate_audio_sfx.mjs`, `node tools/generate_polish_sprites.mjs`, and `node scripts/generate-retro-soundtrack.mjs`.

## Suggested review smoke checks

For gameplay or asset PRs, ask whether the author verified:

1. `npm run build`
2. `npx tsc --noEmit --incremental false` when TypeScript logic changed
3. Browser smoke test at `http://localhost:3000`
4. Start screen to gameplay transition
5. `WASD`/arrow movement, pointer aiming, `Space` fire, and click fire
6. Enemy hit, enemy death, player damage, ammo pickup, heart pickup, and each power-up path touched by the PR
7. Sound/mute toggle, including any newly added audio
8. Resize behavior and canvas fill on desktop-sized and narrow viewports

For Markdown-only changes to this guide, `git diff --check` and a clean git status are sufficient.
