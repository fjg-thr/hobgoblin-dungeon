# Cursor Bugbot Review Guide

Use this repository guide when reviewing Hobgoblin Ruin Prototype PRs. This file gives Bugbot project context; enabling the managed Bugbot service still requires Cursor/GitHub App access outside this repo.

## Review Priorities

- Treat runtime gameplay correctness in `src/game/scenes/DungeonScene.ts`, map generation in `src/game/maps/startingDungeon.ts`, and asset loading in `src/game/assets/manifest.ts` as high risk.
- Verify that Phaser scene changes clean up input listeners, timers, tweens, audio, and game objects on restart, shutdown, and game-over paths.
- For Next.js changes under `src/app`, keep server/client boundaries intentional. `src/game/GameCanvas.tsx` owns the browser-only Phaser import and should remain isolated from server components.
- Preserve strict TypeScript behavior. Do not ignore new type errors, unused state, or broad `any` unless a Phaser interop boundary makes the cast unavoidable and localized.
- Review user-facing controls and canvas UI for keyboard/mouse affordances, pointer zones, responsive placement, and clear text. This repo does not use Tailwind; DOM styling should follow existing semantic markup and `src/app/globals.css` patterns.

## Game-Specific Context

- Current runtime shooting is `Space` plus pointer/click firing. The README also mentions `J`, but `DungeonScene` only binds `SPACE`; flag this mismatch only on PRs that touch controls or docs.
- README power-up text can lag code. `POWERUP_CONFIG` is the source of truth for quickshot, haste, ward, and blast unlock timing unless a PR intentionally changes documented gameplay.
- Seeker ammo/projectiles are code-defined progression behavior and are not fully documented in README. Review seeker changes against `DungeonScene` state, pickup, projectile, and HUD logic.
- `assetManifest.audio` in `src/game/assets/manifest.ts` is the runtime audio source of truth. `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when audio assets change.
- `src/app/layout.tsx` references `/opengraph-image.png`. If metadata or public assets are touched, ensure the referenced public image exists or the metadata is updated.

## Asset and Audio Changes

- Generated visual/audio assets should be checked with their metadata dimensions, frame counts, paths, and manifest entries. Broken paths usually surface at runtime rather than compile time.
- Useful local tooling includes:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`

## Verification Expectations

- For most code PRs, expect `npx tsc --noEmit --incremental false` and `npm run build`.
- For dependency or lockfile PRs, also expect install/audit coverage for the touched package manager files. If both npm and pnpm locks are tracked, verify both paths when feasible.
- `next lint` is not a reliable baseline for the current Next version in this repo; prefer typecheck and production build results.
- Manual smoke checks should cover start screen, how-to-play modal, movement, `Space` firing, click firing, ammo pickup, power-up pickup, enemy damage/death, game-over/restart, mute toggle, and debug overlay when relevant.

## Hosted Bugbot Operations

- Repository guidance applies after this file is merged to the default branch; PRs adding or changing this file may not be reviewed using the new instructions.
- To manually request a GitHub PR review, use a top-level comment such as `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and include any request IDs/log details when reporting issues.
- If Bugbot does not appear on PRs, verify Cursor dashboard/org settings, GitHub App repository access, and Admin API credentials or service configuration. Repo files alone cannot prove hosted Bugbot enablement.
