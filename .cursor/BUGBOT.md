# Cursor Bugbot review guide

Use this repository-specific context when reviewing PRs for `fjg-thr/hobgoblin-dungeon`.

## Deployment boundary

- This file supplies review instructions only. Managed Bugbot enablement still depends on Cursor dashboard/org settings, GitHub App access, service configuration, Admin API credentials if used, and a live PR review smoke check after merge.
- Manual PR review triggers are top-level comments: `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`.
- If you cannot verify hosted service state from the PR, say so. Do not claim the managed service is enabled solely because this file exists.

## Project map

- Next.js App Router entry points live in `src/app/`. `src/app/page.tsx` renders `src/game/GameCanvas.tsx`.
- `GameCanvas` is client-only and dynamically imports Phaser plus `src/game/scenes/DungeonScene.ts`; server-side Phaser imports are high risk.
- `DungeonScene.ts` owns gameplay, HUD overlays, input, audio, pickups, enemies, projectiles, and preload calls.
- `src/game/maps/startingDungeon.ts` owns dungeon generation, tile codes, collisions, props, and spawn placement.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded visual and audio assets. `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not what Phaser loads at runtime.

## Review priorities

- Block client/server regressions: Phaser should stay behind the client boundary and browser-only APIs should not run during SSR.
- Block runtime asset breaks: every new or renamed `assetManifest` path should exist under `public/`, and metadata JSON should match frame sizes, rows, keys, and animations.
- For map/collision changes, check that tile codes remain understood by `tileAssetForCode`, `isTileBlocked`, playable-tile selection, prop blockers, spawn safety, and debug overlays.
- For gameplay changes, check invariants for ammo counts, seeker ammo, cooldowns, damage, health, pickup caps, enemy respawn timing, and game-over/reset cleanup.
- For input changes, smoke-check `WASD`/arrows, `Space` firing, pointer aim, click-to-fire, `F3`, and the sound toggle. README also mentions `J` firing, but current code binds only `Space`; only block PRs that touch controls/docs and worsen or claim to fix that mismatch.
- For audio changes, verify new sounds are preloaded from `assetManifest.audio`, respect the scene-level mute toggle, do not autoplay outside user-initiated/browser-allowed paths, and keep `audio-manifest.json` consistent when intentionally maintained.
- For DOM/metadata/UI changes, this repo does not configure Tailwind or ShadCN. Prefer semantic markup and existing `src/app/globals.css` patterns. For Phaser canvas UI, check pointer zones, keyboard/mouse affordances, responsive placement, text legibility, and scene cleanup.
- For dependency/tooling changes, scrutinize `package.json`, `package-lock.json`, and `pnpm-lock.yaml` together. Do not mix dependency hardening into unrelated gameplay or Bugbot-guidance PRs.

## Known baseline context

- `src/app/layout.tsx` references `/opengraph-image.png`, but no tracked `public/opengraph-image.png` exists. Flag PRs that add/worsen broken metadata references or claim to fix metadata without adding the asset; do not block unrelated PRs for this baseline issue.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and blast. Current runtime also has seeker ammo/projectiles unlocked after progression thresholds. Treat seeker behavior as code-defined unless a PR intentionally updates docs.
- README calls blast rare late-game, while current `POWERUP_CONFIG` unlocks blast earlier than that wording suggests. Treat this as existing documentation drift unless the PR edits powerup timing/docs.
- Build/typegen can dirty `next-env.d.ts` or create `tsconfig.tsbuildinfo`; do not commit them unless the PR intentionally changes generated typing behavior.

## Asset and audio tooling

- Existing npm scripts: `npm run process:assets`, `npm run process:death-assets`, `npm run process:combat-juice`, `npm run generate:powerups`, and `npm run generate:combat-assets`.
- Direct tools without npm aliases include: `python3 tools/process_corporate_goblin_assets.py`, `python3 tools/process_spreadsheet_brute_assets.py`, `node tools/process_gpt_tile_powerup_assets.mjs`, `node tools/process_pickup_intent_effect_assets.mjs`, `node tools/generate_polish_sprites.mjs`, `node tools/generate_audio_sfx.mjs`, and `node scripts/generate-retro-soundtrack.mjs`.
- Generated sprite/audio changes should include source/metadata/runtime manifest updates together when applicable.

## Verification expectations

- For code changes, prefer `npm run build` and `npx tsc --noEmit --incremental false`. `next lint` is not reliable with the current Next version.
- For Markdown-only Bugbot guidance changes, `git diff --check` plus diff/name-status review is sufficient.
- If local verification cannot prove a managed Bugbot deployment, report the repository-file verification separately from the external hosted-service smoke check.
