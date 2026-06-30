# Cursor Bugbot Review Guide

Use this guide when reviewing pull requests for this repository. This project is a Next.js App Router prototype that mounts a browser-only Phaser 4 dungeon scene from `src/game/GameCanvas.tsx`.

## Review priorities

- Treat `src/game/GameCanvas.tsx`, `src/game/scenes/DungeonScene.ts`, `src/game/maps/startingDungeon.ts`, and `src/game/assets/manifest.ts` as the highest-risk runtime files.
- Preserve the client-only Phaser boot path: `GameCanvas` should keep the `"use client"` boundary, dynamic `import("phaser")`, one `Phaser.Game` per host, resize-safe dimensions, and cleanup with `destroy(true)`.
- For gameplay changes, check movement, camera follow, firing, enemy damage, pickups, power-ups, scoring, game-over/reset state, mute state, and debug overlay behavior together. Small state changes can break multiple Phaser update paths.
- For map/collision changes, verify tile codes, generated room/corridor connectivity, prop blocking, wall placement, bridge/chasm behavior, enemy spawn safety, and player/projectile collision radii.
- For asset changes, confirm every manifest path has a tracked file under `public/assets`, frame sizes match the sprite sheet JSON or sheet layout, animation frame ranges remain in bounds, and runtime audio comes from `assetManifest.audio` in `src/game/assets/manifest.ts`.
- For DOM or metadata changes, use existing `src/app/globals.css` patterns. This repo does not currently use Tailwind or ShadCN. Check semantic HTML, focus/keyboard affordances, responsive sizing, metadata URLs, image dimensions, and alt text.
- For Phaser UI overlays, review pointer zones, keyboard alternatives, text scaling, screen-edge placement, camera scroll factors, and canvas-specific accessibility limitations.
- Keep generated assets, lockfiles, and dependency/tooling updates out of unrelated gameplay or UI PRs unless the change intentionally requires them.

## Known baseline context

- README says `Space` or `J` fires, but the current scene binds firing to `SPACE` plus pointer/click input. Scope this mismatch to control or documentation PRs; do not block unrelated changes only for the existing drift.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and blast. The current code also unlocks seeker ammo/projectiles after progression thresholds.
- README describes blast as rare late-game, while `POWERUP_CONFIG` currently controls the actual unlock timing and weights.
- `src/app/layout.tsx` references `/opengraph-image.png`; flag PRs that add broken public references, remove referenced assets, or drift image dimensions/alt text.

## Verification guidance

Prefer scoped verification that matches the diff:

```bash
npm run build
npx tsc --noEmit --incremental false
```

`next lint` is not reliable with the current Next version. For asset or audio generator changes, verify the exact touched script instead of a broad wildcard command. Existing direct tools include:

```bash
python3 tools/process_assets.py
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
node tools/generate_brute_ammo_sprites.mjs
node tools/generate_powerup_sprites.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

## Bugbot operation notes

This file supplies repository-specific review context. Managed Cursor Bugbot enablement must still be confirmed through Cursor dashboard or organization settings, GitHub App repository access, Admin API credentials when used, service configuration, or a PR review smoke check after this file is available to Bugbot on its read branch.

Manual PR review triggers can be top-level comments of `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` to request additional troubleshooting details.
