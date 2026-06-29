# Cursor Bugbot review guidance

Use this guidance when reviewing pull requests for the Hobgoblin Ruin Prototype. This repository is a Next.js/React/TypeScript app that hosts a Phaser 4 dungeon game, so the highest-risk changes are usually in the Phaser scene, generated asset manifests, and gameplay state transitions rather than conventional DOM UI.

## Review focus

- Treat `src/game/scenes/DungeonScene.ts` as the main gameplay integration point. Review movement, aiming, projectiles, collision checks, pickups, power-ups, enemy spawning, score/life/ammo state, camera effects, audio, and scene cleanup together because many regressions cross these concerns.
- Check map and collision changes in `src/game/maps/startingDungeon.ts` against isometric tile coordinates, room/corridor generation, wall depth ordering, reachable walkable tiles, bridge/chasm behavior, and spawn placement.
- Keep `src/game/assets/manifest.ts` as the runtime asset source of truth. Every Phaser load key and path added in `DungeonScene` should have a matching manifest entry and committed asset/metadata file under `public/assets`.
- For audio changes, verify `assetManifest.audio`, the Phaser preload loop, scene-level mute behavior, and cleanup of looping ambience/theme sounds. `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when touched.
- For Next.js app-shell changes, review `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css` for semantic HTML, responsive canvas sizing, metadata correctness, and any referenced public assets such as `/opengraph-image.png`.
- For Phaser canvas UI, check pointer zones, keyboard and mouse affordances, readable overlays, responsive placement, and cleanup of interactive handlers. Do not require Tailwind patterns here; this repo currently uses Phaser objects and `globals.css`, not Tailwind.

## Known baseline context

- README says `Space` or `J` fires, but the current scene binds keyboard firing to `SPACE` plus pointer/click firing. Only block on this when a PR changes controls, input docs, or intentionally addresses the mismatch.
- Code includes seeker ammo, seeker pickups, and seeker projectiles after progression thresholds, while README documents only regular ammo. Review seeker behavior from code unless a PR is updating gameplay docs.
- README describes blast as a rare late-game power-up, while current `POWERUP_CONFIG` unlocks and weights it in code. Treat that as an existing docs/code mismatch unless the PR changes blast progression.
- `next lint` is not reliable for current Next versions in this repo. Prefer `npm run build` and `npx tsc --noEmit --incremental false` for broad verification.

## Verification suggestions

Ask authors to run the smallest command set that matches the changed surface:

```bash
npm run build
npx tsc --noEmit --incremental false
```

For generated visual or audio assets, also ask for the exact relevant generator/processor command, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_brute_ammo_sprites.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_powerup_sprites.mjs
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
node tools/generate_audio_sfx.mjs
node tools/process_pickup_intent_effect_assets.mjs
node scripts/generate-retro-soundtrack.mjs
python3 tools/process_assets.py
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
```

Generated Next route type changes can rewrite `next-env.d.ts`; scrutinize those diffs and avoid committing generated typing churn unless the PR intentionally changes Next typing behavior.

## Managed Bugbot deployment boundary

This file supplies repository-specific review context for Cursor Bugbot after it is merged to the default branch. It does not, by itself, prove that the managed Bugbot service is enabled. Deployment verification outside this repo should confirm Cursor dashboard or organization settings, GitHub App repository access, Admin API credentials when used, and a PR smoke test using a top-level `cursor review` or `bugbot run` comment. For diagnostics, `cursor review verbose=true` or `bugbot run verbose=true` can provide more request/log detail.
