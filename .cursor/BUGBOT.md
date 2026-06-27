# Cursor Bugbot review guide

Use this project-specific guide when reviewing pull requests for Hobgoblin Ruin Prototype, a Next.js app that mounts a Phaser 4 dungeon scene with generated pixel-art and audio assets.

## Managed-service boundary

This file gives Cursor Bugbot repository context only. It does not prove the managed service is enabled. To validate deployment, confirm Cursor dashboard or org settings, GitHub App access to `fjg-thr/hobgoblin-dungeon`, and a PR review smoke check. If those are unavailable, state that only repository guidance was verified.

## Project map

- `src/app/page.tsx`: app route that renders the game canvas.
- `src/game/GameCanvas.tsx`: client-only Phaser game lifecycle owner.
- `src/game/scenes/DungeonScene.ts`: gameplay, input, spawning, combat, UI, audio, and most tuning constants.
- `src/game/maps/startingDungeon.ts`: dungeon generation and collision-relevant tile helpers.
- `src/game/assets/manifest.ts`: runtime asset keys, paths, frame dimensions, animation metadata, and audio paths.
- `public/assets/**`: committed sprites, sprite-sheet JSON, generated source images, and audio.
- `tools/**` and `scripts/**`: asset/audio generator and processor tooling.

## Review priorities

1. **Browser/runtime safety**
   - Keep Phaser/browser globals behind client boundaries; avoid server-side imports that construct Phaser during Next.js rendering.
   - Clean up Phaser games, listeners, tweens, timers, and audio objects across React remounts, scene shutdown, restart, and game-over flows.

2. **Gameplay invariants**
   - Movement, collision, enemy navigation, and camera follow depend on isometric tile math plus simple proximity checks.
   - Player max health is 3; heart pickups restore missing hearts only.
   - Standard ammo is finite and pickup-reloaded. Seeker ammo is code-defined and unlocks after 4 kills or 30s.
   - Brutes unlock after 3 kills or 22s; avoid overwhelming early spawn pressure.
   - Power-ups are code-gated: quickshot from start, haste after 1 kill or 12s, blast after 2 kills or 16s, and ward after 10 kills or 90s.

3. **Controls and UI**
   - Current code fires with `SPACE` and pointer/click. README also mentions `J`; treat that as existing doc debt unless a PR touches controls or docs.
   - Start, how-to-play, mute, restart, and game-over interactions must remain reachable and must not trap input.
   - This repo uses `src/app/globals.css`, not Tailwind. Review DOM UI for semantic HTML and existing CSS patterns; review Phaser canvas UI for pointer zones, keyboard/mouse affordances, and responsive placement.

4. **Assets and metadata**
   - Assets referenced by `src/game/assets/manifest.ts` must exist under `public/assets/**` with matching frame sizes and JSON metadata.
   - Treat `src/game/assets/manifest.ts` as the runtime audio source of truth. `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
   - Commit regenerated binary assets only with intentional manifest or tooling changes.
   - `src/app/layout.tsx` references `/opengraph-image.png`; keep `public/opengraph-image.png` tracked.

5. **Maintainability**
   - Be cautious with per-frame allocations, tweens, and effect creation; prefer existing pools and cleanup paths.
   - `DungeonScene.ts` is large. Prefer localized changes; extract only when it reduces risk for touched behavior.
   - Keep tuning constants named and near the related system.

6. **Docs and verification**
   - Update README when controls, power-ups, limitations, asset lists, or run instructions change.
   - The committed `lint` script runs `next lint`, which is not reliable with current Next.js versions. Prefer typecheck/build evidence for code changes unless lint tooling is updated.

## Verification evidence

Ask for checks appropriate to the diff:

- `git diff --check "$(git merge-base HEAD origin/main)"..HEAD`
- `test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png`
- `npm ci`
- `npm audit --omit=dev`
- `npx tsc --noEmit --incremental false`
- `npm run build`

For gameplay changes, smoke start/how-to-play, movement, pointer/click and `SPACE` firing, pickups, damage, death/restart, mute, and responsive resize behavior.

For asset/tooling changes, run the exact relevant generator or processor, such as `npm run process:assets`, `npm run process:death-assets`, `npm run process:combat-juice`, `npm run generate:powerups`, `npm run generate:combat-assets`, `node tools/process_pickup_intent_effect_assets.mjs`, `node tools/process_gpt_tile_powerup_assets.mjs`, `node tools/generate_audio_sfx.mjs`, or `node scripts/generate-retro-soundtrack.mjs`, then confirm generated files are intentional.
