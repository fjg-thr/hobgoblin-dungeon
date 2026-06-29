# Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype. Focus on regressions that would break the playable Next.js/Phaser dungeon, generated asset pipeline, or deployment metadata.

## High-risk areas

- `src/game/scenes/DungeonScene.ts` owns most runtime behavior: input, enemy spawning, projectile collision, pickups, audio, UI overlays, and game state. Review shared timers, Phaser object cleanup, pointer/keyboard input, camera scaling, and any change that touches multiple systems in this file.
- `src/game/maps/startingDungeon.ts` defines dungeon generation and collision layout. Check that tile keys line up with `assetManifest.tiles`, rooms remain reachable, and collision/proximity rules still match the rendered isometric map.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. If assets are added, renamed, or moved, verify manifest entries, public file paths, metadata JSON, frame sizes, and scene preload usage together. `public/assets/audio/audio-manifest.json` is auxiliary and must stay consistent when audio files change.
- `src/game/GameCanvas.tsx`, `src/app/page.tsx`, `src/app/layout.tsx`, and `src/app/globals.css` control the Next.js shell. Watch client/server boundaries, Phaser dynamic import behavior, metadata, responsive canvas sizing, and semantic DOM styling.
- This repo does not configure Tailwind or shadcn. For DOM/UI changes, prefer existing `globals.css` patterns and semantic elements. For Phaser canvas UI, review pointer zones, keyboard/mouse affordances, readable placement, and canvas-specific accessibility limitations.

## Known baseline context

- Runtime firing currently uses `SPACE` and pointer/click. The README also mentions `J`; do not block unrelated PRs solely for this existing mismatch, but flag PRs that intentionally touch input docs or controls without reconciling it.
- Code includes seeker ammo/projectile behavior gated by progression, while the README documents only regular ammo and listed power-ups. Treat this as existing behavior unless a PR changes ammo/progression/docs.
- The README describes blast as a rare late-game power-up, but current `POWERUP_CONFIG` can unlock blast earlier via kills or survival time. Flag intentional power-up changes that do not update code and docs together.
- The staircase is visible but has no level transition; this is a documented limitation.
- `src/app/layout.tsx` references `/opengraph-image.png`. If metadata changes, verify the public image exists and dimensions/alt text stay accurate.

## Asset and audio pipeline

When a PR changes generated assets, require the matching source/generator path and output metadata to be reviewed together. Relevant commands and tools include:

- `npm run process:assets` -> `python3 tools/process_assets.py`
- `npm run process:death-assets` -> `node tools/process_actor_death_assets.mjs`
- `npm run process:combat-juice` -> `node tools/process_combat_juice_assets.mjs`
- `npm run generate:powerups` -> `node tools/generate_powerup_sprites.mjs`
- `npm run generate:combat-assets` -> `node tools/generate_brute_ammo_sprites.mjs`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `python3 tools/process_spreadsheet_brute_assets.py`
- `node tools/generate_polish_sprites.mjs`

Do not treat generated PNG/WAV/JSON churn as safe unless the manifest, frame dimensions, preload keys, and README asset notes still agree.

## Verification expectations

- For TypeScript, Phaser, or Next.js runtime changes, prefer `npm run build` plus `npx tsc --noEmit --incremental false`. Do not rely on `next lint` alone; it is not reliable with this Next version.
- If `next-env.d.ts` changes after local Next commands, verify whether it is generated noise from dev/build route types and restore it unless the PR intentionally changes generated typing behavior.
- For dependency changes, review both `package-lock.json` and `pnpm-lock.yaml`. Use `npm audit --omit=dev` and `pnpm audit --prod` where possible. npm `overrides` do not affect pnpm; pnpm overrides belong in `pnpm-workspace.yaml`.
- For Markdown-only guidance changes, `git diff --check` and focused diff review are usually sufficient; build/runtime tests are not required unless code or generated assets changed.

## Managed Bugbot deployment boundary

This file gives Bugbot repository-specific review context, but it does not prove the hosted Bugbot service is enabled. Confirm managed deployment through Cursor dashboard or org settings, GitHub App repository access, Admin API credentials where used, and a PR review smoke check when available. On GitHub PRs, manual top-level triggers are `cursor review` or `bugbot run`; add `verbose=true` only when diagnostics such as request IDs or log detail are needed.
