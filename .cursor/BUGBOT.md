# Cursor Bugbot Review Guide

Use this repo-specific guidance when reviewing PRs for the Hobgoblin Ruin prototype. Be selective: block on introduced bugs, regressions, missing assets, unsafe dependency changes, or unverified generated output; do not block unrelated PRs solely for known baseline mismatches listed below.

## High-risk review areas

- `src/game/scenes/DungeonScene.ts` is the gameplay core. Review changes to input, projectile lifecycles, enemy pathing, power-up timers, pickup spawning, hit-stop/camera effects, object cleanup, depth ordering, HUD scaling, and audio state together because many fields interact inside one Phaser scene.
- `src/game/maps/startingDungeon.ts` defines tile codes, map generation, collision, stairs, props, and blocked/playable semantics. Check that new tile codes are represented in `TileCode`, generation, collision, `tileAssetForCode`, and any debug or spawn logic.
- `src/game/assets/manifest.ts` is the runtime source of truth for sprites, UI, effects, projectiles, pickups, and `assetManifest.audio`. Any referenced asset path should exist under `public/assets`, have matching frame metadata when required, and be preloaded before use.
- `src/game/GameCanvas.tsx` keeps Phaser client-only through dynamic imports. Do not allow static server imports of Phaser or browser globals in server components. Preserve resize behavior and cleanup via `game.destroy(true)`.
- `src/app/layout.tsx` declares OpenGraph/Twitter metadata. If metadata references `/opengraph-image.png`, ensure `public/opengraph-image.png` exists or the metadata is corrected.
- This repo does not currently configure Tailwind or shadcn. For DOM UI, follow semantic HTML and existing `src/app/globals.css` patterns. For Phaser canvas UI, review pointer zones, keyboard/mouse affordances, responsive placement, contrast, and canvas-specific accessibility limitations.

## Known baselines to avoid false positives

- Runtime firing is `SPACE` plus pointer/click in `DungeonScene.ts`; README also mentions `J`. Flag this only for control/input/documentation PRs or if a change worsens the mismatch.
- Seeker ammo and seeker projectiles exist in code after kill/time thresholds, but README does not fully document them. Review seeker-related PRs against the code-defined behavior.
- README describes blast as a late rare power-up, while current `POWERUP_CONFIG` unlocks blast at 2 kills or 16 seconds with a substantial weight. Treat this as an existing doc/code mismatch unless a PR intends to fix it.
- The staircase is visible but does not transition levels. Do not require level-exit behavior unless the PR claims to add it.

## Asset and audio tooling

When PRs touch generated assets, require the relevant generator or processor to be rerun and the generated files to be included:

- `npm run process:assets`
- `npm run process:death-assets`
- `npm run process:combat-juice`
- `npm run generate:powerups`
- `npm run generate:combat-assets`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`
- `python3 tools/process_spreadsheet_brute_assets.py`
- `python3 tools/process_corporate_goblin_assets.py`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `node tools/generate_polish_sprites.mjs`

If `public/assets/audio/audio-manifest.json` is touched, keep it consistent with the runtime `assetManifest.audio` entries even though the TypeScript manifest is what the scene loads.

## Verification expectations

- For TypeScript, Next, React, or Phaser code changes, expect `npm run build` and `npx tsc --noEmit --incremental false` unless the PR gives a credible reason they cannot run. Do not rely on `npm run lint` alone; `next lint` is not dependable on current Next versions.
- If verification dirties generated Next route typings such as `next-env.d.ts`, the PR should either explain why that generated change is intended or restore the noise.
- For dependency changes, review both tracked lockfiles (`package-lock.json` and `pnpm-lock.yaml`). npm overrides do not automatically harden pnpm installs; pnpm-specific overrides belong in `pnpm-workspace.yaml` when needed. Prefer audit evidence for both npm and pnpm production dependency paths.
- For Markdown-only guidance changes, `git diff --check` and a diff/stat review are sufficient; runtime builds are unnecessary unless code, assets, lockfiles, or workflows also changed.

## Managed Bugbot deployment boundary

This file gives hosted Cursor Bugbot repository context; it does not by itself prove that the managed service is enabled. Deployment verification must happen outside repo files by confirming Cursor dashboard/org settings, GitHub App repository access, Admin API credentials when used, and a PR review smoke check when available. Manual top-level GitHub PR comment triggers are `cursor review` or `bugbot run`; add `verbose=true` only when diagnostic request IDs or logs are needed. Hosted Bugbot may only consume this guidance after it is merged to, or otherwise available on, the branch Bugbot reads.
