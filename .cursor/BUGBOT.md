# Cursor Bugbot Review Guide

Review this repository as a first-playable Next.js/React/TypeScript game that embeds a browser-only Phaser scene. Prioritize concrete bugs that would break gameplay, assets, builds, or deployed metadata. Keep comments specific and actionable; do not leave broad style feedback unless it points to a likely defect.

## Deployment and triggers

- This file gives Cursor Bugbot project-specific review context. Enabling the managed Bugbot service still happens outside the repo through the Cursor dashboard/GitHub App, or the Bugbot Admin API for teams.
- After this file lands on the default branch, Bugbot should include it for PR reviews. A PR that adds or edits this file may be reviewed with older/default rules.
- Manual PR triggers: top-level comment `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and preserve the request ID/log details.

## High-signal review areas

- `src/game/GameCanvas.tsx` must keep Phaser isolated to the client. Flag changes that import Phaser or `DungeonScene` at module scope, remove `"use client"`, access `window` before `useEffect`, or fail to destroy the Phaser game on unmount.
- `src/game/scenes/DungeonScene.ts` is the runtime hot path. Review changes for input listener leaks, timers/tweens that survive shutdown/restart, stale game-over/start-modal pointer handlers, camera/HUD resize regressions, audio mute state regressions, projectile/ammo edge cases, and enemy/pathfinding loops that can run after actors are destroyed.
- `src/game/maps/startingDungeon.ts` owns generated map topology and collision semantics. Check that walkable floors, bridge/chasm behavior, wall codes, safe spawn tiles, and prop collision boxes stay consistent with `DungeonScene` collision checks.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. If assets are added, renamed, or removed, ensure the manifest, public files, sprite sheet JSON, frame sizes, animation row assumptions, and loader keys all change together.
- `public/assets/audio/audio-manifest.json` is auxiliary; `assetManifest.audio` is what the scene loads at runtime.
- `src/app/layout.tsx` references `/opengraph-image.png`; if metadata changes continue to reference a public image, verify the corresponding file exists under `public/`.

## Known existing mismatches

- README says `Space` or `J` fires, but runtime input currently binds `Space` plus pointer/click firing. Flag this only when a PR touches controls, input docs, or the how-to-play copy; do not block unrelated PRs solely for this mismatch.
- README documents standard ammo and power-ups but not seeker ammo. Treat seeker ammo as code-defined behavior unless the PR is explicitly updating gameplay docs.
- README describes blast as rare late-game, while current `POWERUP_CONFIG` may unlock it earlier by kills or elapsed time. Scope findings to PRs that touch power-up progression or documentation.

## Asset and content workflow

When sprite/audio assets change, check that the relevant generator or processor is mentioned or rerun when appropriate:

- `python3 tools/process_assets.py`
- `node tools/process_actor_death_assets.mjs`
- `node tools/process_combat_juice_assets.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `python3 tools/process_spreadsheet_brute_assets.py`
- `node tools/generate_powerup_sprites.mjs`
- `node tools/generate_polish_sprites.mjs`
- `node tools/generate_brute_ammo_sprites.mjs`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`

## Verification expectations

- For TypeScript/runtime changes, expect `npx tsc --noEmit --incremental false` and `npm run build`.
- For dependency or lockfile changes, expect `npm audit --omit=dev`; if `pnpm-lock.yaml` changes, also expect a frozen pnpm install/audit path with Corepack.
- `next lint` may be unreliable on this project because the package uses modern Next versions; do not treat the absence of `next lint` as a blocker when typecheck and build pass.
- For Phaser gameplay changes, prefer a brief manual smoke note covering start screen, movement, `Space` firing, click firing, pickup collection, mute toggle, game-over/restart, and resize behavior.

## Review posture

- Flag blocking issues for reproducible crashes, broken builds, missing runtime assets, hydration/SSR mistakes, unsafe dependency changes, or gameplay state corruption.
- Treat generated binary assets as reviewable mainly through their manifests, dimensions, loader usage, and generator provenance.
- Avoid requiring Tailwind or ShadCN patterns in this repo; it currently uses plain React, Phaser canvas UI, and `src/app/globals.css`.
