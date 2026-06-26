# Cursor Bugbot Review Guide

Use this repository guide when Cursor Bugbot reviews PRs for Hobgoblin Ruin.
This file supplies review context only. Enabling the managed Bugbot service still
requires external Cursor/GitHub configuration: Cursor dashboard or organization
settings, GitHub App access to this repository, optional Admin API/team settings,
and a live PR smoke review when available.

The guide takes effect for hosted Bugbot after it is merged to the default
branch. PRs that add or edit this file may be reviewed with older/default rules.

Manual PR triggers:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for request IDs,
  diagnostics, and log detail.

## Project shape

- Next.js App Router hosts one client-side Phaser game.
- `src/app/page.tsx` renders `GameCanvas`; `src/game/GameCanvas.tsx` dynamically
  imports Phaser and destroys the game in React cleanup.
- `src/game/scenes/DungeonScene.ts` owns gameplay, input, HUD, enemies,
  projectiles, powerups, audio, and most runtime state.
- `src/game/maps/startingDungeon.ts` provides generated room/corridor data.
- `src/game/assets/manifest.ts` is the runtime asset source of truth, including
  audio. `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- DOM styling is in `src/app/globals.css`; there is no Tailwind setup here.

## Review priorities

1. Block build, type, or runtime regressions in Next, React, Phaser, or asset
   loading. Watch client/server boundaries because Phaser must remain client-only.
2. Check Phaser lifecycle changes for duplicate game instances, event/listener
   leaks, missed cleanup on scene shutdown, resize/canvas issues, and stale input
   references.
3. Treat `DungeonScene.ts` changes as high risk. Review collision, coordinate
   transforms, depth sorting, projectile lifetime, enemy spawning, pickup
   progression, timers, pause/game-over paths, and restart state resets.
4. For map, collision, or prop changes, verify walkable tiles, blocker bounds,
   bridges/chasm edges, room connectivity, stairs visibility, and debug overlay
   accuracy.
5. For asset changes, ensure every runtime path in `assetManifest` has a matching
   file under `public/assets`, sprite sheet frame sizes match metadata, and audio
   keys loaded from `assetManifest.audio` are used consistently.
6. For generated asset/tooling PRs, keep source prompts, source images, processed
   files, metadata JSON, and scripts aligned. Use the exact owner command listed
   in the verification section for the touched asset family.
7. For DOM or metadata PRs, prefer semantic HTML and existing CSS patterns in
   `globals.css`. For Phaser UI, review pointer zones, keyboard/mouse affordances,
   responsive placement, and canvas-specific accessibility limits.

## Known baseline caveats

- README says `Space` or `J` fires, but current runtime binds keyboard firing to
  `Space`; pointer/click firing works. Do not block unrelated PRs for this drift.
- README documents regular ammo and powerups, but seeker ammo is code-defined
  progression behavior in `DungeonScene.ts`. Review seeker changes against code.
- README describes blast as rare late-game; current `POWERUP_CONFIG` unlock timing
  may differ. Treat this as existing drift unless the PR touches the behavior/docs.
- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching
  `public/opengraph-image.png` or app `opengraph-image.*` file is present in the
  current baseline. Only block PRs that touch metadata/share images and worsen or
  fail to address this area.
- `next lint` is not reliable with the current Next version. Prefer build and
  TypeScript checks below.
- `next build` or dev type generation can rewrite `next-env.d.ts` between
  `.next/types/routes.d.ts` and `.next/dev/types/routes.d.ts`; avoid committing
  that generated churn unless the PR intentionally changes Next type behavior.
- Current dependency installation may report baseline audit advisories. Do not
  block unrelated scoped PRs solely on unchanged advisories.

## Suggested verification

Run checks appropriate to the touched files:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check
```

For asset/tooling changes, also run the exact owner command for the touched
family and confirm no unrelated binary or metadata churn appears:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
node tools/generate_audio_sfx.mjs
node tools/generate_polish_sprites.mjs
node scripts/generate-retro-soundtrack.mjs
```
