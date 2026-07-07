# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull requests for this project.

## Managed-service deployment boundary

- This repository file supplies review guidance only. It cannot prove that hosted Cursor Bugbot is enabled.
- Confirm managed-service deployment outside the repo: Cursor dashboard/org settings, GitHub App repository access, Admin API credentials if used, and a live pull request review smoke check when available.
- After this file is merged to the default branch, trigger Bugbot from a top-level PR comment with `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and include request IDs or log details when reporting failures.
- PRs that add or modify this file may not be reviewed using the new guidance until the change lands on the default branch.

## Project map

- App shell: `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css` are a minimal Next.js App Router wrapper around the canvas.
- Phaser host: `src/game/GameCanvas.tsx` is a client component that dynamically imports Phaser and `DungeonScene`, mounts one game instance, resizes with the window, and destroys the instance on unmount.
- Main runtime: `src/game/scenes/DungeonScene.ts` owns the player, enemies, projectiles, pickups, power-ups, HUD, start screen, how-to-play modal, audio, debug overlay, and scene cleanup.
- Map generation: `src/game/maps/startingDungeon.ts` creates randomized rooms and corridors, tile codes, props, `playerStart`, and seeded `enemyStarts`.
- Asset source of truth: `src/game/assets/manifest.ts` is what the scene loads at runtime. Keep it in sync with files under `public/assets`.
- Auxiliary audio metadata may exist under `public/assets/audio`, but runtime loading should still be checked against `assetManifest.audio`.
- Asset tooling includes `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`, `tools/process_corporate_goblin_assets.py`, `tools/process_spreadsheet_brute_assets.py`, `tools/generate_audio_sfx.mjs`, and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

- Block runtime regressions that can crash the Next client, break the dynamic Phaser import, create multiple Phaser games, or skip `game.destroy(true)` cleanup.
- Check Phaser lifecycle cleanup for input listeners, timers, tweens, animations, pooled sprites, audio, and scene shutdown handlers.
- Validate client/server boundaries: Phaser usage must stay behind `"use client"` or dynamic imports that only execute in the browser.
- For gameplay changes, inspect `DungeonScene.ts` source-of-truth constants and state transitions rather than relying only on README prose.
- For map/collision changes, verify tile codes, playable tiles, wall placement, prop blocking, coordinate transforms, depth sorting, and camera bounds together.
- For asset changes, verify every manifest path exists in `public/assets`, frame dimensions match generated sheets, animation frame ranges are valid, and generated binary outputs are intentionally tracked.
- For audio changes, verify `assetManifest.audio` paths, scene-level mute behavior, sound unlock/start behavior, and first-pass procedural WAV assumptions.
- For metadata/share changes, keep `src/app/layout.tsx` metadata in sync with `public/opengraph-image.png` dimensions and alt text.

## Current gameplay facts to preserve unless a PR intentionally changes them

- Movement uses WASD or arrow keys in isometric directions.
- Runtime shooting currently binds keyboard firing to `Space`; pointer/click also aims and fires once. README mentions `J`, so only block the mismatch on input or control-doc PRs.
- Shots snap to 15-degree angles, consume finite standard ammo, and can use seeker ammo after progression unlocks.
- Seeker ammo/projectiles are implemented in code even though README gameplay copy focuses on regular ammo and documented power-ups.
- Initial goblins are seeded from `dungeon.enemyStarts`; additional goblins ramp with target enemy count, while brutes unlock by `BRUTE_UNLOCK_KILLS` or `BRUTE_UNLOCK_MS`.
- Power-up unlock gates, weights, and display metadata live in `POWERUP_CONFIG`; effect durations and behavior live in nearby constants and collection logic.
- Quickshot reduces projectile cooldown, haste increases movement speed, ward blocks contact damage, and blast arms the next shot to detonate nearby enemies.
- Heart pickups restore missing hearts after kill milestones; they do not increase max health.
- The start screen and how-to-play modal are Phaser-rendered and have compact viewport layout branches. Review pointer hit zones, modal close behavior, and control-copy consistency.
- The lower-right `SOUND` / `MUTED` button toggles scene audio and should remain usable on small viewports.
- `F3` toggles collision boxes, player bounds, and tile coordinate labels.

## UI and accessibility expectations

- This repo does not currently configure Tailwind or ShadCN. For DOM UI changes, follow existing semantic HTML and `src/app/globals.css` patterns.
- Most visible UI is Phaser canvas UI. Review pointer hit zones, keyboard affordances, text contrast, compact viewport placement, and whether equivalent DOM accessibility is needed for new non-canvas UI.
- Avoid blocking unrelated Phaser-only changes solely for generic DOM accessibility gaps that predate the PR, but flag new interactive DOM controls without labels or keyboard support.

## Verification guidance

- Prefer `npm ci`, `npm run build`, and `npx tsc --noEmit --incremental false` for source changes.
- `next lint` is not reliable with the current Next version; do not require it as the only verification.
- `npm run build` can rewrite `next-env.d.ts`; restore it unless the PR intentionally changes generated Next typing behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because incremental compilation is enabled; use `--incremental false` or remove the artifact.
- For guidance-only changes to this file, verify the diff is limited to `.cursor/BUGBOT.md`, ASCII Markdown, and a trailing newline.
