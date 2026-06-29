# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype. The app is a Next.js/React shell that mounts a browser-only Phaser 4 isometric dungeon scene.

## Project shape

- App entry points live in `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, and `src/game/GameCanvas.tsx`.
- Most gameplay behavior is in `src/game/scenes/DungeonScene.ts`; map generation and collision helpers are in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts`. Treat it as the source of truth for loaded game assets, including audio.
- Generated assets live under `public/assets/**`; source prompts and helper scripts live in `ASSET_PROMPTS.md`, `tools/**`, and `scripts/**`.

## Review priorities

- For changes to `DungeonScene.ts`, inspect lifecycle cleanup, input binding, camera/scale behavior, scene restarts, pooled objects, tweens/timers, audio loops, and any state reset between runs.
- For movement, collision, projectiles, enemy AI, pickups, or power-ups, check both tile-space and world-space math. Verify edge tiles, blocked props, bridge/chasm behavior, safe spawn distances, and projectile despawn paths.
- For `startingDungeon.ts`, ensure generated maps remain connected enough for play, preserve a valid `playerStart`, enemy starts, stairs, and prop placement, and do not place blocking props on critical paths.
- For `GameCanvas.tsx`, keep Phaser imports client-only and dynamic. Avoid server-side `window`/Phaser access, duplicate game instances, or missing `destroy(true)` cleanup.
- For metadata/share changes in `src/app/layout.tsx`, verify referenced public assets exist. The current `/opengraph-image.png` reference is baseline drift if unrelated PRs do not touch metadata or share assets.
- For DOM UI changes, prefer semantic markup and existing `globals.css` patterns. This repo does not currently configure Tailwind or ShadCN.
- For Phaser canvas UI, review pointer zones, keyboard/mouse affordances, responsive placement, visual contrast, and text sizing. Canvas controls cannot rely on normal DOM accessibility semantics.

## Known baseline context

- README says `Space` or `J` fires, but runtime input currently binds shooting to `Space` plus pointer/click. Do not block unrelated PRs solely for that mismatch; flag it when reviewing input/control documentation changes.
- README documents regular ammo and power-ups, while the code also defines seeker ammo, seeker pickups, and seeker projectiles. Treat seeker behavior as code-defined unless a PR updates docs or gameplay balance.
- README describes blast as rare late-game, but `POWERUP_CONFIG` controls the actual unlock timing and weight. Review new power-up changes against code behavior first.
- `public/assets/audio/audio-manifest.json` is auxiliary; runtime audio loading comes from `assetManifest.audio`.

## Assets and generators

- When a sprite sheet, metadata JSON, or audio file changes, verify matching manifest entries, frame dimensions, row counts, animation keys, and any code that indexes frames.
- Relevant processors/generators include:
  - `python3 tools/process_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `node tools/process_corporate_goblin_assets.py`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- Do not require regeneration for unrelated code-only PRs, but require it when generated artifacts and source prompts/tooling are meant to stay in sync.

## Dependencies and verification

- The repo tracks both `package-lock.json` and `pnpm-lock.yaml`; dependency PRs should keep lockfiles synchronized with `package.json`.
- `next lint` is not reliable in this Next version. Prefer `npx tsc --noEmit --incremental false` for TypeScript checks and `npm run build` for runtime/build-sensitive changes.
- If a verification command rewrites `next-env.d.ts` between `.next/dev/types` and `.next/types`, treat it as generated churn unless the PR intentionally changes Next type generation.
- For gameplay changes, ask for a browser smoke test that starts the game, moves with WASD/arrows, aims with the pointer, fires with click/Space, collects ammo/power-ups, toggles sound, restarts after game over, and checks F3 debug overlay if touched.

## Bugbot deployment boundary

- This file gives hosted Bugbot repository-specific review guidance. It does not by itself prove the managed Bugbot service is enabled.
- Managed enablement must be confirmed outside this repo through Cursor dashboard/org settings, GitHub App repository access, Admin API credentials when used, and a PR review smoke check when available.
- Manual PR review triggers, when the GitHub integration is installed, are top-level PR comments: `cursor review` or `bugbot run`. Use `cursor review verbose=true` or `bugbot run verbose=true` for diagnostic request/log detail.
- Guidance here is most reliable after it is merged to the branch/default branch Bugbot reads; a PR adding or changing this file may not be reviewed using the new rules.
