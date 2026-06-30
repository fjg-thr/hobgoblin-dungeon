# Cursor Bugbot review guide

Use this guide when reviewing changes in `fjg-thr/hobgoblin-dungeon`.

## Deployment boundary

- This file gives Cursor Bugbot repository-specific review context. It does not prove that the managed Bugbot service is enabled.
- After this lands on the default branch, verify service enablement in Cursor dashboard/org settings, GitHub App repository access, and any Admin API credentials or live service configuration used by the team.
- Smoke-test a pull request after merge by adding a top-level PR comment with `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and capture the request ID/log details.
- The rules in this file may not apply to the PR that introduces or changes the file until the change is merged to Bugbot's read branch.

## Repository map

- App framework: Next.js App Router, React, TypeScript.
- Entry points: `src/app/page.tsx`, `src/app/layout.tsx`, and global styles in `src/app/globals.css`.
- Phaser boundary: `src/game/GameCanvas.tsx` is client-only and dynamically imports `phaser` plus `DungeonScene`.
- Gameplay core: `src/game/scenes/DungeonScene.ts` owns player state, enemies, projectiles, pickups, powerups, audio, HUD, start/game-over screens, and input handling.
- Dungeon data: `src/game/maps/startingDungeon.ts` generates room/corridor maps and exports map/tile constants.
- Runtime asset source of truth: `src/game/assets/manifest.ts`. `DungeonScene` loads assets from this manifest; `public/assets/audio/audio-manifest.json` is auxiliary when present.
- Static/generated assets live under `public/assets`; source prompts are documented in `ASSET_PROMPTS.md`.

## Review priorities

### Next.js, React, and TypeScript

- Preserve the client/server split. Phaser and browser-only globals belong behind `"use client"` boundaries or dynamic imports; they should not run during server rendering.
- Keep strict TypeScript clean. Prefer repo-local types and the `@/*` alias configured in `tsconfig.json`.
- Use semantic HTML and existing `src/app/globals.css` patterns for DOM UI. This repo does not configure Tailwind or ShadCN; do not require Tailwind classes for current code.
- For metadata changes, verify referenced public files exist. Current baseline references `/opengraph-image.png` from `src/app/layout.tsx`, but no tracked `public/opengraph-image.png` exists; flag changes that introduce, worsen, remove, or claim to fix share-image behavior without matching assets. Do not block unrelated PRs solely for this existing baseline.
- Next 16 can rewrite `next-env.d.ts` between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`. Treat unexpected `next-env.d.ts` churn as generated dirtiness unless the PR intentionally changes route typing behavior.

### Phaser gameplay

- `DungeonScene.ts` is large and stateful. Review changes for lifecycle cleanup, duplicate listeners, timer/tween leaks, stale arrays of destroyed game objects, and state reset paths between new runs.
- Protect map invariants from `startingDungeon.ts`: generated maps should remain bounded by `MAP_WIDTH`/`MAP_HEIGHT`, keep reachable playable tiles, place the player on a playable tile, and avoid spawning enemies/props in invalid or blocking positions.
- Collision and depth ordering are mostly custom. Check wall, chasm, bridge, prop, pickup, projectile, and enemy interactions in tile coordinates and rendered isometric world coordinates.
- Preserve run-state invariants: health never below zero or above max, ammo and seeker ammo respect caps, score/kill counters reset on new runs, invulnerability/ward/haste/blast timers expire predictably, and game-over state stops combat input.
- Actual runtime firing input is `SPACE` plus pointer/click firing. The README also mentions `J`, but current code does not bind `J`; flag control changes that make this mismatch worse or claim to fix it without code/docs alignment. Do not block unrelated PRs solely for the existing mismatch.
- The how-to screen currently says click or `SPACE` to fire. Use this as the smoke-check baseline for runtime controls.
- Seeker ammo is code-defined behavior: it unlocks after progression thresholds and uses seeker pickups/projectiles, although README does not document it. Review seeker changes against code behavior, not README absence.
- README describes blast as rare late-game, while current `POWERUP_CONFIG` unlocks it earlier than that wording suggests. Treat this as an existing docs/code mismatch unless the PR intentionally changes blast progression or docs.

### Assets and audio

- Runtime asset paths must be represented in `src/game/assets/manifest.ts` and have matching files under `public/assets`.
- Sprite sheet changes need matching JSON metadata/frame sizes when used by Phaser animations. Confirm frame dimensions, row offsets, animation frame ranges, and texture keys stay consistent.
- Audio changes should account for browser autoplay restrictions, mute state, scene restarts, missing-file handling, and volume/rate choices. Review `assetManifest.audio` as the runtime source of truth.
- Do not accept generated or processed asset churn without a clear reason and a reproducible command in the PR description.
- Asset generator/processor commands in this repo:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/generate_audio_sfx.mjs`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `python3 tools/process_assets.py`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node scripts/generate-retro-soundtrack.mjs`

### Dependencies and package managers

- README uses npm and `package-lock.json` is tracked, but `pnpm-lock.yaml` is also tracked. Dependency changes must keep all touched manifests/lockfiles coordinated.
- Keep dependency/tooling hardening separate from Bugbot guidance-only PRs unless explicitly requested.
- `next lint` is not reliable for this Next version because the script maps to deprecated `next lint`. Prefer `npm run build` plus `npx tsc --noEmit --incremental false` for typed verification.
- If auditing production dependencies, check both npm and pnpm lockfile behavior when both locks are in scope. pnpm overrides belong in `pnpm-workspace.yaml`, not only in npm `overrides`.

## Suggested verification by PR type

- Markdown/config guidance only: `git diff --check` and inspect `git diff --stat` / `git diff --name-status`.
- TypeScript or React changes: `npm run build` and `npx tsc --noEmit --incremental false`.
- Gameplay changes: run the app with `npm run dev` and smoke-test start, movement, `SPACE` firing, click firing, ammo pickup, powerup pickup, enemy contact damage, mute toggle, game over, and restart.
- Asset or audio changes: run the exact generator/processor command if assets were regenerated, then build and manually smoke-test loading in the browser.
- Dependency changes: run install/audit commands appropriate to each touched lockfile, then build/type-check.

## Review style

- Prioritize concrete correctness issues: broken builds, missing assets, lifecycle leaks, inconsistent controls/docs when touched, gameplay state regressions, and unverified generated output.
- Cite the smallest relevant file/line range and explain the user-visible impact.
- Distinguish current baseline limitations from regressions introduced by the PR.
- Avoid requesting broad rewrites of `DungeonScene.ts` unless the PR already touches the relevant area and a narrower fix would leave the bug in place.
