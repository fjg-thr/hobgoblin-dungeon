# Cursor Bugbot review guide

Use this repository-specific context when reviewing changes in `fjg-thr/hobgoblin-dungeon`.

## Project shape

- Next.js, React, and TypeScript provide a thin app shell in `src/app` and `src/game/GameCanvas.tsx`.
- Runtime gameplay lives mostly in the Phaser scene `src/game/scenes/DungeonScene.ts`.
- Dungeon generation, tile codes, and tile collision helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts`. Treat this manifest as the source of truth for what `DungeonScene` loads, including audio.
- The project does not configure Tailwind or shadcn/ui. DOM styling currently uses `src/app/globals.css`; most UI is drawn inside the Phaser canvas.

## Review priorities

- Protect the client-only Phaser boot path. `GameCanvas` must keep Phaser imports inside the client effect and avoid SSR access to `window`, `document`, canvas, or Phaser globals.
- Scrutinize `DungeonScene.ts` changes for lifecycle cleanup, resize handling, input listener teardown, stale scene state on restart, and object destruction for sprites, zones, sounds, tweens, and timers.
- Review gameplay changes against tile-space/world-space conversions, depth sorting, collision boxes, projectile hit detection, spawn safety, and camera/UI scaling.
- When assets change, verify that spritesheet frame sizes, row ordering, keys, metadata JSON, and `assetManifest` entries stay aligned with the Phaser loaders and animations that consume them.
- For audio changes, verify `assetManifest.audio`, `preload()`, mute persistence, locked-audio behavior, looping ambience/music cleanup, and low default volumes.
- For metadata changes, ensure files referenced by `src/app/layout.tsx` are present under `public/`; it currently references `/opengraph-image.png`.
- For DOM or future HTML UI, prefer semantic elements and the existing CSS patterns in `globals.css`. For Phaser UI, review pointer zones, keyboard/mouse affordances, responsive placement, and canvas accessibility limitations.

## Known baseline mismatches

- README says `Space` or `J` fires. Current runtime binds keyboard fire to `SPACE` and supports pointer/click firing; do not block unrelated PRs solely on the missing `J` binding.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and blast. Current code also has seeker ammo and seeker projectiles unlocked by kills/time; treat seeker behavior as code-defined unless a PR intentionally updates docs.
- README describes blast as a rare late-game power-up. Current `POWERUP_CONFIG` unlocks blast earlier (`unlockKills: 2`, `unlockElapsedMs: 16000`); flag only if a PR claims to fix or relies on that documentation.

## Verification guidance

- Prefer `npm run build` and `npx tsc --noEmit --incremental false` for app/type verification. `next lint` is not reliable with the current Next version even though the script exists.
- If verification rewrites `next-env.d.ts` between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`, restore it unless the PR intentionally changes generated Next typing behavior.
- For asset-generation changes, look for exact generator invocations rather than broad wildcard scripts:
  - `python3 tools/process_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- If both `package-lock.json` and `pnpm-lock.yaml` are touched, review both ecosystems. npm overrides do not affect pnpm; pnpm overrides belong in `pnpm-workspace.yaml`.

## Managed Bugbot deployment boundaries

This file gives hosted Bugbot review context after it is merged to the default branch; it does not prove that the managed Cursor Bugbot service is enabled.

To verify managed deployment, confirm the relevant external setup: Cursor dashboard or org settings, GitHub App repository access, Admin API credentials/configuration when used, and a PR review smoke check when available. On GitHub PRs, top-level comments `cursor review` or `bugbot run` can request a review; `cursor review verbose=true` or `bugbot run verbose=true` can provide diagnostic request/log detail.
